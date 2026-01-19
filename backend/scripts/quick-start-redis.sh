#!/bin/bash

# ============================================================
# REDIS QUICK START
# Cài đặt nhanh Redis bằng Docker (1 lệnh duy nhất)
# ============================================================

set -e

echo "🚀 Redis Quick Start với Docker"
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker chưa được cài đặt"
    echo "Cài Docker: https://docs.docker.com/engine/install/"
    exit 1
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose chưa được cài đặt"
    exit 1
fi

echo "✅ Docker detected"

# Generate password
REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
REDIS_UI_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)

echo "🔐 Generating passwords..."

# Create .env file
cat > .env.redis <<EOF
REDIS_PASSWORD=$REDIS_PASSWORD
REDIS_UI_PASSWORD=$REDIS_UI_PASSWORD
EOF

echo "✅ Passwords saved to .env.redis"

# Start Redis
echo "🐳 Starting Redis container..."
docker-compose -f ../docker-compose.redis.yml --env-file .env.redis up -d

# Wait for Redis to be ready
echo "⏳ Waiting for Redis to start..."
sleep 5

# Test connection
if docker exec cosmetic-redis redis-cli -a "$REDIS_PASSWORD" ping > /dev/null 2>&1; then
    echo "✅ Redis is ready!"
else
    echo "❌ Redis failed to start"
    docker-compose -f ../docker-compose.redis.yml logs
    exit 1
fi

# Update .env file
if [ -f .env ]; then
    # Backup
    cp .env .env.backup
    
    # Remove old Redis config if exists
    sed -i '/REDIS_/d' .env
    
    # Add new Redis config
    cat >> .env <<EOF

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=$REDIS_PASSWORD
EOF
    
    echo "✅ .env file updated"
else
    echo "⚠️  .env file not found - creating new one"
    cat > .env <<EOF
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=$REDIS_PASSWORD
EOF
fi

# Summary
echo ""
echo "════════════════════════════════════════════════════════"
echo "✅ REDIS STARTED SUCCESSFULLY!"
echo "════════════════════════════════════════════════════════"
echo ""
echo "📋 Redis Info:"
echo "   Host:     localhost"
echo "   Port:     6379"
echo "   Password: $REDIS_PASSWORD"
echo ""
echo "🌐 Redis Web UI:"
echo "   URL:      http://localhost:8081"
echo "   Username: admin"
echo "   Password: $REDIS_UI_PASSWORD"
echo ""
echo "🔧 Useful Commands:"
echo "   Status:   docker-compose -f ../docker-compose.redis.yml ps"
echo "   Logs:     docker-compose -f ../docker-compose.redis.yml logs -f"
echo "   Stop:     docker-compose -f ../docker-compose.redis.yml stop"
echo "   Restart:  docker-compose -f ../docker-compose.redis.yml restart"
echo "   Remove:   docker-compose -f ../docker-compose.redis.yml down"
echo ""
echo "📝 Next Steps:"
echo "   1. Install Redis client: npm install ioredis"
echo "   2. Add CacheModule to app.module.ts"
echo "   3. Restart backend: pm2 restart all"
echo ""
echo "════════════════════════════════════════════════════════"
