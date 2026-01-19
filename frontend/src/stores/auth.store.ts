import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginCredentials } from '@/types/auth.types'
import apiClient from '@/services/api/client'

// Session timeout: 24 hours (in milliseconds)
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000 // 24 hours

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)

  // Load token from localStorage on store creation
  const storedToken = localStorage.getItem('token')
  if (storedToken) {
    token.value = storedToken
  }

  // Simple authentication check - don't check timeout here (computed should be pure)
  const isAuthenticated = computed(() => {
    return !!(token.value && user.value)
  })
  
  const userRole = computed(() => user.value?.role || null)

  // Update last activity time
  function updateLastActivity() {
    if (token.value) {
      localStorage.setItem('lastActivity', Date.now().toString())
    }
  }

  // Check if session is still valid (not expired)
  function isSessionValid(): boolean {
    if (!token.value) return false
    
    const lastActivity = localStorage.getItem('lastActivity')
    if (!lastActivity) {
      // No activity recorded, assume valid (will be set on next activity)
      return true
    }
    
    const timeSinceLastActivity = Date.now() - parseInt(lastActivity, 10)
    return timeSinceLastActivity <= SESSION_TIMEOUT
  }

  // Check session timeout and logout if expired
  async function checkSessionTimeout(): Promise<boolean> {
    if (!token.value) return false
    
    if (!isSessionValid()) {
      // Session expired
      await logout()
      return false
    }
    
    // Update activity on successful check
    updateLastActivity()
    return true
  }

  async function login(credentials: LoginCredentials) {
    loading.value = true
    error.value = null
    try {
      const response = await apiClient.post('/auth/login', credentials)
      const { token: newToken, user: userData } = response.data.data
      
      // Set token and user
      token.value = newToken
      user.value = userData
      
      // Persist to localStorage
      localStorage.setItem('token', newToken)
      
      // Set last activity time when login
      updateLastActivity()
      
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Đăng nhập thất bại'
      // Clear on error
      token.value = null
      user.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('lastActivity')
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await apiClient.post('/auth/logout')
    } catch (err) {
      // Ignore errors on logout
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('lastActivity')
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

  // Init: Fetch user nếu có token khi app khởi động
  async function init() {
    if (isInitialized.value) return // Already initialized
    
    if (!token.value) {
      isInitialized.value = true
      return // No token, nothing to do
    }
    
    // Check session validity first (don't logout yet, just check)
    if (!isSessionValid()) {
      // Session expired, clear everything
      await logout()
      isInitialized.value = true
      return
    }
    
    // Token exists and session is valid, fetch user
    try {
      await fetchCurrentUser()
      // Update last activity after successful fetch
      updateLastActivity()
    } catch (err: any) {
      // Token invalid or expired, clear it
      console.error('Failed to fetch current user:', err)
      await logout()
    } finally {
      isInitialized.value = true
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    userRole,
    isInitialized,
    login,
    logout,
    fetchCurrentUser,
    init,
    updateLastActivity,
    checkSessionTimeout,
    isSessionValid,
  }
})

