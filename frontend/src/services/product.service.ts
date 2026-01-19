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

  async getProduct(id: number): Promise<any> {
    const response = await apiClient.get(`/products/${id}`)
    return response.data
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
    const response = await apiClient.get('/products', { 
      params: { search: query, page: 1, pageSize: 20 } 
    })
    return response.data.data || response.data || []
  },

  async getProductTypes(): Promise<{ data: Array<{ id: number; name: string }> }> {
    const response = await apiClient.get('/products/types/list')
    return response.data
  },

  async createProductType(data: { name: string }): Promise<any> {
    const response = await apiClient.post('/products/types', data)
    return response.data
  },

  async getBrands(): Promise<{ data: Array<{ id: number; name: string }> }> {
    const response = await apiClient.get('/products/brands/list')
    return response.data
  },

  async createBrand(data: { name: string }): Promise<any> {
    const response = await apiClient.post('/products/brands', data)
    return response.data
  },

  async getTaxes(): Promise<{ data: Array<{ id: number; name: string; rate: number }> }> {
    const response = await apiClient.get('/products/taxes/list')
    return response.data
  },

  async createTax(data: { name: string; rate: number }): Promise<any> {
    const response = await apiClient.post('/products/taxes', data)
    return response.data
  },
}

export default productService
