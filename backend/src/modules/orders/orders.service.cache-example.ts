/**
 * EXAMPLE: Orders Service with Proper Cache Invalidation
 * 
 * This is an EXAMPLE implementation showing how to use cache correctly
 * without affecting order status/state accuracy.
 */

import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Order } from './entities/order.entity'
import { CacheService } from '@/common/cache/cache.service'

@Injectable()
export class OrdersServiceWithCache {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private cacheService: CacheService, // Inject cache service
  ) {}

  // ================== READ OPERATIONS (Use Cache) ==================

  /**
   * Get order by ID with caching
   * TTL: 30 seconds
   */
  async findOrderById(id: number): Promise<Order> {
    // 1️⃣ Try cache first
    const cached = await this.cacheService.getOrder(id)
    if (cached) {
      console.log(`✅ Order #${id} loaded from cache`)
      return cached
    }

    // 2️⃣ Cache miss - query database
    console.log(`❌ Cache miss - querying DB for order #${id}`)
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items'],
    })

    if (!order) {
      throw new Error(`Order #${id} not found`)
    }

    // 3️⃣ Save to cache for next time
    await this.cacheService.setOrder(id, order)
    console.log(`💾 Order #${id} saved to cache (30s TTL)`)

    return order
  }

  /**
   * Get orders list with caching
   * Cache key includes filters to avoid showing wrong data
   */
  async findAllOrders(filters: any) {
    const { page = 1, pageSize = 20, status, customerId } = filters

    // 1️⃣ Generate unique cache key for this query
    const cacheKey = `orders:list:p${page}:ps${pageSize}:s${status || 'all'}:c${customerId || 'all'}`
    
    const cached = await this.cacheService.get(cacheKey)
    if (cached) {
      console.log(`✅ Orders list loaded from cache: ${cacheKey}`)
      return cached
    }

    // 2️⃣ Query database
    const [data, total] = await this.orderRepository.findAndCount({
      where: { 
        ...(status && { status }),
        ...(customerId && { customerId }),
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    })

    const result = {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }

    // 3️⃣ Cache with short TTL (15s)
    await this.cacheService.set(cacheKey, result, 15)
    console.log(`💾 Orders list cached: ${cacheKey}`)

    return result
  }

  // ================== WRITE OPERATIONS (Invalidate Cache) ==================

  /**
   * Update order status - MUST invalidate cache
   */
  async updateOrderStatus(id: number, status: string, userId: number): Promise<Order> {
    console.log(`🔄 Updating order #${id} status to: ${status}`)

    // 1️⃣ Update database
    const order = await this.findOrderById(id)
    order.status = status
    order.updatedById = userId

    const updated = await this.orderRepository.save(order)

    // 2️⃣ CRITICAL: Invalidate all related caches
    await this.invalidateOrderCaches(id, order.customerId)

    console.log(`✅ Order #${id} status updated and caches invalidated`)
    return updated
  }

  /**
   * Add payment - MUST invalidate cache
   */
  async addPayment(id: number, amount: number, userId: number): Promise<Order> {
    console.log(`💰 Adding payment ${amount} to order #${id}`)

    const order = await this.findOrderById(id)

    // Update payment
    const currentPaid = parseFloat(String(order.paidAmount)) || 0
    const totalAmount = parseFloat(String(order.total)) || 0
    const newPaidAmount = currentPaid + amount

    order.paidAmount = newPaidAmount
    order.remainingAmount = totalAmount - newPaidAmount
    order.paymentStatus = newPaidAmount >= totalAmount ? 'paid' : 'partial'
    order.paidAt = new Date()
    order.updatedById = userId

    const updated = await this.orderRepository.save(order)

    // Invalidate caches
    await this.invalidateOrderCaches(id, order.customerId)

    console.log(`✅ Payment added and caches invalidated`)
    return updated
  }

  /**
   * Cancel order - MUST invalidate cache AND inventory
   */
  async cancelOrder(id: number, userId: number): Promise<Order> {
    console.log(`❌ Cancelling order #${id}`)

    const order = await this.findOrderById(id)

    // Cannot cancel delivered orders
    if (order.status === 'delivered') {
      throw new Error('Không thể hủy đơn hàng đã xuất kho')
    }

    order.status = 'cancelled'
    order.cancelledAt = new Date()
    order.updatedById = userId

    const updated = await this.orderRepository.save(order)

    // Invalidate order + inventory caches
    await this.invalidateOrderCaches(id, order.customerId)
    
    // Also invalidate inventory for products in this order
    for (const item of order.items || []) {
      if (item.productId) {
        await this.cacheService.invalidateInventory(item.productId)
      }
    }

    console.log(`✅ Order cancelled and all related caches invalidated`)
    return updated
  }

  // ================== CACHE INVALIDATION HELPER ==================

  /**
   * Invalidate all caches related to an order
   * Call this after ANY write operation
   */
  private async invalidateOrderCaches(orderId: number, customerId?: number): Promise<void> {
    const invalidations = [
      // 1. Specific order cache
      this.cacheService.invalidateOrder(orderId),
      
      // 2. Order list caches (all variations)
      this.cacheService.delPattern('orders:list:*'),
      
      // 3. Dashboard stats cache
      this.cacheService.del('stats:orders'),
      this.cacheService.del('stats:dashboard'),
      
      // 4. Customer-specific caches
      ...(customerId ? [
        this.cacheService.invalidateCustomer(customerId),
        this.cacheService.delPattern(`orders:list:*:c${customerId}:*`),
      ] : []),
    ]

    await Promise.all(invalidations)
    
    console.log(`🗑️  Invalidated caches for order #${orderId}`)
  }

  // ================== STATS WITH CACHING ==================

  /**
   * Get order stats with caching
   * Dashboard data can be cached for 30s
   */
  async getOrderStats() {
    // Try cache first
    const cached = await this.cacheService.getDashboardStats()
    if (cached) {
      console.log('✅ Dashboard stats from cache')
      return cached
    }

    console.log('❌ Cache miss - calculating stats')

    // Calculate stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [totalRevenue, totalOrders, totalCancelled] = await Promise.all([
      this.orderRepository
        .createQueryBuilder('order')
        .select('COALESCE(SUM(order.total), 0)', 'amount')
        .where('order.status = :status', { status: 'delivered' })
        .andWhere('order.createdAt >= :today', { today })
        .getRawOne(),
      
      this.orderRepository
        .createQueryBuilder('order')
        .select('COUNT(*)', 'count')
        .where('order.createdAt >= :today', { today })
        .getRawOne(),
      
      this.orderRepository
        .createQueryBuilder('order')
        .select('COUNT(*)', 'count')
        .where('order.status = :status', { status: 'cancelled' })
        .andWhere('order.createdAt >= :today', { today })
        .getRawOne(),
    ])

    const stats = {
      totalRevenue: parseFloat(totalRevenue?.amount || '0'),
      totalOrders: parseInt(totalOrders?.count || '0'),
      totalCancelled: parseInt(totalCancelled?.count || '0'),
      cachedAt: new Date(),
    }

    // Cache for 30 seconds
    await this.cacheService.setDashboardStats(stats)
    console.log('💾 Dashboard stats cached')

    return stats
  }
}

// ================== USAGE EXAMPLES ==================

/**
 * Example 1: User views order detail
 * 
 * First request: Query DB → Cache (50ms)
 * Next 10 requests in 30s: From cache (2ms each)
 * Savings: 10 * 48ms = 480ms
 */

/**
 * Example 2: Admin updates order status
 * 
 * 1. Update DB
 * 2. Invalidate cache ← CRITICAL!
 * 3. Next user request gets fresh data from DB
 * 4. New data cached for next requests
 * 
 * No stale data risk! ✅
 */

/**
 * Example 3: High traffic scenario
 * 
 * 100 users viewing order #123 within 30 seconds:
 * - 1 DB query (first user)
 * - 99 cache hits (other users)
 * - DB load: 1% of without cache
 * - All users see same status ✅
 * 
 * Admin updates status during this time:
 * - Cache invalidated immediately
 * - Next user gets fresh data
 * - New cache started
 */
