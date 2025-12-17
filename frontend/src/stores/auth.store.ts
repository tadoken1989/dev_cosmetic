import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginCredentials } from '@/types/auth.types'
import apiClient from '@/services/api/client'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRole = computed(() => user.value?.role || null)

  async function login(credentials: LoginCredentials) {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.post('/auth/login', credentials)
      token.value = response.data.data.token
      user.value = response.data.data.user
      localStorage.setItem('token', response.data.data.token)
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Đăng nhập thất bại'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await apiClient.post('/auth/logout')
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('token')
    }
  }

  async function fetchCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me')
      user.value = response.data.data
      return response.data.data
    } catch (err) {
      await logout()
      throw err
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    userRole,
    login,
    logout,
    fetchCurrentUser,
  }
})

