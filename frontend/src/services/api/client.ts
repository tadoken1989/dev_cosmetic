import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth.store'
import { ElMessage } from 'element-plus'
import router from '@/router'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

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
  },
)

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status
      const data = error.response.data as any

      switch (status) {
        case 400:
          // Don't show error for 400 in some cases (like empty inventory)
          console.warn('Bad request:', data)
          break
        case 401:
          const authStore = useAuthStore()
          await authStore.logout()
          // Redirect to login using router for cleaner URL
          router.push('/login').catch(() => {
            // Fallback to window.location if router fails
            window.location.href = '/login'
          })
          break
        case 403:
          ElMessage.error('Bạn không có quyền thực hiện thao tác này')
          break
        case 404:
          // Don't show error for 404 (silent fail for optional data)
          console.warn('Not found:', data)
          break
        case 422:
          const validationErrors = data.error?.errors || []
          const firstError = validationErrors[0]?.message || data.error?.message || 'Dữ liệu không hợp lệ'
          ElMessage.error(firstError)
          break
        case 500:
          ElMessage.error('Lỗi server. Vui lòng thử lại sau')
          break
        default:
          ElMessage.error(data.error?.message || 'Có lỗi xảy ra')
      }
    } else if (error.request) {
      ElMessage.error('Không thể kết nối đến server')
    } else {
      ElMessage.error('Có lỗi xảy ra')
    }

    return Promise.reject(error)
  },
)

export default apiClient

