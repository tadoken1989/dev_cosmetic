/**
 * Cache Invalidation Decorators for Orders
 * 
 * Tự động xóa cache khi có thay đổi trạng thái đơn hàng
 */

/**
 * Decorator to invalidate order cache after method execution
 * Usage: @InvalidateOrderCache()
 */
export function InvalidateOrderCache() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      // Execute original method
      const result = await originalMethod.apply(this, args)
      
      // Extract order ID from result or arguments
      let orderId: number | undefined
      
      if (result && result.id) {
        orderId = result.id
      } else if (args[0] && typeof args[0] === 'number') {
        orderId = args[0]
      }
      
      // Invalidate cache if we have cacheService
      if (orderId && this.cacheService) {
        await this.cacheService.invalidateOrder(orderId)
        console.log(`🗑️  Cache invalidated for order #${orderId}`)
      }
      
      return result
    }

    return descriptor
  }
}

/**
 * Decorator to use cache for read operations
 * Usage: @CacheableOrder()
 */
export function CacheableOrder(ttl: number = 30) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const orderId = args[0]
      
      // Try to get from cache first
      if (this.cacheService && typeof orderId === 'number') {
        const cached = await this.cacheService.getOrder(orderId)
        if (cached) {
          console.log(`✅ Order #${orderId} from cache`)
          return cached
        }
      }
      
      // Execute original method
      const result = await originalMethod.apply(this, args)
      
      // Save to cache
      if (result && this.cacheService && typeof orderId === 'number') {
        await this.cacheService.setOrder(orderId, result)
        console.log(`💾 Order #${orderId} cached for ${ttl}s`)
      }
      
      return result
    }

    return descriptor
  }
}
