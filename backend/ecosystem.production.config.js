/**
 * PM2 Production Configuration
 * Target: 1000-2000 concurrent users
 * 
 * Hardware Requirements:
 * - CPU: 4-8 cores minimum
 * - RAM: 16GB minimum (32GB recommended)
 * - SSD: 100GB+ for database
 */

require('dotenv').config()

module.exports = {
  apps: [{
    name: 'backend-production',
    script: './dist/main.js',
    
    // ⚡ CLUSTER MODE - Critical for scaling
    instances: 'max', // Use all available CPU cores (or set specific number like 4)
    exec_mode: 'cluster',
    
    // ⚡ MEMORY MANAGEMENT
    max_memory_restart: '1G', // Restart if memory exceeds 1GB
    node_args: [
      '--max-old-space-size=1024', // 1GB heap per instance
      '--gc-interval=100', // More frequent GC
    ],
    
    // ⚡ ENVIRONMENT
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      
      // Enable cluster features
      CLUSTER_MODE: true,
      
      // Connection pool size (per instance)
      DB_POOL_MAX: 100,
      DB_POOL_MIN: 20,
      
      // Redis for session/cache sharing across instances
      REDIS_HOST: process.env.REDIS_HOST || 'localhost',
      REDIS_PORT: process.env.REDIS_PORT || 6379,
    },
    
    // ⚡ LOGGING
    error_file: './logs/backend-error.log',
    out_file: './logs/backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // ⚡ PROCESS MANAGEMENT
    autorestart: true,
    watch: false,
    
    // Graceful restart (important for zero-downtime deployments)
    kill_timeout: 5000, // 5s to gracefully shutdown
    wait_ready: true, // Wait for 'ready' signal
    listen_timeout: 10000, // 10s to startup
    
    // ⚡ LOAD BALANCING
    // PM2 uses round-robin by default in cluster mode
    // For sticky sessions (if using WebSockets), add:
    // increment_var: 'PORT',
    // instance_var: 'INSTANCE_ID',
  }],
  
  // ⚡ DEPLOYMENT CONFIGURATION
  deploy: {
    production: {
      user: 'deploy',
      host: ['server1.example.com', 'server2.example.com'], // Multiple servers
      ref: 'origin/main',
      repo: 'git@github.com:your-org/backend.git',
      path: '/var/www/backend',
      'pre-deploy-local': '',
      'post-deploy': 'npm ci && npm run build && pm2 reload ecosystem.production.config.js --env production',
      'pre-setup': '',
    },
  },
}
