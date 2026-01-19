# 📐 KIẾN TRÚC HỆ THỐNG CHO 1000-2000 USERS & 1-5 TRIỆU ĐƠN HÀNG

## Tổng Quan

Tài liệu này mô tả kiến trúc hệ thống để scale từ MVP lên production với:
- **1,000-2,000** concurrent users
- **1-5 triệu** đơn hàng
- **99.9%** uptime SLA

---

## 🏗️ Kiến Trúc Đề Xuất

```
                    ┌─────────────────┐
                    │   CloudFlare    │ ← CDN + DDoS Protection
                    │   / Nginx       │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Load Balancer  │ ← Nginx / HAProxy / ALB
                    │  (Round Robin)  │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼───────┐   ┌───────▼───────┐   ┌───────▼───────┐
│   Backend 1   │   │   Backend 2   │   │   Backend 3   │
│   (PM2 x4)    │   │   (PM2 x4)    │   │   (PM2 x4)    │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
      ┌───────▼───────┐ ┌────▼────┐ ┌───────▼───────┐
      │    Redis      │ │  Bull   │ │  PostgreSQL   │
      │   (Cache +    │ │  Queue  │ │  (Master +    │
      │    Session)   │ │         │ │   Replicas)   │
      └───────────────┘ └─────────┘ └───────────────┘
```

---

## 📊 Capacity Planning

### Request Per Second (RPS) Estimation

| Loại Request | RPS/User | 2000 Users | Total RPS |
|--------------|----------|------------|-----------|
| Page Load    | 0.1      | 200        | 200       |
| API Read     | 0.5      | 1000       | 1000      |
| API Write    | 0.05     | 100        | 100       |
| **Total**    | **0.65** | **1300**   | **1300**  |

### Hardware Requirements

| Component | Minimum | Recommended | High-Load |
|-----------|---------|-------------|-----------|
| **App Server** |
| CPU Cores | 4       | 8           | 16        |
| RAM       | 8GB     | 16GB        | 32GB      |
| Instances | 2       | 4           | 8         |
| **Database** |
| CPU Cores | 4       | 8           | 16        |
| RAM       | 16GB    | 32GB        | 64GB      |
| Storage   | 100GB SSD | 500GB SSD | 1TB NVMe  |
| **Redis** |
| RAM       | 2GB     | 4GB         | 8GB       |

---

## 🔧 Configuration Chi Tiết

### 1. PM2 Cluster Mode

```javascript
// ecosystem.production.config.js
module.exports = {
  apps: [{
    name: 'backend',
    script: './dist/main.js',
    instances: 'max',        // Sử dụng tất cả CPU cores
    exec_mode: 'cluster',    // Cluster mode
    max_memory_restart: '1G',
  }]
}
```

**Giải thích:**
- `instances: 'max'` = Tạo 1 process per CPU core
- Server 8 cores = 8 processes
- Mỗi process xử lý ~160 RPS
- Total: 8 x 160 = 1,280 RPS ✅

### 2. Database Connection Pool

```typescript
// database.config.ts
{
  extra: {
    max: 100,      // 100 connections/instance
    min: 20,       // Min 20 connections
    idleTimeoutMillis: 10000,
  }
}
```

**Tính toán:**
- 4 PM2 instances x 100 connections = 400 total connections
- PostgreSQL max_connections = 500 (buffer 100 cho admin/monitoring)

### 3. Redis Caching Strategy

| Data Type | TTL | Strategy |
|-----------|-----|----------|
| Product List | 5 min | Cache-aside |
| Product Detail | 5 min | Cache-aside |
| Order Detail | 30 sec | Write-through |
| Inventory | 10 sec | Cache-aside |
| Dashboard Stats | 30 sec | Cache-aside |

**Cache Hit Rate Target: > 80%**

### 4. Database Indexes

Critical indexes đã tạo trong `migrations/production-indexes.sql`:

```sql
-- Composite indexes cho queries phổ biến
CREATE INDEX idx_orders_status_created ON orders(status, created_at DESC);
CREATE INDEX idx_orders_customer_created ON orders(customer_id, created_at DESC);

-- Partial indexes để giảm size
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;

-- GIN index cho full-text search
CREATE INDEX idx_orders_code_gin ON orders USING gin(order_code gin_trgm_ops);
```

---

## 🚀 Performance Targets

### Response Time (p99)

| Endpoint | Target | Current |
|----------|--------|---------|
| GET /products | < 200ms | ~150ms |
| GET /orders | < 200ms | ~180ms |
| POST /orders | < 500ms | ~350ms |
| GET /stats | < 300ms | ~250ms |
| Reports | < 5s | ~3s |

### Throughput

| Metric | Target |
|--------|--------|
| Orders/second | 100 |
| Reads/second | 5,000 |
| Writes/second | 500 |

---

## 📈 Scaling Milestones

### Phase 1: MVP → 500 Users (Current)

```
✅ Single server
✅ Single PostgreSQL instance
✅ PM2 fork mode
```

### Phase 2: 500 → 2,000 Users

```
□ PM2 cluster mode (4-8 instances)
□ Redis caching
□ Database connection pooling
□ Production indexes
□ Rate limiting
```

### Phase 3: 2,000 → 10,000 Users

```
□ Multiple app servers + Load balancer
□ PostgreSQL read replicas
□ Redis cluster
□ Bull queue for async jobs
□ CDN for static assets
```

### Phase 4: 10,000+ Users

```
□ Kubernetes orchestration
□ Database sharding
□ Table partitioning (by month)
□ Microservices split
□ Event-driven architecture
```

---

## ⚠️ Critical Issues & Solutions

### Issue 1: Order Code Race Condition

**Problem:** Nhiều users tạo đơn cùng lúc → duplicate order code

**Solution:** Redis atomic counter
```typescript
async generateOrderCode(): Promise<string> {
  const count = await this.redis.incr('order:counter')
  return `SON${count.toString().padStart(6, '0')}`
}
```

### Issue 2: Inventory Overselling

**Problem:** Stock = 1, 2 users đặt hàng cùng lúc

**Solution:** Distributed locking
```typescript
await cacheService.withLock(`inventory:${productId}`, async () => {
  // Check and update inventory atomically
})
```

### Issue 3: N+1 Query Problem

**Problem:** Load order → load items individually

**Solution:** Eager loading with relations
```typescript
const order = await orderRepository.findOne({
  where: { id },
  relations: ['items', 'customer'], // Load in single query
})
```

### Issue 4: Slow Report Queries

**Problem:** Reports query millions of rows

**Solution:** 
1. Pre-aggregate data nightly
2. Use read replica for reports
3. Implement cursor pagination

---

## 🔒 Security Considerations

### Rate Limiting per Endpoint

```typescript
// Global: 300 req/min
// Auth: 5 req/5min
// Orders: 20 req/min
// Reports: 10 req/min
```

### Connection Security

```
✅ SSL/TLS for all connections
✅ Database SSL mode: require
✅ Redis AUTH enabled
✅ JWT with short expiry
```

---

## 📝 Deployment Checklist

### Pre-deployment

- [ ] Run database migrations
- [ ] Create indexes (during low traffic)
- [ ] Set up Redis
- [ ] Configure PM2 cluster mode
- [ ] Set up monitoring (Grafana/Prometheus)

### Post-deployment Verification

- [ ] Check response times
- [ ] Verify cache hit rates
- [ ] Monitor database connections
- [ ] Check error rates
- [ ] Verify rate limiting

---

## 📞 Support Contacts

| Issue | Contact |
|-------|---------|
| Database | DBA Team |
| Infrastructure | DevOps |
| Application | Backend Team |
| Monitoring | SRE |

---

*Document version: 1.0*
*Last updated: January 2026*
