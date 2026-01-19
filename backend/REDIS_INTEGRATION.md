# 🔌 KẾT NỐI BACKEND VỚI REDIS CÓ SẴN

## Tình huống
Server **đã có Redis** cài sẵn → Chỉ cần kết nối backend vào Redis đó.

---

## 📋 **BƯỚC 1: LẤY THÔNG TIN REDIS**

Hỏi admin server hoặc check:

```bash
# Check Redis đang chạy
systemctl status redis-server
# hoặc
ps aux | grep redis

# Check port
netstat -tulpn | grep redis

# Check config file
cat /etc/redis/redis.conf | grep -E "port|bind|requirepass"
```

**Thông tin cần:**
- Host: `localhost` hoặc IP nội bộ
- Port: thường là `6379`
- Password: (nếu có)

---

## 📦 **BƯỚC 2: CÀI ĐẶT CLIENT**

```bash
cd backend
npm install ioredis
```

---

## ⚙️ **BƯỚC 3: CẤU HÌNH .ENV**

```bash
# backend/.env

# Redis Configuration (thông tin từ server)
REDIS_HOST=localhost        # hoặc IP của Redis server
REDIS_PORT=6379            # port mặc định
REDIS_PASSWORD=            # để trống nếu không có password
```

**Ví dụ nếu Redis yêu cầu password:**
```
REDIS_HOST=10.0.0.5
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password_here
```

---

## 🔧 **BƯỚC 4: THÊM CACHE MODULE VÀO APP**

### File: `src/app.module.ts`

```typescript
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
// ... other imports ...

// ⬇️ THÊM DÒNG NÀY
import { CacheModule } from './common/cache/cache.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    
    // ... các modules khác ...
    
    CacheModule, // ⬅️ THÊM MODULE NÀY
  ],
})
export class AppModule {}
```

---

## 🧪 **BƯỚC 5: TEST KẾT NỐI**

### Option 1: Thêm health check endpoint

Tạo file `src/app.controller.ts` (hoặc update nếu đã có):

```typescript
import { Controller, Get } from '@nestjs/common'
import { CacheService } from './common/cache/cache.service'

@Controller()
export class AppController {
  constructor(private cacheService: CacheService) {}

  @Get('health')
  async health() {
    const redis = await this.cacheService.healthCheck()
    return {
      status: 'ok',
      timestamp: new Date(),
      redis,
    }
  }
}
```

### Option 2: Check logs khi start

```bash
npm run start:dev

# Logs should show:
# ✅ Redis connected successfully
# hoặc
# ⚠️ Redis connection failed, falling back to no-cache mode
```

---

## 🚀 **BƯỚC 6: SỬ DỤNG CACHE (Optional)**

Cache đã **tự động hoạt động** nếu bạn update OrdersService:

### Update `src/modules/orders/orders.service.ts`:

```typescript
import { CacheService } from '@/common/cache/cache.service'

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    // ... other services
    
    private cacheService: CacheService, // ⬅️ INJECT
  ) {}

  // Example: Cache order detail
  async findOrderById(id: number) {
    // 1. Try cache
    const cached = await this.cacheService.getOrder(id)
    if (cached) return cached

    // 2. Query DB
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items'],
    })

    // 3. Save to cache
    await this.cacheService.setOrder(id, order)
    
    return order
  }

  // IMPORTANT: Invalidate cache on update
  async updateOrderStatus(id: number, status: string, userId: number) {
    const order = await this.findOrderById(id)
    order.status = status
    
    await this.orderRepository.save(order)
    
    // ⬇️ XÓA CACHE
    await this.cacheService.invalidateOrder(id)
    
    return order
  }
}
```

---

## ✅ **KIỂM TRA HOẠT ĐỘNG**

### Test 1: Check health endpoint
```bash
curl http://localhost:3000/health

# Response:
# {
#   "status": "ok",
#   "redis": {
#     "status": "healthy",
#     "latency": 2
#   }
# }
```

### Test 2: Monitor Redis
```bash
# Trên server Redis
redis-cli monitor

# Chạy backend → Sẽ thấy commands như:
# "GET" "order:123"
# "SETEX" "order:123" "30" "..."
```

### Test 3: Check performance
```bash
# Request lần 1 (DB query)
time curl http://localhost:3000/api/orders/1

# Request lần 2 (Cache hit - should be faster)
time curl http://localhost:3000/api/orders/1
```

---

## 🔍 **TROUBLESHOOTING**

### Lỗi: Cannot connect to Redis

**Check 1: Redis có đang chạy không?**
```bash
redis-cli ping
# Should return: PONG
```

**Check 2: Host/Port đúng chưa?**
```bash
# Check Redis listening port
netstat -tulpn | grep redis
```

**Check 3: Password đúng chưa?**
```bash
redis-cli -a <password> ping
```

**Check 4: Firewall?**
```bash
# Nếu Redis ở server khác, check firewall
telnet <redis-host> 6379
```

### Lỗi: Authentication failed

```bash
# Check password trong config
cat /etc/redis/redis.conf | grep requirepass

# Update .env với password đúng
REDIS_PASSWORD=correct_password_here
```

### Redis hoạt động nhưng cache không work

**Check logs:**
```bash
# Backend logs
tail -f logs/backend-out.log | grep -i cache

# Redis logs
tail -f /var/log/redis/redis-server.log
```

**Manual test:**
```bash
redis-cli -a <password>
> SET test "hello"
> GET test
> DEL test
```

---

## 📊 **MONITORING**

### Check cache hit rate
```bash
redis-cli -a <password> info stats | grep keyspace_hits
redis-cli -a <password> info stats | grep keyspace_misses

# Calculate hit rate:
# hit_rate = hits / (hits + misses)
# Target: > 80%
```

### Check memory usage
```bash
redis-cli -a <password> info memory | grep used_memory_human
```

### Check connected clients
```bash
redis-cli -a <password> client list
```

---

## 🎛️ **TÙY CHỈNH CẤU HÌNH (Optional)**

Nếu cần thay đổi TTL mặc định, sửa trong `src/common/cache/cache.service.ts`:

```typescript
// Default TTLs in seconds
private readonly TTL = {
  SHORT: 10,      // ⬅️ Thay đổi từ 30 → 10 nếu cần real-time hơn
  MEDIUM: 300,    // 5 minutes
  LONG: 3600,     // 1 hour
}
```

---

## ⚠️ **LƯU Ý QUAN TRỌNG**

### 1. Không cache dữ liệu nhạy cảm
```typescript
// ❌ DON'T cache:
- User passwords
- Payment info
- Personal data (unless encrypted)

// ✅ DO cache:
- Product lists
- Order lists (with short TTL)
- Dashboard stats
- Public data
```

### 2. Luôn invalidate cache sau khi update
```typescript
// ✅ ALWAYS do this:
async updateOrder(id, data) {
  await this.orderRepository.save(...)
  await this.cacheService.invalidateOrder(id) // ⬅️ CRITICAL
}
```

### 3. Fallback khi Redis down
Code đã xử lý tự động:
```typescript
// Nếu Redis down → Vẫn hoạt động, chỉ chậm hơn
// Check logs: "⚠️ Redis connection failed, falling back to no-cache mode"
```

---

## 🚀 **ENABLE CACHE CHO TOÀN BỘ APP**

### Products
```typescript
// src/modules/products/products.service.ts
constructor(private cacheService: CacheService) {}

async findAll() {
  const cached = await this.cacheService.get('products:all')
  if (cached) return cached
  
  const products = await this.productRepository.find()
  await this.cacheService.set('products:all', products, 300)
  return products
}
```

### Customers
```typescript
async findById(id: number) {
  const cached = await this.cacheService.getCustomer(id)
  if (cached) return cached
  
  const customer = await this.customerRepository.findOne({ where: { id } })
  await this.cacheService.setCustomer(id, customer)
  return customer
}
```

### Stats/Dashboard
```typescript
async getDashboardStats() {
  const cached = await this.cacheService.getDashboardStats()
  if (cached) return cached
  
  const stats = await this.calculateStats()
  await this.cacheService.setDashboardStats(stats)
  return stats
}
```

---

## ✅ **CHECKLIST**

Setup:
- [ ] Lấy được thông tin Redis (host, port, password)
- [ ] `npm install ioredis` thành công
- [ ] Update `.env` với thông tin Redis
- [ ] Thêm `CacheModule` vào `app.module.ts`
- [ ] Restart backend

Testing:
- [ ] Health check endpoint trả về Redis healthy
- [ ] Logs hiển thị "Redis connected successfully"
- [ ] Cache hit/miss hoạt động
- [ ] Performance cải thiện (request lần 2 nhanh hơn)

Production:
- [ ] Monitor cache hit rate (target > 80%)
- [ ] Check memory usage không vượt giới hạn
- [ ] Invalidation working correctly
- [ ] No stale data issues

---

## 📞 **HỖ TRỢ**

Nếu gặp vấn đề:
1. Check logs: `tail -f logs/backend-out.log`
2. Check Redis: `redis-cli ping`
3. Test connection: `curl http://localhost:3000/health`
4. Monitor: `redis-cli monitor`

---

*Tóm tắt: Server có Redis sẵn → Chỉ cần npm install ioredis + config .env + restart backend = DONE!*
