import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth.store'
import './assets/styles/main.scss'

const app = createApp(App)

// Register Element Plus icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus, { locale: zhCn })

// Initialize auth store: Fetch user if token exists
const authStore = useAuthStore()

// Initialize auth store first, then mount app
authStore.init().then(() => {
  // Track user activity for session timeout (24h inactivity)
  const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
  let activityTimer: NodeJS.Timeout | null = null

  function updateActivity() {
    if (authStore.isAuthenticated) {
      authStore.updateLastActivity()
      
      // Clear existing timer
      if (activityTimer) {
        clearTimeout(activityTimer)
      }
      
      // Check session timeout every 5 minutes
      activityTimer = setTimeout(async () => {
        if (authStore.isAuthenticated) {
          const isValid = await authStore.checkSessionTimeout()
          if (!isValid) {
            // Session expired, redirect to login
            router.push('/login')
          }
        }
      }, 5 * 60 * 1000) // 5 minutes
    }
  }

  // Add event listeners for user activity
  activityEvents.forEach(event => {
    document.addEventListener(event, updateActivity, { passive: true })
  })

  // Initial activity update
  if (authStore.isAuthenticated) {
    authStore.updateLastActivity()
  }
})

app.mount('#app')

