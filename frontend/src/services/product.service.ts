import apiClient from './api/client'
import type { Product, ProductFilters, PaginatedResponse, CreateProductDto, UpdateProductDto } from '@/types/product.types'

export const productService = {
  async getProducts(
    params: ProductFilters & { page?: number; pageSize?: number },
  ): Promise<PaginatedResponse<Product>> {
    const response = await apiClient.get('/products', { params })
    return response.data.data
  },

  async getProductById(id: number): Promise<Product> {
    const response = await apiClient.get(`/products/${id}`)
    return response.data.data
  },

  async createProduct(data: CreateProductDto): Promise<Product> {
    const response = await apiClient.post('/products', data)
    return response.data.data
  },

  async updateProduct(id: number, data: UpdateProductDto): Promise<Product> {
    const response = await apiClient.patch(`/products/${id}`, data)
    return response.data.data
  },

  async deleteProduct(id: number): Promise<void> {
    await apiClient.delete(`/products/${id}`)
  },

  async searchProducts(query: string): Promise<Product[]> {
    const response = await apiClient.get(`/products/search/${query}`)
    return response.data.data
  },
}

