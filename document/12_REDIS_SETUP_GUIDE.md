# 🚀 HƯỚNG DẪN CÀI ĐẶT REDIS CHO PRODUCTION

## Tổng Quan

Redis là **bắt buộc** để scale lên 1000+ users. Tài liệu này hướng dẫn 2 cách cài đặt:
1. **Cài đặt trực tiếp** trên server (Ubuntu/Debian)
2. **Docker Compose** (dễ hơn, khuyên dùng)

---

## 📋 Yêu Cầu Hệ Thống

| Thành phần | Yêu cầu |
|------------|---------|
| **OS** | Ubuntu 20.04+, Debian 11+, hoặc Docker |
| **RAM** | Tối thiểu 2GB cho Redis |
| **Disk** | 10GB SSD (cho persistence) |
| **CPU** | 1 core (2 cores khuyến nghị) |

---

## 🎯 Phương Án 1: Cài Đặt Trực Tiếp (Ubuntu/Debian)

### Bước 1: Tải và chạy script tự động

```bash
# Di chuyển vào thư mục backend
cd backend

# Cho phép thực thi script
chmod +x scripts/setup-redis.sh

# Chạy script (cần sudo)
sudo ./scripts/setup-redis.sh
```

Script sẽ tự động:
- ✅ Cài đặt Redis Server
- ✅ Cấu hình production-ready
- ✅ Tạo password ngẫu nhiên
- ✅ Tối ưu hệ thống
- ✅ Tạo backup script tự động

### Bước 2: Kiểm tra cài đặt

```bash
# Check Redis status
systemctl status redis-server

# Test connection
redis-cli -a <your-password> ping
# Output: PONG

# Check Redis info
redis-cli -a <your-password> info server
```

### Bước 3: Copy password vào .env

```bash
# Password được lưu trong .env.production
cat .env.production | grep REDIS

# Copy các dòng này vào file .env chính:
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=<your-generated-password>
```

---

## 🐳 Phương Án 2: Docker Compose (Khuyên Dùng)

### Bước 1: Tạo file .env

```bash
# Tạo file .env.redis
cat > .env.redis <<EOF
REDIS_PASSWORD=$(openssl rand -base64 32)
REDIS_UI_PASSWORD=$(openssl rand -base64 16)
EOF

# Xem password vừa tạo
cat .env.redis
```

### Bước 2: Start Redis container

```bash
# Start Redis
docker-compose -f docker-compose.redis.yml --env-file .env.redis up -d

# Check logs
docker-compose -f docker-compose.redis.yml logs -f redis
```

### Bước 3: Kiểm tra

```bash
# Test connection
docker exec cosmetic-redis redis-cli -a <password> ping
# Output: PONG

# Check info
docker exec cosmetic-redis redis-cli -a <password> info server
```

### Bước 4: Truy cập Redis Web UI (optional)

```bash
# Mở browser: http://localhost:8081
# Username: admin
# Password: <REDIS_UI_PASSWORD từ .env.redis>
```

---

## 🔧 Cấu Hình Backend

### Bước 1: Install Redis client

```bash
cd backend
npm install ioredis
```

### Bước 2: Update .env file

```bash
# backend/.env
NODE_ENV=production
PORT=3000

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_db_password
DB_NAME=cosmetic_db

# Redis (NEW)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password_here
```

### Bước 3: Update app.module.ts

```typescript
// src/app.module.ts
import { CacheModule } from './common/cache/cache.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // ... existing modules ...
    
    // Add Cache Module
    CacheModule, // ← ADD THIS
  ],
})
export class AppModule {}
```

### Bước 4: Restart backend

```bash
# Development
npm run start:dev

# Production với PM2
pm2 restart ecosystem.production.config.js
```

---

## ✅ Kiểm Tra Hoạt Động

### Test 1: Check Redis connection trong code

```bash
# Call health check endpoint
curl http://localhost:3000/health

# Hoặc check logs
tail -f logs/backend-out.log | grep "Redis"

# Should see: "✅ Redis connected successfully"
```

### Test 2: Test caching

```bash
# Request 1: Query DB (slow)
time curl http://localhost:3000/api/products/1

# Request 2: From cache (fast)
time curl http://localhost:3000/api/products/1

# Request 2 should be significantly faster
```

### Test 3: Monitor Redis

```bash
# Method 1: Redis CLI monitor
redis-cli -a <password> monitor

# Method 2: Stats
redis-cli -a <password> --stat

# Method 3: Info
redis-cli -a <password> info stats
```

---

## 📊 Monitoring & Maintenance

### Kiểm tra Redis metrics

```bash
# Memory usage
redis-cli -a <password> info memory | grep used_memory_human

# Key count
redis-cli -a <password> dbsize

# Operations per second
redis-cli -a <password> info stats | grep instantaneous_ops_per_sec

# Hit rate
redis-cli -a <password> info stats | grep keyspace_hits
redis-cli -a <password> info stats | grep keyspace_misses
```

### Backup Redis data

```bash
# Manual backup
redis-cli -a <password> BGSAVE

# Check backup
ls -lh /var/lib/redis/dump.rdb

# Auto backup (already setup by script)
# Runs daily at 2 AM via cron
```

### Clear cache (if needed)

```bash
# Clear specific keys
redis-cli -a <password> DEL "order:123"

# Clear pattern
redis-cli -a <password> --scan --pattern "order:*" | xargs redis-cli -a <password> DEL

# Clear ALL (DANGEROUS - only in dev)
# redis-cli -a <password> FLUSHALL  # DISABLED in production
```

---

## 🔒 Security Checklist

- [ ] ✅ Password đủ mạnh (32+ ký tự)
- [ ] ✅ Redis chỉ listen localhost (bind 127.0.0.1)
- [ ] ✅ Protected mode enabled
- [ ] ✅ FLUSHALL, FLUSHDB commands disabled
- [ ] ✅ Password không commit vào git
- [ ] ✅ Firewall chỉ cho phép backend access
- [ ] ✅ SSL/TLS nếu Redis ở server khác

---

## 🚨 Troubleshooting

### Issue 1: Cannot connect to Redis

```bash
# Check if Redis is running
systemctl status redis-server
# or
docker ps | grep redis

# Check logs
tail -f /var/log/redis/redis-server.log
# or
docker logs cosmetic-redis

# Check port
netstat -tulpn | grep 6379
```

### Issue 2: Authentication failed

```bash
# Verify password
cat .env | grep REDIS_PASSWORD

# Test with correct password
redis-cli -a <correct-password> ping
```

### Issue 3: Out of memory

```bash
# Check memory usage
redis-cli -a <password> info memory

# Solutions:
# 1. Increase maxmemory in redis.conf
# 2. Clear old keys
# 3. Check for memory leaks
```

### Issue 4: Slow queries

```bash
# Check slow log
redis-cli -a <password> SLOWLOG GET 10

# Monitor in real-time
redis-cli -a <password> monitor
```

---

## 📈 Performance Tuning

### Optimal Settings for 1000-2000 Users

```conf
# redis.conf

# Memory
maxmemory 2gb
maxmemory-policy allkeys-lru

# Connections
maxclients 10000
tcp-backlog 511

# Persistence (balance between performance & durability)
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec  # Good balance

# Performance
hz 10
dynamic-hz yes
activerehashing yes
```

### Linux Kernel Tuning

```bash
# Disable Transparent Huge Pages (THP)
echo never > /sys/kernel/mm/transparent_hugepage/enabled

# Overcommit memory
sysctl vm.overcommit_memory=1

# Make persistent
cat >> /etc/sysctl.conf <<EOF
vm.overcommit_memory=1
EOF
```

---

## 🔄 Upgrade Strategy

### Upgrading Redis version

```bash
# Backup first
redis-cli -a <password> BGSAVE
cp /var/lib/redis/dump.rdb /backup/

# Stop Redis
systemctl stop redis-server

# Upgrade
apt-get update
apt-get install redis-server

# Start Redis
systemctl start redis-server

# Verify
redis-cli -a <password> info server
```

---

## 💰 Cost Estimation

### Cloud Redis Services

| Provider | RAM | Price/Month | Best For |
|----------|-----|-------------|----------|
| **DigitalOcean** | 2GB | ~$15 | Small apps |
| **AWS ElastiCache** | 2GB | ~$30 | AWS users |
| **Redis Cloud** | 2GB | ~$20 | Managed |
| **Self-hosted VPS** | 2GB | ~$10 | Budget |

### Recommendation

- **< 1000 users**: Self-hosted Redis ở cùng server backend
- **1000-5000 users**: Dedicated Redis VPS
- **5000+ users**: Redis Cloud / ElastiCache với replication

---

## 📚 Additional Resources

### Documentation
- [Redis Official Docs](https://redis.io/documentation)
- [Redis Best Practices](https://redis.io/topics/admin)
- [IORedis Client](https://github.com/luin/ioredis)

### Monitoring Tools
- **RedisInsight** - Desktop app để monitor Redis
- **redis-stat** - CLI monitoring tool
- **Prometheus + Grafana** - Production monitoring

### Commands Cheatsheet

```bash
# Connection
redis-cli -h <host> -p <port> -a <password>

# Info
INFO server
INFO stats
INFO memory
INFO replication

# Keys
KEYS pattern
SCAN cursor [MATCH pattern]
TTL key
EXPIRE key seconds

# Data
GET key
SET key value
DEL key
FLUSHDB

# Monitoring
MONITOR
SLOWLOG GET 10
CLIENT LIST
```

---

## ✅ Checklist Hoàn Thành

Setup:
- [ ] Redis installed/container running
- [ ] Password configured
- [ ] Backend .env updated
- [ ] ioredis installed
- [ ] CacheModule added to app.module
- [ ] Backend restarted

Testing:
- [ ] Redis connection successful
- [ ] Cache hit/miss working
- [ ] Invalidation working
- [ ] Performance improved

Production:
- [ ] Backup script setup
- [ ] Monitoring configured
- [ ] Security hardened
- [ ] Documentation updated

---

*Last updated: January 2026*
*For support: Check logs or contact DevOps team*
