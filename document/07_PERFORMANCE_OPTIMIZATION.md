# ⚡ PERFORMANCE OPTIMIZATION GUIDE

## 📋 MỤC LỤC
1. [Frontend Optimization](#frontend-optimization)
2. [Backend Optimization](#backend-optimization)
3. [Database Optimization](#database-optimization)
4. [Caching Strategy](#caching-strategy)
5. [API Optimization](#api-optimization)
6. [Image Optimization](#image-optimization)
7. [Monitoring & Metrics](#monitoring--metrics)

---

## 🎨 FRONTEND OPTIMIZATION

### 1. Code Splitting & Lazy Loading
```typescript
// Lazy load routes
const ProductListView = () => import('@/views/products/ProductListView.vue')
const ProductCreateView = () => import('@/views/products/ProductCreateView.vue')

// Lazy load components
const HeavyComponent = defineAsyncComponent(() => 
  import('@/components/HeavyComponent.vue')
)
```

### 2. Virtual Scrolling
```vue
<!-- For large lists -->
<el-virtual-list
  :data="products"
  :item-size="80"
  height="600"
  :buffer="10"
>
  <template #default="{ item }">
    <ProductCard :product="item" />
  </template>
</el-virtual-list>
```

### 3. Debounce & Throttle
```typescript
// Debounce search
import { useDebounce } from '@/composables/useDebounce'

const searchQuery = ref('')
const debouncedSearch = useDebounce(searchQuery, 300)

watch(debouncedSearch, (value) => {
  if (value) {
    searchProducts(value)
  }
})
```

### 4. Memoization
```typescript
// Computed properties (automatic memoization)
const filteredProducts = computed(() => {
  return products.value.filter(p => p.allowSale)
})

// Manual memoization for expensive operations
import { useMemo } from '@/composables/useMemo'

const expensiveCalculation = useMemo(() => {
  return heavyCalculation(data.value)
}, [data])
```

### 5. Image Optimization
```vue
<!-- Lazy load images -->
<img
  v-lazy="product.imageUrl"
  :alt="product.name"
  loading="lazy"
  decoding="async"
/>

<!-- Use WebP format -->
<picture>
  <source :srcset="product.imageWebP" type="image/webp" />
  <img :src="product.imageUrl" :alt="product.name" />
</picture>
```

### 6. Bundle Optimization
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'ui': ['element-plus'],
          'utils': ['axios', 'dayjs'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
```

---

## ⚙️ BACKEND OPTIMIZATION

### 1. Connection Pooling
```typescript
// database.config.ts
{
  extra: {
    max: 50,        // Maximum pool size
    min: 5,          // Minimum pool size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
}
```

### 2. Query Optimization
```typescript
// Use select specific fields
const products = await repository.find({
  select: ['id', 'name', 'sku', 'retailPrice'],
  where: { allowSale: true },
})

// Use query builder for complex queries
const products = await repository
  .createQueryBuilder('product')
  .select(['product.id', 'product.name', 'product.sku'])
  .leftJoinAndSelect('product.productType', 'type')
  .where('product.allowSale = :allowSale', { allowSale: true })
  .getMany()
```

### 3. Pagination
```typescript
// Always paginate large datasets
async findAll(filters: ProductFilterDto) {
  const { page = 1, pageSize = 20 } = filters
  const skip = (page - 1) * pageSize

  const [data, total] = await repository.findAndCount({
    skip,
    take: pageSize,
    order: { createdAt: 'DESC' },
  })

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}
```

### 4. Batch Operations
```typescript
// Batch insert
await repository
  .createQueryBuilder()
  .insert()
  .into(Product)
  .values(products)
  .execute()

// Batch update
await repository
  .createQueryBuilder()
  .update(Product)
  .set({ allowSale: true })
  .where('id IN (:...ids)', { ids: productIds })
  .execute()
```

### 5. Async Processing
```typescript
// Use queues for heavy operations
@Process('process-product-images')
async handleProcessImages(job: Job<{ productId: number }>) {
  const { productId } = job.data
  // Process images asynchronously
  await this.imageService.processImages(productId)
}
```

---

## 🗄️ DATABASE OPTIMIZATION

### 1. Indexing Strategy
```sql
-- Index frequently queried columns
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_sku ON products(sku) WHERE sku IS NOT NULL;
CREATE INDEX idx_products_barcode ON products(barcode) WHERE barcode IS NOT NULL;

-- Composite indexes for multi-column queries
CREATE INDEX idx_products_type_brand ON products(product_type_id, brand_id);

-- Partial indexes for filtered queries
CREATE INDEX idx_products_active ON products(created_at) 
WHERE deleted_at IS NULL AND allow_sale = true;

-- Full-text search index
CREATE INDEX idx_products_name_search ON products 
USING gin(to_tsvector('vietnamese', name));
```

### 2. Query Optimization
```sql
-- Use EXPLAIN ANALYZE to check query plans
EXPLAIN ANALYZE 
SELECT * FROM products 
WHERE name ILIKE '%kem%' 
ORDER BY created_at DESC 
LIMIT 20;

-- Optimize with proper indexes
-- Use specific columns instead of SELECT *
SELECT id, name, sku, retail_price 
FROM products 
WHERE name ILIKE '%kem%' 
ORDER BY created_at DESC 
LIMIT 20;
```

### 3. Partitioning
```sql
-- Partition large tables by date
CREATE TABLE stock_movements (
    id SERIAL,
    product_id INTEGER,
    created_at TIMESTAMP NOT NULL,
    ...
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE stock_movements_2024_01 
PARTITION OF stock_movements
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

### 4. Vacuum & Analyze
```sql
-- Regular maintenance
VACUUM ANALYZE products;
VACUUM ANALYZE inventory;
VACUUM ANALYZE orders;

-- Auto-vacuum configuration
ALTER TABLE products SET (
  autovacuum_vacuum_scale_factor = 0.1,
  autovacuum_analyze_scale_factor = 0.05
);
```

### 5. Connection Pooling (PgBouncer)
```ini
# pgbouncer.ini
[databases]
cosmetic_db = host=localhost port=5432 dbname=cosmetic_db

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
min_pool_size = 5
reserve_pool_size = 5
```

---

## 💾 CACHING STRATEGY

### 1. Redis Caching
```typescript
// Cache product list
async findAll(filters: ProductFilterDto) {
  const cacheKey = `products:list:${JSON.stringify(filters)}`
  
  // Try cache first
  const cached = await this.cacheService.get(cacheKey)
  if (cached) {
    return cached
  }

  // Fetch from database
  const data = await this.productsRepository.findAll(filters)
  
  // Cache for 5 minutes
  await this.cacheService.set(cacheKey, data, 300)
  
  return data
}

// Invalidate cache on update
async update(id: number, data: UpdateProductDto) {
  const product = await this.productsRepository.update(id, data)
  
  // Invalidate related caches
  await this.cacheService.invalidateProductCache(id)
  
  return product
}
```

### 2. Cache Patterns
```typescript
// Cache-Aside Pattern
async getProduct(id: number) {
  // 1. Check cache
  const cached = await cache.get(`product:${id}`)
  if (cached) return cached

  // 2. Fetch from database
  const product = await repository.findById(id)

  // 3. Store in cache
  await cache.set(`product:${id}`, product, 3600)

  return product
}

// Write-Through Pattern
async updateProduct(id: number, data: any) {
  // 1. Update database
  const product = await repository.update(id, data)

  // 2. Update cache
  await cache.set(`product:${id}`, product, 3600)

  return product
}
```

### 3. Cache Invalidation
```typescript
// Invalidate on related updates
async updateProduct(id: number, data: UpdateProductDto) {
  const product = await this.update(id, data)
  
  // Invalidate product cache
  await this.cacheService.del(`product:${id}`)
  
  // Invalidate list caches
  await this.cacheService.delPattern('products:list:*')
  
  // Invalidate related caches
  if (data.productTypeId) {
    await this.cacheService.del(`product-types:${data.productTypeId}`)
  }
  
  return product
}
```

---

## 🌐 API OPTIMIZATION

### 1. Response Compression
```typescript
// main.ts
import compression from 'compression'

app.use(compression())
```

### 2. Rate Limiting
```typescript
// Rate limiting middleware
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Quá nhiều requests. Vui lòng thử lại sau.',
})

app.use('/api/', limiter)
```

### 3. Request Timeout
```typescript
// Timeout interceptor
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(30000), // 30 seconds
      catchError((err) => {
        if (err instanceof TimeoutError) {
          throw new RequestTimeoutException('Request timeout')
        }
        return throwError(() => err)
      }),
    )
  }
}
```

### 4. Response Pagination
```typescript
// Always paginate list endpoints
@Get()
async findAll(@Query() filters: ProductFilterDto) {
  const result = await this.productsService.findAll(filters)
  return {
    success: true,
    data: result,
  }
}
```

---

## 🖼️ IMAGE OPTIMIZATION

### 1. Image Compression
```typescript
// Backend: Compress images on upload
import sharp from 'sharp'

async uploadImage(file: Express.Multer.File) {
  // Resize and compress
  const buffer = await sharp(file.buffer)
    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer()

  // Upload to S3
  return await this.s3Service.upload(buffer, 'products')
}
```

### 2. CDN for Images
```typescript
// Use CDN URL
const imageUrl = `https://cdn.example.com/products/${imageId}.webp`
```

### 3. Lazy Loading
```vue
<!-- Frontend: Lazy load images -->
<img
  v-lazy="product.imageUrl"
  :alt="product.name"
  loading="lazy"
/>
```

---

## 📊 MONITORING & METRICS

### 1. Performance Metrics
```typescript
// Track API response times
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now()
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start
        // Log slow queries
        if (duration > 1000) {
          this.logger.warn(`Slow query: ${duration}ms`)
        }
        // Send to metrics service
        // metrics.record('api.response_time', duration)
      }),
    )
  }
}
```

### 2. Database Query Monitoring
```typescript
// Log slow queries
{
  logging: true,
  logger: 'advanced-console',
  maxQueryExecutionTime: 1000, // Log queries > 1s
}
```

### 3. Memory Monitoring
```typescript
// Monitor memory usage
setInterval(() => {
  const usage = process.memoryUsage()
  console.log({
    rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
  })
}, 60000) // Every minute
```

---

## ✅ PERFORMANCE CHECKLIST

### Frontend
- [ ] Code splitting and lazy loading
- [ ] Virtual scrolling for large lists
- [ ] Debounce/throttle user inputs
- [ ] Image lazy loading and optimization
- [ ] Bundle size optimization
- [ ] Memoization of expensive computations
- [ ] Cache API responses

### Backend
- [ ] Connection pooling
- [ ] Query optimization
- [ ] Pagination for all list endpoints
- [ ] Batch operations
- [ ] Async processing for heavy tasks
- [ ] Response compression
- [ ] Rate limiting

### Database
- [ ] Proper indexing
- [ ] Query optimization
- [ ] Partitioning large tables
- [ ] Regular VACUUM and ANALYZE
- [ ] Connection pooling (PgBouncer)

### Caching
- [ ] Redis caching for frequently accessed data
- [ ] Cache invalidation strategy
- [ ] CDN for static assets

### Monitoring
- [ ] API response time tracking
- [ ] Database query monitoring
- [ ] Memory usage monitoring
- [ ] Error rate tracking

---

## 📝 NEXT STEPS

1. Implement code splitting
2. Setup Redis caching
3. Optimize database queries
4. Add performance monitoring
5. Setup CDN
6. Configure connection pooling
7. Implement batch operations
8. Performance testing

