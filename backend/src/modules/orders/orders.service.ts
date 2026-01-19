import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Between, Like } from 'typeorm'
import { Order } from './entities/order.entity'
import { OrderItem } from './entities/order-item.entity'
import { OrderReturn } from './entities/order-return.entity'
import { InventoryService } from '../inventory/inventory.service'
import { CustomersService } from '../customers/customers.service'

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(OrderReturn)
    private readonly orderReturnRepository: Repository<OrderReturn>,
    @Inject(forwardRef(() => InventoryService))
    private readonly inventoryService: InventoryService,
    private readonly customersService: CustomersService,
  ) {}

  // ================== ORDERS ==================

  async createOrder(data: Partial<Order> & { items: any[] }, userId: number) {
    // Generate order code and packaging code
    const orderCode = await this.generateOrderCode()
    const packagingCode = await this.generatePackagingCode()
    
    // Extract items from data
    const { items: itemsInput, ...orderData } = data
    
    // Calculate totals
    let subtotal = 0
    const items = (itemsInput || []).map((item) => {
      const itemTotal = (item.unitPrice - (item.discount || 0)) * item.quantity
      subtotal += itemTotal
      return {
        ...item,
        total: itemTotal,
      }
    })

    const discount = orderData.discount || 0
    const shippingFee = orderData.shippingFee || 0
    const total = subtotal - discount + shippingFee
    const paidAmount = orderData.paidAmount || 0
    const remainingAmount = total - paidAmount

    const order = this.orderRepository.create({
      ...orderData,
      orderCode,
      packagingCode,
      packagingStatus: 'packed', // Đóng gói ngay khi tạo đơn
      shippingMethod: orderData.shippingMethod || 'pickup', // Default pickup
      subtotal,
      total,
      paidAmount,
      remainingAmount,
      paymentStatus: paidAmount >= total ? 'paid' : (paidAmount > 0 ? 'partial' : 'unpaid'),
      status: 'confirmed',
      confirmedAt: new Date(),
      createdById: userId,
      updatedById: userId,
    })

    const savedOrder = await this.orderRepository.save(order)

    // Save order items and reserve inventory
    if (items.length > 0) {
      for (const item of items) {
        const orderItem = this.orderItemRepository.create({
          ...item,
          orderId: savedOrder.id,
        })
        await this.orderItemRepository.save(orderItem)
        
        // Reserve stock when creating order
        if (item.productId) {
          try {
            await this.inventoryService.reserveStock(
              item.productId,
              savedOrder.branchId || 1,
              item.quantity,
            )
          } catch (error) {
            console.error('Failed to reserve stock:', error)
            // Don't throw - don't block order creation
          }
        }
      }
    }

    // Update customer order statistics
    if (savedOrder.customerId) {
      try {
        await this.customersService.updateOrderStats(savedOrder.customerId, parseFloat(String(total)))
      } catch (error) {
        console.error('Failed to update customer stats:', error)
      }
    }

    return this.findOrderById(savedOrder.id)
  }

  async findAllOrders(filters: {
    page?: number
    pageSize?: number
    search?: string
    status?: string
    paymentStatus?: string
    startDate?: string
    endDate?: string
    customerId?: number
    staffId?: number
  }) {
    const {
      page = 1,
      pageSize = 20,
      search,
      status,
      paymentStatus,
      startDate,
      endDate,
      customerId,
      staffId,
    } = filters

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .orderBy('order.createdAt', 'DESC')

    if (search) {
      queryBuilder.andWhere(
        '(order.orderCode ILIKE :search OR order.customerName ILIKE :search OR order.customerPhone ILIKE :search)',
        { search: `%${search}%` },
      )
    }

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status })
    }

    if (paymentStatus) {
      queryBuilder.andWhere('order.paymentStatus = :paymentStatus', { paymentStatus })
    }

    if (customerId) {
      queryBuilder.andWhere('order.customerId = :customerId', { customerId })
    }

    if (staffId) {
      queryBuilder.andWhere('order.staffId = :staffId', { staffId })
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('order.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
    }

    const skip = (page - 1) * pageSize
    queryBuilder.skip(skip).take(pageSize)

    const [data, total] = await queryBuilder.getManyAndCount()

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }

  async findOrderById(id: number) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items'],
    })
    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng #${id}`)
    }
    return order
  }

  async findOrderByCode(orderCode: string) {
    const order = await this.orderRepository.findOne({
      where: { orderCode },
      relations: ['items'],
    })
    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng ${orderCode}`)
    }
    return order
  }

  async updateOrder(id: number, data: Partial<Order> & { items?: any[] }, userId: number) {
    const order = await this.findOrderById(id)
    const previousStatus = order.status
    
    // Extract items from data
    const { items: itemsInput, ...orderData } = data as any
    
    Object.assign(order, orderData, { updatedById: userId })
    
    // Recalculate if items changed
    if (itemsInput && itemsInput.length > 0) {
      // Delete existing items
      await this.orderItemRepository.delete({ orderId: id })
      
      // Create new items
      let subtotal = 0
      const itemsData = itemsInput.map((item: any) => {
        const itemTotal = (item.unitPrice - (item.discount || 0)) * item.quantity
        subtotal += itemTotal
        return {
          ...item,
          orderId: id,
          total: itemTotal,
        }
      })
      
      // Save items one by one to avoid type issues
      for (const itemData of itemsData) {
        const orderItem = this.orderItemRepository.create(itemData)
        await this.orderItemRepository.save(orderItem)
      }
      
      order.subtotal = subtotal
      order.total = subtotal - (order.discount || 0) + (order.shippingFee || 0)
      order.remainingAmount = order.total - order.paidAmount
    }

    // Handle inventory when order is delivered
    if (data.status === 'delivered' && previousStatus !== 'delivered') {
      await this.deductInventory(order)
    }

    // Handle inventory when order is cancelled
    if (data.status === 'cancelled' && previousStatus !== 'cancelled') {
      await this.restoreInventory(order)
    }

    return this.orderRepository.save(order)
  }

  private async deductInventory(order: Order) {
    try {
      const items = await this.orderItemRepository.find({ where: { orderId: order.id } })
      
      for (const item of items) {
        if (item.productId) {
          // Commit stock: quantity -= qty, inTransaction -= qty
          await this.inventoryService.commitStock(
            item.productId,
            order.branchId || 1,
            item.quantity,
          )
        }
      }
    } catch (error) {
      console.error('Failed to deduct inventory:', error)
      // Don't throw - don't block order update
    }
  }

  private async restoreInventory(order: Order) {
    try {
      const items = await this.orderItemRepository.find({ where: { orderId: order.id } })
      
      for (const item of items) {
        if (item.productId) {
          // Release stock: available += qty, inTransaction -= qty
          await this.inventoryService.releaseStock(
            item.productId,
            order.branchId || 1,
            item.quantity,
          )
        }
      }
    } catch (error) {
      console.error('Failed to restore inventory:', error)
      // Don't throw - don't block order update
    }
  }

  async updateOrderStatus(id: number, status: string, userId: number) {
    const order = await this.findOrderById(id)
    const previousStatus = order.status
    
    // Set timestamps based on status
    const now = new Date()
    order.status = status
    order.updatedById = userId
    
    switch (status) {
      case 'confirmed':
        order.confirmedAt = now
        break
      case 'packing':
        if (!order.confirmedAt) order.confirmedAt = now
        order.packingAt = now
        break
      case 'shipping':
        if (!order.confirmedAt) order.confirmedAt = now
        if (!order.packingAt) order.packingAt = now
        order.shippedAt = now
        break
      case 'delivered':
        // Set all intermediate timestamps if not set (for direct completion)
        if (!order.confirmedAt) order.confirmedAt = now
        if (!order.packingAt) order.packingAt = now
        if (!order.shippedAt) order.shippedAt = now
        order.deliveredAt = now
        break
      case 'cancelled':
        order.cancelledAt = now
        break
    }

    const savedOrder = await this.orderRepository.save(order)

    // Handle inventory deduction when order is delivered (exported from warehouse)
    if (status === 'delivered' && previousStatus !== 'delivered') {
      await this.deductInventory(savedOrder)
    }

    // Handle inventory restoration when order is cancelled
    if (status === 'cancelled' && previousStatus !== 'cancelled') {
      await this.restoreInventory(savedOrder)
    }

    return savedOrder
  }

  async addPayment(id: number, amount: number, userId: number) {
    const order = await this.findOrderById(id)
    
    // Parse decimal values (PostgreSQL returns decimals as strings)
    const currentPaid = parseFloat(String(order.paidAmount)) || 0
    const totalAmount = parseFloat(String(order.total)) || 0
    
    // Calculate new payment amounts
    const newPaidAmount = currentPaid + amount
    const newRemainingAmount = totalAmount - newPaidAmount
    const newPaymentStatus = newPaidAmount >= totalAmount ? 'paid' : 'partial'
    
    // Update order
    order.paidAmount = newPaidAmount
    order.remainingAmount = newRemainingAmount
    order.paymentStatus = newPaymentStatus
    order.updatedById = userId

    return this.orderRepository.save(order)
  }

  async cancelOrder(id: number, userId: number) {
    const order = await this.findOrderById(id)
    
    // Cannot cancel orders that have been delivered (stock already deducted)
    if (order.status === 'delivered') {
      throw new Error('Không thể hủy đơn hàng đã xuất kho')
    }
    
    return this.updateOrderStatus(id, 'cancelled', userId)
  }

  private async generateOrderCode(): Promise<string> {
    const prefix = 'SON'
    const today = new Date()
    const dateStr = today.toISOString().slice(2, 10).replace(/-/g, '')
    
    // Find the last order of today
    const lastOrder = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.orderCode LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('order.id', 'DESC')
      .getOne()

    let sequence = 1
    if (lastOrder) {
      const lastCode = lastOrder.orderCode
      const lastNum = parseInt(lastCode.replace(prefix, ''), 10)
      if (!isNaN(lastNum)) {
        sequence = lastNum + 1
      }
    }

    return `${prefix}${sequence.toString().padStart(5, '0')}`
  }

  private async generatePackagingCode(): Promise<string> {
    const prefix = 'FUN'
    
    const lastOrder = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.packagingCode LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('order.id', 'DESC')
      .getOne()

    let sequence = 1
    if (lastOrder && lastOrder.packagingCode) {
      const lastCode = lastOrder.packagingCode
      const lastNum = parseInt(lastCode.replace(prefix, ''), 10)
      if (!isNaN(lastNum)) {
        sequence = lastNum + 1
      }
    }

    return `${prefix}${sequence.toString().padStart(5, '0')}`
  }

  // ================== ORDER RETURNS ==================

  async createReturn(data: Partial<OrderReturn>, userId: number) {
    const order = await this.findOrderById(data.orderId)
    
    const returnCode = await this.generateReturnCode()
    
    const orderReturn = this.orderReturnRepository.create({
      ...data,
      returnCode,
      orderCode: order.orderCode,
      customerName: order.customerName,
      customerId: order.customerId,
      createdById: userId,
    })

    return this.orderReturnRepository.save(orderReturn)
  }

  async findAllReturns(filters: {
    page?: number
    pageSize?: number
    search?: string
    status?: string
    startDate?: string
    endDate?: string
  }) {
    const {
      page = 1,
      pageSize = 20,
      search,
      status,
      startDate,
      endDate,
    } = filters

    const queryBuilder = this.orderReturnRepository
      .createQueryBuilder('return')
      .leftJoinAndSelect('return.order', 'order')
      .orderBy('return.createdAt', 'DESC')

    if (search) {
      queryBuilder.andWhere(
        '(return.returnCode ILIKE :search OR return.orderCode ILIKE :search OR return.customerName ILIKE :search)',
        { search: `%${search}%` },
      )
    }

    if (status) {
      queryBuilder.andWhere('return.status = :status', { status })
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('return.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
    }

    const skip = (page - 1) * pageSize
    queryBuilder.skip(skip).take(pageSize)

    const [data, total] = await queryBuilder.getManyAndCount()

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }

  async findReturnById(id: number) {
    const orderReturn = await this.orderReturnRepository.findOne({
      where: { id },
      relations: ['order'],
    })
    if (!orderReturn) {
      throw new NotFoundException(`Không tìm thấy đơn trả hàng #${id}`)
    }
    return orderReturn
  }

  async updateReturnStatus(id: number, status: string, userId: number) {
    const orderReturn = await this.findReturnById(id)
    
    orderReturn.status = status
    
    if (status === 'received') {
      orderReturn.receivedAt = new Date()
    } else if (status === 'refunded') {
      orderReturn.refundedAt = new Date()
      orderReturn.isRefunded = true
    }

    return this.orderReturnRepository.save(orderReturn)
  }

  private async generateReturnCode(): Promise<string> {
    const prefix = 'SRN'
    
    const lastReturn = await this.orderReturnRepository
      .createQueryBuilder('return')
      .where('return.returnCode LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('return.id', 'DESC')
      .getOne()

    let sequence = 1
    if (lastReturn) {
      const lastCode = lastReturn.returnCode
      const lastNum = parseInt(lastCode.replace(prefix, ''), 10)
      if (!isNaN(lastNum)) {
        sequence = lastNum + 1
      }
    }

    return `${prefix}${sequence.toString().padStart(5, '0')}`
  }

  // ================== STATISTICS ==================

  async getOrderStats() {
    // Today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Total revenue today (delivered orders)
    const revenueResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('COALESCE(SUM(order.total), 0)', 'amount')
      .where('order.status = :status', { status: 'delivered' })
      .andWhere('order.createdAt >= :today', { today })
      .andWhere('order.createdAt < :tomorrow', { tomorrow })
      .getRawOne()

    // Total new orders today  
    const newOrdersResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('COUNT(*)', 'count')
      .where('order.createdAt >= :today', { today })
      .andWhere('order.createdAt < :tomorrow', { tomorrow })
      .getRawOne()

    // Total returns today
    const returnsResult = await this.orderReturnRepository
      .createQueryBuilder('return')
      .select('COUNT(*)', 'count')
      .where('return.createdAt >= :today', { today })
      .andWhere('return.createdAt < :tomorrow', { tomorrow })
      .getRawOne()

    // Total cancelled orders today
    const cancelledResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('COUNT(*)', 'count')
      .where('order.status = :status', { status: 'cancelled' })
      .andWhere('order.createdAt >= :today', { today })
      .andWhere('order.createdAt < :tomorrow', { tomorrow })
      .getRawOne()

    // Chờ duyệt: status = pending
    const pendingResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('COUNT(*)', 'count')
      .addSelect('COALESCE(SUM(order.total), 0)', 'amount')
      .where('order.status = :status', { status: 'pending' })
      .getRawOne()
    
    // Chờ thanh toán: paymentStatus = unpaid AND status NOT cancelled
    const waitingPaymentResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('COUNT(*)', 'count')
      .addSelect('COALESCE(SUM(order.total), 0)', 'amount')
      .where('order.paymentStatus = :ps', { ps: 'unpaid' })
      .andWhere('order.status != :cancelled', { cancelled: 'cancelled' })
      .getRawOne()
    
    // Chờ đóng gói: packagingStatus = pending OR cancelled AND status = confirmed
    const packingResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('COUNT(*)', 'count')
      .addSelect('COALESCE(SUM(order.total), 0)', 'amount')
      .where('order.status = :status', { status: 'confirmed' })
      .andWhere('(order.packagingStatus = :ps1 OR order.packagingStatus = :ps2)', { ps1: 'pending', ps2: 'cancelled' })
      .getRawOne()
    
    // Chờ lấy hàng: packagingStatus = packed AND status = confirmed
    const pickupResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('COUNT(*)', 'count')
      .addSelect('COALESCE(SUM(order.total), 0)', 'amount')
      .where('order.status = :status', { status: 'confirmed' })
      .andWhere('order.packagingStatus = :ps', { ps: 'packed' })
      .getRawOne()
    
    // Đang giao hàng: status = shipping
    const shippingResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('COUNT(*)', 'count')
      .addSelect('COALESCE(SUM(order.total), 0)', 'amount')
      .where('order.status = :status', { status: 'shipping' })
      .getRawOne()
    
    // Chờ giao lại: status = reship (if any)
    const reshipResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('COUNT(*)', 'count')
      .addSelect('COALESCE(SUM(order.total), 0)', 'amount')
      .where('order.status = :status', { status: 'reship' })
      .getRawOne()
      .catch(() => ({ count: 0, amount: 0 }))
    
    return {
      // Today stats
      totalRevenue: parseFloat(revenueResult?.amount || '0'),
      totalOrders: parseInt(newOrdersResult?.count || '0'),
      totalReturns: parseInt(returnsResult?.count || '0'),
      totalCancelled: parseInt(cancelledResult?.count || '0'),
      // Pending stats
      pending: parseInt(pendingResult?.count || '0'),
      pendingAmount: parseFloat(pendingResult?.amount || '0'),
      waitingPayment: parseInt(waitingPaymentResult?.count || '0'),
      waitingPaymentAmount: parseFloat(waitingPaymentResult?.amount || '0'),
      packing: parseInt(packingResult?.count || '0'),
      packingAmount: parseFloat(packingResult?.amount || '0'),
      pickup: parseInt(pickupResult?.count || '0'),
      pickupAmount: parseFloat(pickupResult?.amount || '0'),
      shipping: parseInt(shippingResult?.count || '0'),
      shippingAmount: parseFloat(shippingResult?.amount || '0'),
      reship: parseInt(reshipResult?.count || '0'),
      reshipAmount: parseFloat(reshipResult?.amount || '0'),
    }
  }
}
