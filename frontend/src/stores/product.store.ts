import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product, ProductFilters, PaginatedResponse } from '@/types/product.types'
import { productService } from '@/services/product.service'

export const useProductStore = defineStore('product', () => {
  const products = ref<Product[]>([])
  const currentProduct = ref<Product | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    page: 1,
    pageSize: 20,
    total: 0,
  })
  const filters = ref<ProductFilters>({
    search: '',
    productTypeId: null,
    brandId: null,
    status: null,
  })

  const hasProducts = computed(() => products.value.length > 0)
  const totalPages = computed(() =>
    Math.ceil(pagination.value.total / pagination.value.pageSize),
  )

  async function fetchProducts(reset = false) {
    if (reset) {
      pagination.value.page = 1
    }

    loading.value = true
    error.value = null
    try {
      const response: PaginatedResponse<Product> = await productService.getProducts({
        page: pagination.value.page,
        pageSize: pagination.value.pageSize,
        ...filters.value,
      })

      if (reset) {
        products.value = response.data
      } else {
        products.value.push(...response.data)
      }

      pagination.value.total = response.total
      return response
    } catch (err: any) {
      error.value = err.message || 'Lỗi khi tải danh sách sản phẩm'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchProductById(id: number) {
    loading.value = true
    error.value = null
    try {
      currentProduct.value = await productService.getProductById(id)
      return currentProduct.value
    } catch (err: any) {
      error.value = err.message || 'Lỗi khi tải thông tin sản phẩm'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createProduct(data: Partial<Product>) {
    loading.value = true
    error.value = null
    try {
      const newProduct = await productService.createProduct(data)
      products.value.unshift(newProduct)
      return newProduct
    } catch (err: any) {
      error.value = err.message || 'Lỗi khi tạo sản phẩm'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateProduct(id: number, data: Partial<Product>) {
    loading.value = true
    error.value = null
    try {
      const updatedProduct = await productService.updateProduct(id, data)
      const index = products.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        products.value[index] = updatedProduct
      }
      if (currentProduct.value?.id === id) {
        currentProduct.value = updatedProduct
      }
      return updatedProduct
    } catch (err: any) {
      error.value = err.message || 'Lỗi khi cập nhật sản phẩm'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteProduct(id: number) {
    loading.value = true
    error.value = null
    try {
      await productService.deleteProduct(id)
      products.value = products.value.filter((p) => p.id !== id)
      if (currentProduct.value?.id === id) {
        currentProduct.value = null
      }
    } catch (err: any) {
      error.value = err.message || 'Lỗi khi xóa sản phẩm'
      throw err
    } finally {
      loading.value = false
    }
  }

  function setFilters(newFilters: Partial<ProductFilters>) {
    filters.value = { ...filters.value, ...newFilters }
  }

  function resetFilters() {
    filters.value = {
      search: '',
      productTypeId: null,
      brandId: null,
      status: null,
    }
  }

  return {
    products,
    currentProduct,
    loading,
    error,
    pagination,
    filters,
    hasProducts,
    totalPages,
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    setFilters,
    resetFilters,
  }
})

