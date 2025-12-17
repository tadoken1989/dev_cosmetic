# 🎨 FRONTEND SPECIFICATIONS - VUE 3

## 📋 MỤC LỤC
1. [Project Structure](#project-structure)
2. [Technology Stack](#technology-stack)
3. [Component Architecture](#component-architecture)
4. [State Management](#state-management)
5. [Routing Strategy](#routing-strategy)
6. [API Integration](#api-integration)
7. [Form Handling & Validation](#form-handling--validation)
8. [Error Handling](#error-handling)
9. [Performance Optimization](#performance-optimization)
10. [UI/UX Requirements](#uiux-requirements)

---

## 📁 PROJECT STRUCTURE

```
frontend/
├── public/
│   ├── favicon.ico
│   └── assets/
├── src/
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── styles/
│   │       ├── main.scss
│   │       ├── variables.scss
│   │       └── components.scss
│   ├── components/
│   │   ├── common/
│   │   │   ├── AppButton.vue
│   │   │   ├── AppInput.vue
│   │   │   ├── AppSelect.vue
│   │   │   ├── AppTable.vue
│   │   │   ├── AppModal.vue
│   │   │   ├── AppPagination.vue
│   │   │   ├── AppLoading.vue
│   │   │   └── AppErrorBoundary.vue
│   │   ├── layout/
│   │   │   ├── AppLayout.vue
│   │   │   ├── AppSidebar.vue
│   │   │   ├── AppHeader.vue
│   │   │   └── AppBreadcrumb.vue
│   │   └── product/
│   │       ├── ProductForm.vue
│   │       ├── ProductList.vue
│   │       ├── ProductCard.vue
│   │       └── ProductImageUpload.vue
│   ├── views/
│   │   ├── auth/
│   │   │   ├── LoginView.vue
│   │   │   └── ForgotPasswordView.vue
│   │   ├── products/
│   │   │   ├── ProductListView.vue
│   │   │   ├── ProductCreateView.vue
│   │   │   ├── ProductEditView.vue
│   │   │   └── ProductDetailView.vue
│   │   ├── inventory/
│   │   │   ├── InventoryListView.vue
│   │   │   └── InventoryDetailView.vue
│   │   ├── orders/
│   │   │   └── OrderListView.vue
│   │   └── dashboard/
│   │       └── DashboardView.vue
│   ├── stores/
│   │   ├── index.ts
│   │   ├── auth.store.ts
│   │   ├── product.store.ts
│   │   ├── inventory.store.ts
│   │   ├── order.store.ts
│   │   └── app.store.ts
│   ├── services/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── interceptors.ts
│   │   │   └── endpoints.ts
│   │   ├── product.service.ts
│   │   ├── inventory.service.ts
│   │   ├── order.service.ts
│   │   └── auth.service.ts
│   ├── composables/
│   │   ├── useAuth.ts
│   │   ├── useProduct.ts
│   │   ├── usePagination.ts
│   │   ├── useDebounce.ts
│   │   ├── useToast.ts
│   │   └── useErrorHandler.ts
│   ├── utils/
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   ├── constants.ts
│   │   └── helpers.ts
│   ├── types/
│   │   ├── product.types.ts
│   │   ├── inventory.types.ts
│   │   ├── order.types.ts
│   │   └── api.types.ts
│   ├── router/
│   │   ├── index.ts
│   │   ├── guards.ts
│   │   └── routes.ts
│   ├── i18n/
│   │   ├── index.ts
│   │   ├── locales/
│   │   │   ├── vi.ts
│   │   │   └── en.ts
│   ├── App.vue
│   └── main.ts
├── .env
├── .env.development
├── .env.production
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🛠️ TECHNOLOGY STACK

### Core Dependencies
```json
{
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.2.5",
    "pinia": "^2.1.7",
    "axios": "^1.6.2",
    "element-plus": "^2.4.4",
    "@element-plus/icons-vue": "^2.3.1",
    "vee-validate": "^4.12.0",
    "yup": "^1.3.3",
    "dayjs": "^1.11.10",
    "vue-i18n": "^9.8.0",
    "echarts": "^5.4.3",
    "vue-echarts": "^6.6.5"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "@types/node": "^20.10.6",
    "sass": "^1.69.5",
    "eslint": "^8.56.0",
    "prettier": "^3.1.1"
  }
}
```

---

## 🧩 COMPONENT ARCHITECTURE

### Component Design Principles

#### 1. Atomic Design Pattern
- **Atoms**: Basic UI elements (Button, Input, Label)
- **Molecules**: Simple combinations (SearchBar, FormField)
- **Organisms**: Complex components (ProductForm, DataTable)
- **Templates**: Page layouts
- **Pages**: Complete views

#### 2. Component Naming Convention
```typescript
// PascalCase for components
ProductForm.vue
ProductList.vue
AppButton.vue

// kebab-case for files
product-form.vue (optional, but PascalCase preferred)
```

#### 3. Component Structure Template
```vue
<template>
  <div class="product-form">
    <!-- Component content -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Product } from '@/types/product.types'

// Props
interface Props {
  productId?: number
  mode?: 'create' | 'edit'
}
const props = withDefaults(defineProps<Props>(), {
  mode: 'create'
})

// Emits
const emit = defineEmits<{
  submit: [data: Product]
  cancel: []
}>()

// State
const formData = ref<Partial<Product>>({})
const loading = ref(false)
const errors = ref<Record<string, string>>({})

// Computed
const isEditMode = computed(() => props.mode === 'edit')

// Methods
const handleSubmit = async () => {
  // Validation
  // API call
  // Emit event
}

// Lifecycle
onMounted(() => {
  if (isEditMode.value) {
    loadProduct()
  }
})
</script>

<style scoped lang="scss">
.product-form {
  // Styles
}
</style>
```

---

## 📦 STATE MANAGEMENT (PINIA)

### Store Structure

#### 1. Auth Store
```typescript
// stores/auth.store.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginCredentials } from '@/types/auth.types'
import { authService } from '@/services/auth.service'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRole = computed(() => user.value?.role || null)
  const hasPermission = computed(() => (permission: string) => {
    return user.value?.permissions?.includes(permission) || false
  })

  // Actions
  async function login(credentials: LoginCredentials) {
    loading.value = true
    error.value = null
    try {
      const response = await authService.login(credentials)
      token.value = response.token
      user.value = response.user
      localStorage.setItem('token', response.token)
      return response
    } catch (err: any) {
      error.value = err.message || 'Đăng nhập thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await authService.logout()
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('token')
    }
  }

  async function fetchCurrentUser() {
    try {
      user.value = await authService.getCurrentUser()
    } catch (err) {
      await logout()
    }
  }

  return {
    // State
    user,
    token,
    loading,
    error,
    // Getters
    isAuthenticated,
    userRole,
    hasPermission,
    // Actions
    login,
    logout,
    fetchCurrentUser
  }
})
```

#### 2. Product Store
```typescript
// stores/product.store.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product, ProductFilters, PaginatedResponse } from '@/types/product.types'
import { productService } from '@/services/product.service'

export const useProductStore = defineStore('product', () => {
  // State
  const products = ref<Product[]>([])
  const currentProduct = ref<Product | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    page: 1,
    pageSize: 20,
    total: 0
  })
  const filters = ref<ProductFilters>({
    search: '',
    productType: null,
    brand: null,
    status: null
  })

  // Getters
  const hasProducts = computed(() => products.value.length > 0)
  const totalPages = computed(() => 
    Math.ceil(pagination.value.total / pagination.value.pageSize)
  )

  // Actions
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
        ...filters.value
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
      const index = products.value.findIndex(p => p.id === id)
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
      products.value = products.value.filter(p => p.id !== id)
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
      productType: null,
      brand: null,
      status: null
    }
  }

  return {
    // State
    products,
    currentProduct,
    loading,
    error,
    pagination,
    filters,
    // Getters
    hasProducts,
    totalPages,
    // Actions
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    setFilters,
    resetFilters
  }
})
```

---

## 🛣️ ROUTING STRATEGY

### Router Configuration
```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { routes } from './routes'
import { authGuard, permissionGuard } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Global guards
router.beforeEach(authGuard)
router.beforeEach(permissionGuard)

export default router
```

### Routes Definition
```typescript
// router/routes.ts
import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/components/layout/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: { title: 'Tổng quan' }
      },
      {
        path: 'products',
        name: 'Products',
        meta: { title: 'Sản phẩm' },
        children: [
          {
            path: '',
            name: 'ProductList',
            component: () => import('@/views/products/ProductListView.vue'),
            meta: { title: 'Danh sách sản phẩm' }
          },
          {
            path: 'create',
            name: 'ProductCreate',
            component: () => import('@/views/products/ProductCreateView.vue'),
            meta: { title: 'Tạo sản phẩm', permissions: ['product:create'] }
          },
          {
            path: ':id',
            name: 'ProductDetail',
            component: () => import('@/views/products/ProductDetailView.vue'),
            meta: { title: 'Chi tiết sản phẩm' }
          },
          {
            path: ':id/edit',
            name: 'ProductEdit',
            component: () => import('@/views/products/ProductEditView.vue'),
            meta: { title: 'Sửa sản phẩm', permissions: ['product:update'] }
          }
        ]
      },
      {
        path: 'inventory',
        name: 'Inventory',
        component: () => import('@/views/inventory/InventoryListView.vue'),
        meta: { title: 'Quản lý kho', permissions: ['inventory:read'] }
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/orders/OrderListView.vue'),
        meta: { title: 'Đơn hàng', permissions: ['order:read'] }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue')
  }
]
```

### Route Guards
```typescript
// router/guards.ts
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

export function authGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.name === 'Login' && authStore.isAuthenticated) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
}

export function permissionGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore()
  const permissions = to.meta.permissions as string[] | undefined
  
  if (permissions && permissions.length > 0) {
    const hasPermission = permissions.some(permission => 
      authStore.hasPermission(permission)
    )
    
    if (!hasPermission) {
      next({ name: 'Dashboard' })
      // Show error toast
      return
    }
  }
  
  next()
}
```

---

## 🌐 API INTEGRATION

### API Client Setup
```typescript
// services/api/client.ts
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth.store'
import { useToast } from '@/composables/useToast'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const toast = useToast()
    
    if (error.response) {
      const status = error.response.status
      const data = error.response.data as any
      
      switch (status) {
        case 401:
          // Unauthorized - logout user
          const authStore = useAuthStore()
          await authStore.logout()
          window.location.href = '/login'
          break
        case 403:
          toast.error('Bạn không có quyền thực hiện thao tác này')
          break
        case 404:
          toast.error('Không tìm thấy dữ liệu')
          break
        case 422:
          // Validation errors
          const validationErrors = data.errors || {}
          const firstError = Object.values(validationErrors)[0] as string
          toast.error(firstError || 'Dữ liệu không hợp lệ')
          break
        case 500:
          toast.error('Lỗi server. Vui lòng thử lại sau')
          break
        default:
          toast.error(data.message || 'Có lỗi xảy ra')
      }
    } else if (error.request) {
      toast.error('Không thể kết nối đến server')
    } else {
      toast.error('Có lỗi xảy ra')
    }
    
    return Promise.reject(error)
  }
)

export default apiClient
```

### Service Layer
```typescript
// services/product.service.ts
import apiClient from './api/client'
import type { Product, ProductFilters, PaginatedResponse, CreateProductDto, UpdateProductDto } from '@/types/product.types'

export const productService = {
  async getProducts(params: ProductFilters & { page?: number; pageSize?: number }): Promise<PaginatedResponse<Product>> {
    const response = await apiClient.get('/products', { params })
    return response.data
  },

  async getProductById(id: number): Promise<Product> {
    const response = await apiClient.get(`/products/${id}`)
    return response.data
  },

  async createProduct(data: CreateProductDto): Promise<Product> {
    const formData = new FormData()
    
    // Append all fields
    Object.keys(data).forEach(key => {
      const value = (data as any)[key]
      if (value !== null && value !== undefined) {
        if (key === 'images' && Array.isArray(value)) {
          value.forEach((file: File) => {
            formData.append('images', file)
          })
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value))
        } else {
          formData.append(key, value.toString())
        }
      }
    })
    
    const response = await apiClient.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  async updateProduct(id: number, data: UpdateProductDto): Promise<Product> {
    const formData = new FormData()
    
    Object.keys(data).forEach(key => {
      const value = (data as any)[key]
      if (value !== null && value !== undefined) {
        if (key === 'images' && Array.isArray(value)) {
          value.forEach((file: File) => {
            formData.append('images', file)
          })
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value))
        } else {
          formData.append(key, value.toString())
        }
      }
    })
    
    const response = await apiClient.patch(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  async deleteProduct(id: number): Promise<void> {
    await apiClient.delete(`/products/${id}`)
  },

  async searchProducts(query: string): Promise<Product[]> {
    const response = await apiClient.get('/products/search', { params: { q: query } })
    return response.data
  }
}
```

---

## 📝 FORM HANDLING & VALIDATION

### VeeValidate Setup
```typescript
// composables/useProductForm.ts
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import type { Product } from '@/types/product.types'

const productSchema = yup.object({
  name: yup.string().required('Tên sản phẩm là bắt buộc').min(3, 'Tên sản phẩm phải có ít nhất 3 ký tự'),
  sku: yup.string().nullable(),
  barcode: yup.string().min(3, 'Mã vạch phải có ít nhất 3 ký tự').max(15, 'Mã vạch không được quá 15 ký tự').nullable(),
  weight: yup.number().min(0, 'Khối lượng phải lớn hơn 0').nullable(),
  weightUnit: yup.string().oneOf(['g', 'kg'], 'Đơn vị không hợp lệ').nullable(),
  unit: yup.string().nullable(),
  productTypeId: yup.number().nullable(),
  brandId: yup.number().nullable(),
  tags: yup.array().of(yup.string()).nullable(),
  retailPrice: yup.number().min(0, 'Giá bán lẻ phải lớn hơn hoặc bằng 0').required('Giá bán lẻ là bắt buộc'),
  wholesalePrice: yup.number().min(0, 'Giá bán buôn phải lớn hơn hoặc bằng 0').nullable(),
  importPrice: yup.number().min(0, 'Giá nhập phải lớn hơn hoặc bằng 0').nullable(),
  managementType: yup.string().oneOf(['normal', 'batch'], 'Loại quản lý không hợp lệ').required(),
  allowSale: yup.boolean().default(true),
  applyTax: yup.boolean().default(false),
  taxIncluded: yup.boolean().nullable(),
  inputTaxId: yup.number().nullable(),
  outputTaxId: yup.number().nullable(),
  expiryWarningEnabled: yup.boolean().default(false)
})

export function useProductForm(initialValues?: Partial<Product>) {
  const { handleSubmit, defineField, errors, values, resetForm, setFieldValue } = useForm({
    validationSchema: productSchema,
    initialValues: initialValues || {
      name: '',
      sku: '',
      barcode: '',
      weight: null,
      weightUnit: 'g',
      unit: '',
      productTypeId: null,
      brandId: null,
      tags: [],
      retailPrice: 0,
      wholesalePrice: 0,
      importPrice: 0,
      managementType: 'normal',
      allowSale: true,
      applyTax: false,
      taxIncluded: false,
      inputTaxId: null,
      outputTaxId: null,
      expiryWarningEnabled: false
    }
  })

  const [name, nameAttrs] = defineField('name')
  const [sku, skuAttrs] = defineField('sku')
  const [barcode, barcodeAttrs] = defineField('barcode')
  const [retailPrice, retailPriceAttrs] = defineField('retailPrice')
  const [wholesalePrice, wholesalePriceAttrs] = defineField('wholesalePrice')
  const [importPrice, importPriceAttrs] = defineField('importPrice')

  return {
    handleSubmit,
    errors,
    values,
    resetForm,
    setFieldValue,
    fields: {
      name: { model: name, attrs: nameAttrs },
      sku: { model: sku, attrs: skuAttrs },
      barcode: { model: barcode, attrs: barcodeAttrs },
      retailPrice: { model: retailPrice, attrs: retailPriceAttrs },
      wholesalePrice: { model: wholesalePrice, attrs: wholesalePriceAttrs },
      importPrice: { model: importPrice, attrs: importPriceAttrs }
    }
  }
}
```

---

## ⚠️ ERROR HANDLING

### Error Handler Composable
```typescript
// composables/useErrorHandler.ts
import { ref } from 'vue'
import type { AxiosError } from 'axios'
import { useToast } from './useToast'

export function useErrorHandler() {
  const toast = useToast()
  const error = ref<string | null>(null)
  const loading = ref(false)

  function handleError(err: unknown) {
    loading.value = false
    
    if (err instanceof Error) {
      error.value = err.message
      toast.error(err.message)
    } else if (typeof err === 'object' && err !== null && 'message' in err) {
      const message = (err as any).message
      error.value = message
      toast.error(message)
    } else {
      const defaultMessage = 'Có lỗi xảy ra. Vui lòng thử lại sau'
      error.value = defaultMessage
      toast.error(defaultMessage)
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    error,
    loading,
    handleError,
    clearError
  }
}
```

### Error Boundary Component
```vue
<!-- components/common/AppErrorBoundary.vue -->
<template>
  <div v-if="hasError" class="error-boundary">
    <el-alert
      :title="errorTitle"
      :description="errorMessage"
      type="error"
      :closable="false"
      show-icon
    >
      <template #default>
        <div class="error-actions">
          <el-button @click="handleRetry">Thử lại</el-button>
          <el-button @click="handleGoHome">Về trang chủ</el-button>
        </div>
      </template>
    </el-alert>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const hasError = ref(false)
const errorTitle = ref('Đã xảy ra lỗi')
const errorMessage = ref('Vui lòng thử lại sau hoặc liên hệ hỗ trợ')

onErrorCaptured((err: Error) => {
  hasError.value = true
  errorMessage.value = err.message || 'Đã xảy ra lỗi không xác định'
  console.error('Error caught by boundary:', err)
  return false
})

function handleRetry() {
  hasError.value = false
  window.location.reload()
}

function handleGoHome() {
  router.push('/')
  hasError.value = false
}
</script>
```

---

## ⚡ PERFORMANCE OPTIMIZATION

### 1. Code Splitting
```typescript
// Lazy load routes
const ProductListView = () => import('@/views/products/ProductListView.vue')
const ProductCreateView = () => import('@/views/products/ProductCreateView.vue')
```

### 2. Virtual Scrolling for Large Lists
```vue
<!-- Use virtual scrolling for product list -->
<el-virtual-list
  :data="products"
  :item-size="80"
  height="600"
>
  <template #default="{ item }">
    <ProductCard :product="item" />
  </template>
</el-virtual-list>
```

### 3. Debounce Search
```typescript
// composables/useDebounce.ts
import { ref, watch } from 'vue'

export function useDebounce<T>(value: T, delay = 300) {
  const debouncedValue = ref(value) as { value: T }
  
  let timeoutId: ReturnType<typeof setTimeout>
  
  watch(() => value, (newValue) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      debouncedValue.value = newValue
    }, delay)
  }, { immediate: true })
  
  return debouncedValue
}
```

### 4. Image Lazy Loading
```vue
<img
  v-lazy="product.imageUrl"
  :alt="product.name"
  loading="lazy"
/>
```

### 5. Memoization
```typescript
import { computed } from 'vue'

const expensiveComputation = computed(() => {
  // Expensive operation
  return heavyCalculation()
})
```

---

## 🎨 UI/UX REQUIREMENTS

### Design System
- **Colors**: Primary, Secondary, Success, Warning, Error, Info
- **Typography**: Font family, sizes, weights
- **Spacing**: Consistent spacing scale (4px, 8px, 16px, 24px, 32px)
- **Components**: Consistent component library (Element Plus)

### Responsive Design
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Accessibility
- ARIA labels
- Keyboard navigation
- Screen reader support
- Color contrast compliance (WCAG AA)

### Loading States
- Skeleton loaders
- Progress indicators
- Loading spinners

### Toast Notifications
```typescript
// composables/useToast.ts
import { ElMessage, ElNotification } from 'element-plus'

export function useToast() {
  return {
    success: (message: string) => ElMessage.success(message),
    error: (message: string) => ElMessage.error(message),
    warning: (message: string) => ElMessage.warning(message),
    info: (message: string) => ElMessage.info(message),
    notification: (options: any) => ElNotification(options)
  }
}
```

---

## ✅ BEST PRACTICES

1. **Type Safety**: Use TypeScript strictly
2. **Component Reusability**: Create reusable components
3. **Code Organization**: Follow folder structure
4. **Naming Conventions**: Consistent naming
5. **Error Handling**: Handle all error cases
6. **Loading States**: Show loading indicators
7. **Validation**: Validate all user inputs
8. **Security**: Sanitize inputs, prevent XSS
9. **Performance**: Optimize bundle size, lazy load
10. **Testing**: Write unit and integration tests

---

## 📝 NEXT STEPS

1. Setup Vite + Vue 3 project
2. Install dependencies
3. Configure TypeScript
4. Setup Pinia stores
5. Create base components
6. Implement routing
7. Setup API client
8. Create first module (Products)
9. Add error handling
10. Performance optimization
11. Testing
12. Documentation

