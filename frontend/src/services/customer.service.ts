import apiClient from './api/client'

export interface Customer {
  id?: number
  customerCode?: string
  name: string
  phone?: string
  email?: string
  address?: string
  ward?: string
  district?: string
  province?: string
  gender?: string
  birthday?: string
  type?: string
  group?: string
  tags?: string[]
  note?: string
  totalOrders?: number
  totalSpent?: number
  debt?: number
  loyaltyPoints?: number
  isActive?: boolean
  createdAt?: string
  lastOrderAt?: string
}

export const customerService = {
  async getCustomers(params: { page?: number; pageSize?: number; search?: string } = {}) {
    const response = await apiClient.get('/customers', { params })
    return response.data
  },

  async getCustomerById(id: number) {
    const response = await apiClient.get(`/customers/${id}`)
    return response.data
  },

  async searchCustomers(query: string) {
    const response = await apiClient.get('/customers', { 
      params: { search: query, page: 1, pageSize: 20 } 
    })
    return { data: response.data?.data || response.data || [] }
  },
  
  async getAll(params: { page?: number; pageSize?: number } = {}) {
    const response = await apiClient.get('/customers', { params })
    return response.data
  },

  async createCustomer(data: Partial<Customer>) {
    const response = await apiClient.post('/customers', data)
    return response.data
  },

  async updateCustomer(id: number, data: Partial<Customer>) {
    const response = await apiClient.patch(`/customers/${id}`, data)
    return response.data
  },

  async deleteCustomer(id: number) {
    const response = await apiClient.delete(`/customers/${id}`)
    return response.data
  },
}

export default customerService




