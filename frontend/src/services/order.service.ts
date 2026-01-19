import apiClient from './api/client'

export interface OrderItem {
  productId: number
  productName: string
  sku?: string
  variantId?: number
  variantName?: string
  imageUrl?: string
  quantity: number
  unitPrice: number
  discount?: number
  discountType?: string
  total: number
  note?: string
}

export interface PackagingHistoryItem {
  code: string
  status: string
  method: string
  date: string
}

export interface Order {
  id?: number
  orderCode?: string
  status?: string
  paymentStatus?: string
  customerId?: number
  customerName?: string
  customerPhone?: string
  customerAddress?: string
  branchId?: number
  branchName?: string
  staffId?: number
  staffName?: string
  source?: string
  subtotal?: number
  discount?: number
  discountType?: string
  shippingFee?: number
  total?: number
  paidAmount?: number
  remainingAmount?: number
  shippingMethod?: string
  shippingCarrier?: string
  trackingCode?: string
  paymentMethod?: string
  expectedDeliveryDate?: string
  packagingCode?: string | null
  packagingStatus?: string
  packagingHistory?: PackagingHistoryItem[]
  note?: string
  tags?: string[]
  items: OrderItem[]
  createdAt?: string
  updatedAt?: string
  confirmedAt?: string
  shippedAt?: string
  deliveredAt?: string
  cancelledAt?: string
  paidAt?: string
}

export interface OrderFilters {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  paymentStatus?: string
  startDate?: string
  endDate?: string
  customerId?: number
  staffId?: number
  _t?: number // Cache buster
}

export const orderService = {
  async getOrders(filters: OrderFilters = {}) {
    const response = await apiClient.get('/orders', { params: filters })
    return response.data
  },

  async getOrderById(id: number, params?: Record<string, any>) {
    const response = await apiClient.get(`/orders/${id}`, { params })
    return response.data
  },

  async getOrder(id: number) {
    // Add timestamp to bypass cache
    const response = await apiClient.get(`/orders/${id}`, { params: { _t: Date.now() } })
    return response.data
  },

  async getOrderByCode(code: string) {
    const response = await apiClient.get(`/orders/code/${code}`)
    return response.data
  },

  async createOrder(data: Partial<Order>) {
    const response = await apiClient.post('/orders', data)
    return response.data
  },

  async updateOrder(id: number, data: Partial<Order>) {
    const response = await apiClient.patch(`/orders/${id}`, data)
    return response.data
  },

  async updateOrderStatus(id: number, status: string) {
    const response = await apiClient.patch(`/orders/${id}/status`, { status })
    return response.data
  },

  async addPayment(id: number, amount: number) {
    const response = await apiClient.post(`/orders/${id}/payment`, { amount })
    return response.data
  },

  async cancelOrder(id: number) {
    const response = await apiClient.post(`/orders/${id}/cancel`)
    return response.data
  },

  async getOrderStats() {
    const response = await apiClient.get('/orders/stats')
    return response.data
  },

  // Returns
  async getReturns(filters: OrderFilters = {}) {
    const response = await apiClient.get('/orders/returns/list', { params: filters })
    return response.data
  },

  async getReturnById(id: number) {
    const response = await apiClient.get(`/orders/returns/${id}`)
    return response.data
  },

  async createReturn(data: any) {
    const response = await apiClient.post('/orders/returns', data)
    return response.data
  },

  async updateReturnStatus(id: number, status: string) {
    const response = await apiClient.patch(`/orders/returns/${id}/status`, { status })
    return response.data
  },
}

export default orderService





