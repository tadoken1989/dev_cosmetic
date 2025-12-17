export interface Product {
  id: number
  name: string
  sku?: string
  barcode?: string
  weight?: number
  weightUnit?: string
  unit?: string
  description?: string
  managementType: 'normal' | 'batch'
  retailPrice: number
  wholesalePrice?: number
  importPrice?: number
  allowSale: boolean
  applyTax: boolean
  taxIncluded?: boolean
  inputTaxId?: number
  outputTaxId?: number
  expiryWarningEnabled: boolean
  productTypeId?: number
  brandId?: number
  tags: string[]
  productType?: {
    id: number
    name: string
  }
  brand?: {
    id: number
    name: string
  }
  images?: Array<{
    id: number
    url: string
    isPrimary: boolean
  }>
  createdAt: string
  updatedAt: string
}

export interface ProductFilters {
  search?: string
  productTypeId?: number | null
  brandId?: number | null
  status?: string | null
  managementType?: 'normal' | 'batch'
  allowSale?: boolean
  minPrice?: number
  maxPrice?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type CreateProductDto = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateProductDto = Partial<CreateProductDto>

