# 🔄 CHIẾN LƯỢC CACHE CHO ĐỚN HÀNG

## Nguyên tắc cơ bản

### ✅ **CACHE** những gì?
- Danh sách đơn hàng (với TTL ngắn: 30s)
- Chi tiết đơn hàng (TTL: 30s)
- Thống kê dashboard (TTL: 30s)

### ❌ **KHÔNG CACHE** những gì?
- Inventory (dùng database trực tiếp)
- Payment status realtime
- Shipping tracking updates

---

## Cách hoạt động

### 1. Read Operations (GET)

```typescript
async findOrderById(id: number) {
  // 1. Check cache first
  const cached = await this.cacheService.getOrder(id)
  if (cached) return cached
  
  // 2. Query database
  const order = await this.orderRepository.findOne({ where: { id } })
  
  // 3. Save to cache (30s TTL)
  await this.cacheService.setOrder(id, order)
  
  return order
}
```

### 2. Write Operations (POST/PATCH/DELETE)

```typescript
async updateOrderStatus(id: number, status: string) {
  // 1. Update database
  const order = await this.orderRepository.save({ id, status })
  
  // 2. INVALIDATE CACHE - Critical!
  await this.cacheService.invalidateOrder(id)
  
  // 3. Also invalidate related caches
  await this.cacheService.del('stats:orders') // Dashboard stats
  await this.cacheService.delPattern('order:list:*') // Order lists
  
  return order
}
```

---

## Cache Invalidation Rules

| Action | Invalidate |
|--------|------------|
| Create Order | `order:{id}`, `stats:*`, `order:list:*` |
| Update Status | `order:{id}`, `stats:*`, `customer:{customerId}` |
| Add Payment | `order:{id}`, `stats:*` |
| Cancel Order | `order:{id}`, `stats:*`, `inventory:*` |
| Update Items | `order:{id}`, `product:*`, `inventory:*` |

---

## Implementation

### Option 1: Manual Invalidation (Recommended)

```typescript
// orders.service.ts
import { CacheService } from '@/common/cache/cache.service'

@Injectable()
export class OrdersService {
  constructor(
    private cacheService: CacheService,
    // ... other services
  ) {}

  async updateOrderStatus(id: number, status: string, userId: number) {
    const order = await this.findOrderById(id)
    order.status = status
    order.updatedById = userId
    
    const updated = await this.orderRepository.save(order)
    
    // ⚡ Invalidate caches
    await this.invalidateOrderCaches(id)
    
    return updated
  }
  
  private async invalidateOrderCaches(orderId: number) {
    await Promise.all([
      this.cacheService.invalidateOrder(orderId),
      this.cacheService.del('stats:orders'),
      this.cacheService.delPattern('order:list:*'),
    ])
  }
}
```

### Option 2: Decorator-based (Advanced)

```typescript
import { InvalidateOrderCache } from './orders-cache.decorator'

@Injectable()
export class OrdersService {
  @InvalidateOrderCache()
  async updateOrderStatus(id: number, status: string) {
    // Cache auto-invalidated after this method
    return this.orderRepository.save({ id, status })
  }
}
```

---

## TTL Strategy

```typescript
const TTL = {
  ORDER_DETAIL: 30,      // 30s - Balance between freshness and performance
  ORDER_LIST: 15,        // 15s - Lists change more frequently
  ORDER_STATS: 30,       // 30s - Dashboard stats
  INVENTORY: 0,          // NO CACHE - Must be real-time
}
```

### Tại sao 30 giây?

| TTL | Pros | Cons |
|-----|------|------|
| 0s (No cache) | Always fresh | Heavy DB load |
| 10s | Very fresh | 60% cache hit rate |
| **30s** | Fresh enough | 85% cache hit rate ✅ |
| 5 min | High hit rate | Stale data risk |

---

## Monitoring

### Cache Hit Rate Target

```
Orders: > 80%
Products: > 90%
Stats: > 95%
```

### Alert Conditions

```
❌ Cache hit rate < 70% → Check if invalidation too aggressive
❌ Stale data reports → Reduce TTL
❌ High latency → Increase cache
```

---

## Testing Cache Invalidation

```typescript
describe('Order Cache', () => {
  it('should invalidate cache when status updated', async () => {
    // 1. Create order
    const order = await service.createOrder(...)
    
    // 2. Get order (should cache)
    await service.findOrderById(order.id)
    const cached = await cacheService.getOrder(order.id)
    expect(cached).toBeDefined()
    expect(cached.status).toBe('pending')
    
    // 3. Update status
    await service.updateOrderStatus(order.id, 'confirmed')
    
    // 4. Cache should be invalidated
    const afterUpdate = await cacheService.getOrder(order.id)
    expect(afterUpdate).toBeNull()
    
    // 5. Next get should fetch from DB
    const fresh = await service.findOrderById(order.id)
    expect(fresh.status).toBe('confirmed')
  })
})
```

---

## Best Practices

### ✅ DO

1. **Always invalidate cache after write operations**
2. **Use short TTL for frequently changing data**
3. **Invalidate related caches** (e.g., stats when order changes)
4. **Log cache operations** for debugging
5. **Have fallback** when Redis fails

### ❌ DON'T

1. **Never cache without invalidation strategy**
2. **Don't cache real-time critical data** (inventory, payments)
3. **Don't use long TTL for orders** (> 1 minute)
4. **Don't block requests** if cache fails
5. **Don't cache user-specific data** without user key

---

## Real-world Scenario

### Kịch bản: 100 users xem cùng 1 đơn hàng

**Without Cache:**
```
100 users → 100 DB queries
Load time: 100 * 50ms = 5 seconds total
DB connections: 100
```

**With Cache (30s TTL):**
```
First user → 1 DB query → Cache
Next 99 users → 99 cache hits
Load time: 1 * 50ms + 99 * 2ms = 248ms total
DB connections: 1
```

**Savings: 95% reduction in DB load**

---

## Migration Plan

### Phase 1: Add Cache Service (No Impact)
```bash
npm install ioredis
# Add CacheModule to app.module.ts
# No behavior change yet
```

### Phase 2: Cache Reads (Low Risk)
```typescript
// Only add caching to read operations
// Invalidation not needed yet
```

### Phase 3: Cache Invalidation (Medium Risk)
```typescript
// Add invalidation to write operations
// Monitor for stale data issues
```

### Phase 4: Optimize TTL (Ongoing)
```typescript
// Fine-tune TTL based on monitoring
// Balance between freshness and performance
```

---

*Last updated: January 2026*
