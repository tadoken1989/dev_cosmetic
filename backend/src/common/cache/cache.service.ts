/**
 * Redis Caching Service for High-Performance Operations
 * 
 * This service provides distributed caching across all PM2 instances.
 * Critical for handling 1000-2000 concurrent users.
 */

import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private redis: Redis
  private isConnected = false

  // Cache key prefixes
  private readonly PREFIX = {
    PRODUCT: 'prod:',
    ORDER: 'order:',
    CUSTOMER: 'cust:',
    INVENTORY: 'inv:',
    STATS: 'stats:',
    LOCK: 'lock:',
    RATE: 'rate:',
  }

  // Default TTLs in seconds
  private readonly TTL = {
    SHORT: 30,      // 30 seconds - for real-time data
    MEDIUM: 300,    // 5 minutes - for semi-static data
    LONG: 3600,     // 1 hour - for static data
    VERY_LONG: 86400, // 1 day
  }

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    try {
      this.redis = new Redis({
        host: this.configService.get('REDIS_HOST', 'localhost'),
        port: this.configService.get('REDIS_PORT', 6379),
        password: this.configService.get('REDIS_PASSWORD'),
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) return null
          return Math.min(times * 200, 2000)
        },
        enableReadyCheck: true,
        lazyConnect: true,
      })

      await this.redis.connect()
      this.isConnected = true
      console.log('✅ Redis connected successfully')
    } catch (error) {
      console.warn('⚠️ Redis connection failed, falling back to no-cache mode:', error.message)
      this.isConnected = false
    }
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit()
    }
  }

  // ================== BASIC OPERATIONS ==================

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) return null
    
    try {
      const data = await this.redis.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  async set(key: string, value: any, ttl: number = this.TTL.MEDIUM): Promise<void> {
    if (!this.isConnected) return
    
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value))
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected) return
    
    try {
      await this.redis.del(key)
    } catch (error) {
      console.error('Cache del error:', error)
    }
  }

  async delPattern(pattern: string): Promise<void> {
    if (!this.isConnected) return
    
    try {
      const keys = await this.redis.keys(pattern)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
    } catch (error) {
      console.error('Cache delPattern error:', error)
    }
  }

  // ================== PRODUCT CACHING ==================

  async getProduct(id: number): Promise<any | null> {
    return this.get(`${this.PREFIX.PRODUCT}${id}`)
  }

  async setProduct(id: number, data: any): Promise<void> {
    await this.set(`${this.PREFIX.PRODUCT}${id}`, data, this.TTL.MEDIUM)
  }

  async invalidateProduct(id: number): Promise<void> {
    await this.del(`${this.PREFIX.PRODUCT}${id}`)
    await this.del(`${this.PREFIX.STATS}products`) // Also invalidate product stats
  }

  async getProductList(cacheKey: string): Promise<any | null> {
    return this.get(`${this.PREFIX.PRODUCT}list:${cacheKey}`)
  }

  async setProductList(cacheKey: string, data: any): Promise<void> {
    await this.set(`${this.PREFIX.PRODUCT}list:${cacheKey}`, data, this.TTL.SHORT)
  }

  // ================== ORDER CACHING ==================

  async getOrder(id: number): Promise<any | null> {
    return this.get(`${this.PREFIX.ORDER}${id}`)
  }

  async setOrder(id: number, data: any): Promise<void> {
    // Orders are more dynamic, shorter TTL
    await this.set(`${this.PREFIX.ORDER}${id}`, data, this.TTL.SHORT)
  }

  async invalidateOrder(id: number): Promise<void> {
    await this.del(`${this.PREFIX.ORDER}${id}`)
    await this.del(`${this.PREFIX.STATS}orders`) // Also invalidate order stats
  }

  // ================== INVENTORY CACHING ==================

  async getInventory(productId: number, branchId: number = 1): Promise<any | null> {
    return this.get(`${this.PREFIX.INVENTORY}${productId}:${branchId}`)
  }

  async setInventory(productId: number, branchId: number, data: any): Promise<void> {
    // Inventory needs real-time accuracy, very short TTL
    await this.set(`${this.PREFIX.INVENTORY}${productId}:${branchId}`, data, this.TTL.SHORT)
  }

  async invalidateInventory(productId: number, branchId?: number): Promise<void> {
    if (branchId) {
      await this.del(`${this.PREFIX.INVENTORY}${productId}:${branchId}`)
    } else {
      await this.delPattern(`${this.PREFIX.INVENTORY}${productId}:*`)
    }
  }

  // ================== CUSTOMER CACHING ==================

  async getCustomer(id: number): Promise<any | null> {
    return this.get(`${this.PREFIX.CUSTOMER}${id}`)
  }

  async setCustomer(id: number, data: any): Promise<void> {
    await this.set(`${this.PREFIX.CUSTOMER}${id}`, data, this.TTL.MEDIUM)
  }

  async invalidateCustomer(id: number): Promise<void> {
    await this.del(`${this.PREFIX.CUSTOMER}${id}`)
  }

  // ================== STATS/DASHBOARD CACHING ==================

  async getStats(key: string): Promise<any | null> {
    return this.get(`${this.PREFIX.STATS}${key}`)
  }

  async setStats(key: string, data: any): Promise<void> {
    await this.set(`${this.PREFIX.STATS}${key}`, data, this.TTL.SHORT)
  }

  async getDashboardStats(): Promise<any | null> {
    return this.get(`${this.PREFIX.STATS}dashboard`)
  }

  async setDashboardStats(data: any): Promise<void> {
    await this.set(`${this.PREFIX.STATS}dashboard`, data, this.TTL.SHORT)
  }

  // ================== DISTRIBUTED LOCKING ==================

  /**
   * Acquire a distributed lock (critical for order code generation)
   * @param lockKey Unique lock identifier
   * @param ttl Lock TTL in seconds (default 30s)
   * @returns true if lock acquired, false otherwise
   */
  async acquireLock(lockKey: string, ttl: number = 30): Promise<boolean> {
    if (!this.isConnected) return true // Allow operation without Redis
    
    try {
      const key = `${this.PREFIX.LOCK}${lockKey}`
      const result = await this.redis.set(key, '1', 'EX', ttl, 'NX')
      return result === 'OK'
    } catch (error) {
      console.error('Lock acquire error:', error)
      return true // Fail-open: allow operation if Redis fails
    }
  }

  async releaseLock(lockKey: string): Promise<void> {
    if (!this.isConnected) return
    
    try {
      await this.redis.del(`${this.PREFIX.LOCK}${lockKey}`)
    } catch (error) {
      console.error('Lock release error:', error)
    }
  }

  /**
   * Execute function with distributed lock
   * Critical for preventing race conditions in order creation
   */
  async withLock<T>(lockKey: string, fn: () => Promise<T>, ttl: number = 30): Promise<T> {
    const acquired = await this.acquireLock(lockKey, ttl)
    
    if (!acquired) {
      // Wait and retry
      await new Promise(resolve => setTimeout(resolve, 100))
      return this.withLock(lockKey, fn, ttl)
    }
    
    try {
      return await fn()
    } finally {
      await this.releaseLock(lockKey)
    }
  }

  // ================== RATE LIMITING ==================

  /**
   * Check rate limit for a key
   * @param key Rate limit key (e.g., user:123:orders)
   * @param limit Max requests allowed
   * @param windowSeconds Time window in seconds
   * @returns { allowed: boolean, remaining: number, resetIn: number }
   */
  async checkRateLimit(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
    if (!this.isConnected) {
      return { allowed: true, remaining: limit, resetIn: 0 }
    }

    const rateKey = `${this.PREFIX.RATE}${key}`
    
    try {
      const multi = this.redis.multi()
      multi.incr(rateKey)
      multi.ttl(rateKey)
      const results = await multi.exec()
      
      const count = results[0][1] as number
      let ttl = results[1][1] as number
      
      // Set expiry on first request
      if (ttl === -1) {
        await this.redis.expire(rateKey, windowSeconds)
        ttl = windowSeconds
      }
      
      return {
        allowed: count <= limit,
        remaining: Math.max(0, limit - count),
        resetIn: ttl,
      }
    } catch (error) {
      console.error('Rate limit check error:', error)
      return { allowed: true, remaining: limit, resetIn: 0 }
    }
  }

  // ================== ATOMIC COUNTER ==================

  /**
   * Atomic increment for generating unique codes
   * Critical for order code generation across PM2 instances
   */
  async increment(key: string): Promise<number> {
    if (!this.isConnected) {
      throw new Error('Redis required for atomic counter')
    }
    
    return this.redis.incr(key)
  }

  /**
   * Generate unique order code atomically
   * Prevents duplicate codes across multiple PM2 instances
   */
  async generateOrderCode(prefix: string = 'SON'): Promise<string> {
    const dateKey = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const counterKey = `counter:order:${dateKey}`
    
    const count = await this.increment(counterKey)
    
    // Set expiry for counter (end of day + buffer)
    if (count === 1) {
      await this.redis.expire(counterKey, 86400 + 3600) // 25 hours
    }
    
    return `${prefix}${count.toString().padStart(6, '0')}`
  }

  // ================== HEALTH CHECK ==================

  async healthCheck(): Promise<{ status: string; latency?: number }> {
    if (!this.isConnected) {
      return { status: 'disconnected' }
    }
    
    try {
      const start = Date.now()
      await this.redis.ping()
      return { status: 'healthy', latency: Date.now() - start }
    } catch (error) {
      return { status: 'unhealthy' }
    }
  }
}
