import apiClient from './api/client'

export interface InventoryData {
  branch: string
  initialStock: number
  costPrice: number
}

export interface InventoryHistory {
  id: number
  date: string
  staff: string
  action: string
  quantityChange: number
  stock: number
  documentCode: string | null
  branch: string
}

export const inventoryService = {
  async getInventory(params: { page?: number; pageSize?: number } = {}) {
    const response = await apiClient.get('/inventory', { params })
    return response.data
  },

  async getProductInventory(productId: number) {
    const response = await apiClient.get(`/inventory/product/${productId}`)
    return response.data
  },

  async getProductInventoryHistory(productId: number) {
    const response = await apiClient.get(`/inventory/product/${productId}/history`)
    return response.data
  },

  async initializeInventory(productId: number, data: { branchId?: number; branchName?: string; quantity: number; costPrice: number }) {
    const response = await apiClient.post(`/inventory/product/${productId}/initialize`, data)
    return response.data
  },

  async updateStock(productId: number, branchId: number, quantity: number, type: 'add' | 'subtract') {
    const response = await apiClient.patch(`/inventory/product/${productId}/branch/${branchId}/stock`, {
      quantity,
      type,
    })
    return response.data
  },

  async updateInventory(productId: number, data: { branchId: number; quantity: number; available: number; costPrice: number }) {
    const response = await apiClient.put(`/inventory/product/${productId}/branch/${data.branchId}`, data)
    return response.data
  },
}

export default inventoryService


