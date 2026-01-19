/**
 * Production Configuration for High-Load System
 * Target: 1000-2000 concurrent users, 1-5 million orders
 * 
 * Author: System Architect (20+ years experience)
 */

import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'

// ================== DATABASE CONFIGURATION ==================

export const productionDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT', 5432),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_NAME'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  
  // ⚡ CONNECTION POOL - Critical for high concurrency
  extra: {
    // For 1000-2000 users: max = (users * avg_queries_per_request) / instances
    // With 4 PM2 instances: (2000 * 3) / 4 = 1500, but DB max is usually 200
    max: 100, // Per instance, total 400 with 4 instances
    min: 20,
    idleTimeoutMillis: 10000, // Faster connection recycling
    connectionTimeoutMillis: 5000,
    
    // Statement timeout for long queries
    statement_timeout: 30000, // 30 seconds max
    
    // Enable prepared statements for performance
    // prepareStatements: true, // Uncomment if using pgBouncer
  },
  
  // ⚡ QUERY OPTIMIZATION
  synchronize: false, // NEVER true in production
  logging: ['error', 'warn'], // Only errors in production
  maxQueryExecutionTime: 5000, // Log slow queries > 5s
  
  // ⚡ REPLICATION (Read replicas for scaling reads)
  // Uncomment when you add read replicas
  // replication: {
  //   master: {
  //     host: configService.get('DB_MASTER_HOST'),
  //     port: 5432,
  //     username: configService.get('DB_USERNAME'),
  //     password: configService.get('DB_PASSWORD'),
  //     database: configService.get('DB_NAME'),
  //   },
  //   slaves: [
  //     {
  //       host: configService.get('DB_SLAVE1_HOST'),
  //       port: 5432,
  //       username: configService.get('DB_USERNAME'),
  //       password: configService.get('DB_PASSWORD'),
  //       database: configService.get('DB_NAME'),
  //     },
  //   ],
  // },
})

// ================== REDIS CONFIGURATION ==================

export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  
  // Connection pool
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  
  // Cluster mode (for high availability)
  // cluster: [
  //   { host: 'redis-node-1', port: 6379 },
  //   { host: 'redis-node-2', port: 6379 },
  //   { host: 'redis-node-3', port: 6379 },
  // ],
}

// ================== RATE LIMITING CONFIGURATION ==================

export const rateLimitConfig = {
  // Global limit
  global: {
    ttl: 60000, // 1 minute
    limit: 300, // 300 requests per minute per IP
  },
  
  // Strict limit for write operations
  write: {
    ttl: 60000,
    limit: 50, // 50 writes per minute
  },
  
  // Very strict for order creation (prevent abuse)
  orderCreate: {
    ttl: 60000,
    limit: 20, // 20 orders per minute per user
  },
  
  // Login attempts
  auth: {
    ttl: 300000, // 5 minutes
    limit: 5, // 5 attempts per 5 minutes
  },
}

// ================== CACHING STRATEGY ==================

export const cacheConfig = {
  // Products cache (high read, low write)
  products: {
    ttl: 300, // 5 minutes
    max: 10000, // Max 10k products in cache
  },
  
  // Orders cache (medium read/write)
  orders: {
    ttl: 60, // 1 minute
    max: 5000,
  },
  
  // Inventory cache (high write, need real-time)
  inventory: {
    ttl: 10, // 10 seconds only
    max: 10000,
  },
  
  // Customer cache
  customers: {
    ttl: 300,
    max: 50000, // Expect many customers
  },
  
  // Dashboard stats cache
  stats: {
    ttl: 30, // 30 seconds
    max: 100,
  },
}

// ================== QUEUE CONFIGURATION ==================

export const queueConfig = {
  // Order processing queue
  orders: {
    name: 'order-processing',
    concurrency: 10, // Process 10 orders simultaneously
    limiter: {
      max: 100, // Max 100 jobs per second
      duration: 1000,
    },
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
  
  // Inventory sync queue
  inventory: {
    name: 'inventory-sync',
    concurrency: 5,
    attempts: 5,
  },
  
  // Notification queue
  notifications: {
    name: 'notifications',
    concurrency: 20,
  },
  
  // Report generation queue
  reports: {
    name: 'report-generation',
    concurrency: 2, // Heavy operations
  },
}

// ================== PERFORMANCE METRICS ==================

export const performanceTargets = {
  // Response time targets (p99)
  responseTime: {
    read: 200, // 200ms for reads
    write: 500, // 500ms for writes
    report: 5000, // 5s for reports
  },
  
  // Throughput targets
  throughput: {
    ordersPerSecond: 100, // 100 orders/sec peak
    readsPerSecond: 5000, // 5k reads/sec
  },
  
  // Database query limits
  queryLimits: {
    maxRows: 1000, // Never return more than 1k rows
    maxJoins: 5, // Max 5 joins per query
  },
}

// ================== SCALING RECOMMENDATIONS ==================

export const scalingRecommendations = {
  // Horizontal scaling thresholds
  autoScale: {
    minInstances: 2,
    maxInstances: 8,
    cpuThreshold: 70, // Scale up at 70% CPU
    memoryThreshold: 80, // Scale up at 80% memory
  },
  
  // Database scaling
  database: {
    // When to add read replicas
    readReplicaThreshold: 1000, // QPS
    
    // When to shard
    shardingThreshold: 10000000, // 10M orders
    
    // Partition strategy
    partitionBy: 'createdAt', // Monthly partitions for orders
  },
}
