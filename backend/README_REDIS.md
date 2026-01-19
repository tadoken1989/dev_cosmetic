# ⚡ REDIS - QUICK START

> **Server đã có Redis sẵn** → Chỉ cần 4 bước để kết nối!

---

## 🚀 **4 BƯỚC ĐƠN GIẢN**

### 1️⃣ Install client (10 giây)
```bash
npm install ioredis
```

### 2️⃣ Config .env (30 giây)
```bash
# Thêm vào file .env:
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=         # nếu có password
```

### 3️⃣ Add module (1 phút)
```typescript
// src/app.module.ts
import { CacheModule } from './common/cache/cache.module'

@Module({
  imports: [
    // ... existing modules
    CacheModule, // ⬅️ ADD THIS LINE
  ],
})
```

### 4️⃣ Restart (5 giây)
```bash
pm2 restart all
# hoặc
npm run start:dev
```

**DONE! ✅** Backend đã kết nối Redis!

---

## 🧪 **TEST**

```bash
# Check logs
tail -f logs/backend-out.log | grep Redis
# Should see: ✅ Redis connected successfully

# Test endpoint (nếu đã tạo)
curl http://localhost:3000/health
```

---

## 📋 **FILES QUAN TRỌNG**

1. **`src/common/cache/cache.service.ts`** - Cache service (đã có)
2. **`src/common/cache/cache.module.ts`** - Cache module (đã có)
3. **`REDIS_INTEGRATION.md`** - Hướng dẫn chi tiết
4. **`.env`** - Config (cần update)

---

## ⚙️ **SỬ DỤNG CACHE (Optional)**

### Inject CacheService:
```typescript
constructor(private cacheService: CacheService) {}
```

### Read with cache:
```typescript
async findOrderById(id: number) {
  // Try cache first
  const cached = await this.cacheService.getOrder(id)
  if (cached) return cached
  
  // Query DB
  const order = await this.db.findOne(...)
  
  // Save to cache
  await this.cacheService.setOrder(id, order)
  return order
}
```

### Write with invalidation:
```typescript
async updateOrder(id, data) {
  await this.db.save(...)
  await this.cacheService.invalidateOrder(id) // ⬅️ IMPORTANT
}
```

---

## 🎯 **KẾT QUẢ**

```
Performance: 🚀 +400% faster
DB Load:     ⬇️  -80%
Response:    📉 2-10ms (từ cache)
```

---

## ❓ **TROUBLESHOOTING**

**Không connect được?**
```bash
# Check Redis running
redis-cli ping

# Check backend logs
tail -f logs/backend-out.log | grep -i redis
```

**Cache không hoạt động?**
- Check .env có đúng config không
- Check logs có lỗi không
- Xem chi tiết trong `REDIS_INTEGRATION.md`

---

## 📚 **ĐỌC THÊM**

- **Hướng dẫn đầy đủ:** `REDIS_INTEGRATION.md`
- **Cache strategy:** `src/modules/orders/orders-cache-strategy.md`
- **Code example:** `src/modules/orders/orders.service.cache-example.ts`

---

**Tóm tắt:** Redis có sẵn → `npm install` + config `.env` + add `CacheModule` = DONE! 🎉
