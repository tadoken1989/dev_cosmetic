#!/bin/bash

# ============================================================
# REDIS INSTALLATION AND SETUP SCRIPT
# For Ubuntu 20.04/22.04 or Debian 11/12
# ============================================================

set -e  # Exit on error

echo "🚀 Starting Redis installation..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "❌ Please run as root (sudo)"
  exit 1
fi

# ================== STEP 1: Install Redis ==================

echo "📦 Step 1/5: Installing Redis..."

# Update package list
apt-get update

# Install Redis
apt-get install -y redis-server redis-tools

echo "✅ Redis installed successfully"

# ================== STEP 2: Configure Redis ==================

echo "⚙️  Step 2/5: Configuring Redis..."

# Backup original config
cp /etc/redis/redis.conf /etc/redis/redis.conf.backup

# Copy our production config
cp ./redis.conf /etc/redis/redis.conf

# Generate random password
REDIS_PASSWORD=$(openssl rand -base64 32)

# Set password in config
sed -i "s/YourStrongPasswordHere123!@#/$REDIS_PASSWORD/" /etc/redis/redis.conf

# Save password to env file
echo "REDIS_PASSWORD=$REDIS_PASSWORD" >> .env.production
echo "REDIS_HOST=localhost" >> .env.production
echo "REDIS_PORT=6379" >> .env.production

echo "✅ Redis configured"
echo "🔐 Redis password saved to .env.production"

# ================== STEP 3: Set Permissions ==================

echo "🔒 Step 3/5: Setting permissions..."

# Create necessary directories
mkdir -p /var/lib/redis
mkdir -p /var/log/redis
mkdir -p /var/run/redis

# Set ownership
chown redis:redis /var/lib/redis
chown redis:redis /var/log/redis
chown redis:redis /var/run/redis

# Set permissions
chmod 750 /var/lib/redis
chmod 750 /var/log/redis
chmod 755 /var/run/redis

echo "✅ Permissions set"

# ================== STEP 4: Enable Redis Service ==================

echo "🔧 Step 4/5: Configuring systemd service..."

# Enable Redis to start on boot
systemctl enable redis-server

# Restart Redis with new config
systemctl restart redis-server

# Check status
sleep 2
if systemctl is-active --quiet redis-server; then
  echo "✅ Redis service is running"
else
  echo "❌ Redis service failed to start"
  journalctl -u redis-server -n 50 --no-pager
  exit 1
fi

# ================== STEP 5: Test Connection ==================

echo "🧪 Step 5/5: Testing Redis connection..."

# Test connection with password
redis-cli -a "$REDIS_PASSWORD" ping

if [ $? -eq 0 ]; then
  echo "✅ Redis connection successful"
else
  echo "❌ Redis connection failed"
  exit 1
fi

# ================== MEMORY OPTIMIZATION ==================

echo "💾 Optimizing system memory..."

# Disable Transparent Huge Pages (recommended for Redis)
echo never > /sys/kernel/mm/transparent_hugepage/enabled
echo never > /sys/kernel/mm/transparent_hugepage/defrag

# Make it persistent across reboots
cat >> /etc/rc.local <<EOF
#!/bin/sh
# Disable THP for Redis
echo never > /sys/kernel/mm/transparent_hugepage/enabled
echo never > /sys/kernel/mm/transparent_hugepage/defrag
exit 0
EOF

chmod +x /etc/rc.local

# Set kernel overcommit memory
sysctl vm.overcommit_memory=1
echo "vm.overcommit_memory=1" >> /etc/sysctl.conf

echo "✅ Memory optimization complete"

# ================== FIREWALL (Optional) ==================

echo "🔥 Configuring firewall..."

# If using UFW
if command -v ufw &> /dev/null; then
  # Only allow Redis from localhost (for security)
  # If you need external access, modify this
  # ufw allow from <your-backend-ip> to any port 6379
  echo "UFW detected - Redis is bound to localhost by default"
fi

# ================== MONITORING SETUP ==================

echo "📊 Setting up monitoring..."

# Create monitoring script
cat > /usr/local/bin/redis-monitor.sh <<'EOF'
#!/bin/bash
# Redis monitoring script

REDIS_CLI="redis-cli -a $REDIS_PASSWORD"

echo "=== Redis Status ==="
$REDIS_CLI info server | grep redis_version
$REDIS_CLI info stats | grep total_connections_received
$REDIS_CLI info memory | grep used_memory_human
$REDIS_CLI info stats | grep instantaneous_ops_per_sec
$REDIS_CLI info keyspace
EOF

chmod +x /usr/local/bin/redis-monitor.sh

# Create daily backup script
cat > /usr/local/bin/redis-backup.sh <<'EOF'
#!/bin/bash
# Redis backup script

BACKUP_DIR="/var/backups/redis"
DATE=$(date +%Y%m%d-%H%M%S)

mkdir -p $BACKUP_DIR

# Trigger Redis to save
redis-cli -a $REDIS_PASSWORD BGSAVE

# Wait for save to complete
sleep 5

# Copy dump file
cp /var/lib/redis/dump.rdb $BACKUP_DIR/dump-$DATE.rdb
cp /var/lib/redis/appendonly.aof $BACKUP_DIR/appendonly-$DATE.aof

# Keep only last 7 days
find $BACKUP_DIR -name "*.rdb" -mtime +7 -delete
find $BACKUP_DIR -name "*.aof" -mtime +7 -delete

echo "Redis backup completed: $BACKUP_DIR/dump-$DATE.rdb"
EOF

chmod +x /usr/local/bin/redis-backup.sh

# Setup daily cron job for backup
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/redis-backup.sh") | crontab -

echo "✅ Monitoring and backup scripts created"

# ================== SUMMARY ==================

echo ""
echo "════════════════════════════════════════"
echo "✅ REDIS INSTALLATION COMPLETE!"
echo "════════════════════════════════════════"
echo ""
echo "📋 Configuration:"
echo "   - Host: localhost"
echo "   - Port: 6379"
echo "   - Password: $REDIS_PASSWORD"
echo "   - Max Memory: 2GB"
echo "   - Persistence: AOF + RDB"
echo ""
echo "📝 Important Files:"
echo "   - Config: /etc/redis/redis.conf"
echo "   - Data: /var/lib/redis/"
echo "   - Logs: /var/log/redis/redis-server.log"
echo "   - Env: .env.production"
echo ""
echo "🔧 Useful Commands:"
echo "   - Status: systemctl status redis-server"
echo "   - Restart: systemctl restart redis-server"
echo "   - Logs: tail -f /var/log/redis/redis-server.log"
echo "   - Monitor: redis-cli -a <password> monitor"
echo "   - Info: /usr/local/bin/redis-monitor.sh"
echo "   - Backup: /usr/local/bin/redis-backup.sh"
echo ""
echo "🔐 IMPORTANT:"
echo "   - Redis password saved to .env.production"
echo "   - Copy this password to your .env file"
echo "   - Keep it secure!"
echo ""
echo "📚 Next Steps:"
echo "   1. Update your .env file with Redis credentials"
echo "   2. Install Node.js Redis client: npm install ioredis"
echo "   3. Restart your backend: pm2 restart all"
echo ""
echo "════════════════════════════════════════"
