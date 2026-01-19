<template>
  <div class="bottom-nav" v-if="shouldShow">
    <div 
      class="nav-item" 
      :class="{ active: currentRoute === 'dashboard' }"
      @click="$router.push('/dashboard')"
    >
      <div class="nav-icon">
        <el-icon><HomeFilled /></el-icon>
      </div>
      <span class="nav-label">Tổng quan</span>
    </div>
    <div 
      class="nav-item" 
      :class="{ active: currentRoute === 'orders' }"
      @click="$router.push('/orders')"
    >
      <div class="nav-icon">
        <el-icon><Document /></el-icon>
      </div>
      <span class="nav-label">Đơn hàng</span>
    </div>
    <div 
      class="nav-item" 
      :class="{ active: currentRoute === 'shipping' }"
      @click="$router.push('/shipping')"
    >
      <div class="nav-icon">
        <el-icon><Van /></el-icon>
      </div>
      <span class="nav-label">Vận chuyển</span>
    </div>
    <div 
      class="nav-item" 
      :class="{ active: currentRoute === 'products' }"
      @click="$router.push('/products')"
    >
      <div class="nav-icon">
        <el-icon><Box /></el-icon>
      </div>
      <span class="nav-label">Sản phẩm</span>
    </div>
    <div 
      class="nav-item" 
      :class="{ active: currentRoute === 'more' }"
      @click="$router.push('/more')"
    >
      <div class="nav-icon">
        <el-icon><Grid /></el-icon>
      </div>
      <span class="nav-label">Thêm</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { HomeFilled, Document, Van, Box, Grid } from '@element-plus/icons-vue'

const route = useRoute()

// Các trang chính hiện Bottom Nav
const mainPages = [
  '/',
  '/dashboard',
  '/orders',
  '/products',
  '/products/inventory',
  '/shipping',
  '/customers',
  '/more',
  '/settings',
  '/reports'
]

// Các trang con ẩn Bottom Nav
const subPages = [
  '/orders/create',
  '/orders/returns',
  '/products/create',
  '/customers/create',
]

const shouldShow = computed(() => {
  const path = route.path
  
  // Ẩn ở trang tạo/chi tiết
  if (subPages.some(p => path.startsWith(p))) {
    return false
  }
  
  // Ẩn ở trang chi tiết (có id)
  if (/\/(orders|products|customers)\/\d+/.test(path)) {
    return false
  }
  
  // Ẩn ở trang chi tiết báo cáo
  if (/\/reports\/[a-z-]+/.test(path)) {
    return false
  }
  
  return true
})

const currentRoute = computed(() => {
  const path = route.path
  if (path === '/' || path.includes('dashboard') || path.includes('reports')) return 'dashboard'
  if (path.includes('orders')) return 'orders'
  if (path.includes('shipping')) return 'shipping'
  if (path.includes('products') || path.includes('inventory')) return 'products'
  if (path.includes('more') || path.includes('settings') || path.includes('customers')) return 'more'
  return ''
})
</script>

<style scoped lang="scss">
$primary: #2563eb;

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(68px + env(safe-area-inset-bottom, 0));
  padding-bottom: env(safe-area-inset-bottom, 0);
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
  padding-top: 8px;
  z-index: 1000;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4px 0;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  .nav-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    margin-bottom: 2px;
    transition: all 0.2s ease;

    .el-icon {
      font-size: 24px;
    }
  }

  .nav-label {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: -0.01em;
  }

  &.active {
    color: $primary;

    .nav-icon {
      background: rgba($primary, 0.1);
    }
  }

  &:active {
    transform: scale(0.92);
  }
}
</style>
