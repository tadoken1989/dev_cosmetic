<template>
  <div class="mobile-layout" v-if="isMobile">
    <!-- Mobile Header -->
    <div class="mobile-header">
      <div class="header-title">
        <el-icon v-if="showBackButton" @click="goBack"><ArrowLeft /></el-icon>
        <span>{{ title }}</span>
      </div>
      <div class="header-actions">
        <div class="badge" v-if="showNotification">
          <el-icon @click="$router.push('/notifications')"><Bell /></el-icon>
          <span class="badge-count" v-if="notificationCount">{{ notificationCount }}</span>
        </div>
        <el-icon v-if="showMenu" @click="$emit('menu-click')"><MoreFilled /></el-icon>
      </div>
    </div>

    <!-- Mobile Content -->
    <div class="mobile-content">
      <slot></slot>
    </div>

    <!-- Bottom Navigation -->
    <div class="bottom-nav">
      <div 
        class="nav-item" 
        :class="{ active: $route.path === '/' || $route.path.startsWith('/dashboard') }"
        @click="$router.push('/dashboard')"
      >
        <el-icon><HomeFilled /></el-icon>
        <span>Tổng quan</span>
      </div>
      <div 
        class="nav-item" 
        :class="{ active: $route.path.startsWith('/orders') }"
        @click="$router.push('/orders')"
      >
        <el-icon><Document /></el-icon>
        <span>Đơn hàng</span>
      </div>
      <div 
        class="nav-item" 
        :class="{ active: $route.path.startsWith('/shipping') }"
        @click="$router.push('/orders')"
      >
        <el-icon><Van /></el-icon>
        <span>Vận chuyển</span>
      </div>
      <div 
        class="nav-item" 
        :class="{ active: $route.path.startsWith('/products') }"
        @click="$router.push('/products')"
      >
        <el-icon><Box /></el-icon>
        <span>Sản phẩm</span>
      </div>
      <div 
        class="nav-item" 
        :class="{ active: $route.path.startsWith('/more') }"
        @click="$router.push('/settings')"
      >
        <el-icon><Grid /></el-icon>
        <span>Thêm</span>
      </div>
    </div>
  </div>

  <!-- Desktop Layout -->
  <div v-else class="desktop-layout">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  HomeFilled, Document, Van, Box, Grid, ArrowLeft, Bell, MoreFilled 
} from '@element-plus/icons-vue'
import { useDevice } from '@/composables/useDevice'

interface Props {
  title?: string
  showBackButton?: boolean
  showNotification?: boolean
  showMenu?: boolean
  notificationCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Up All Nite',
  showBackButton: false,
  showNotification: true,
  showMenu: false,
  notificationCount: 0,
})

defineEmits(['menu-click'])

const router = useRouter()
const { isMobile } = useDevice()

function goBack() {
  router.back()
}
</script>

<style scoped lang="scss">
.desktop-layout {
  width: 100%;
  height: 100%;
}

.mobile-layout {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}
</style>
