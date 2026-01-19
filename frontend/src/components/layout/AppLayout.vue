<template>
  <div class="app-layout" :class="{ 'is-mobile': isMobile }">
    <!-- Sidebar - Hide on mobile -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }" v-if="!isMobile">
      <div class="logo-section">
        <div class="logo">
          <span v-if="!sidebarCollapsed">Upall9 POS</span>
          <span v-else>U9</span>
        </div>
        <el-button 
          v-if="!sidebarCollapsed"
          :icon="MoreFilled" 
          text 
          class="menu-toggle"
          @click="sidebarCollapsed = !sidebarCollapsed"
        />
      </div>
      
      <nav class="sidebar-nav">
        <el-menu
          :default-active="activeMenu"
          :default-openeds="openedMenus"
          router
          background-color="#1f2937"
          text-color="#9ca3af"
          active-text-color="#fff"
          :collapse="sidebarCollapsed"
          :collapse-transition="false"
        >
          <el-menu-item index="/">
            <el-icon><House /></el-icon>
            <span>Tổng quan</span>
          </el-menu-item>

          <el-sub-menu index="products">
            <template #title>
              <el-icon><Box /></el-icon>
              <span>Sản phẩm</span>
            </template>
            <el-menu-item index="/products">Danh sách sản phẩm</el-menu-item>
            <el-menu-item index="/products/inventory">Quản lý kho</el-menu-item>
            <el-menu-item index="/products/purchase-orders">Đặt hàng nhập</el-menu-item>
            <el-menu-item index="/products/receipts">Nhập hàng</el-menu-item>
            <el-menu-item index="/products/stock-takes">Kiểm hàng</el-menu-item>
            <el-menu-item index="/products/transfers">Chuyển hàng</el-menu-item>
            <el-menu-item index="/products/suppliers">Nhà cung cấp</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="orders">
            <template #title>
              <el-icon><ShoppingCart /></el-icon>
              <span>Đơn hàng</span>
            </template>
            <el-menu-item index="/orders/create">Tạo đơn và giao hàng</el-menu-item>
            <el-menu-item index="/orders">Danh sách đơn hàng</el-menu-item>
            <el-menu-item index="/orders/returns">Khách trả hàng</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="customers">
            <template #title>
              <el-icon><User /></el-icon>
              <span>Khách hàng</span>
            </template>
            <el-menu-item index="/customers">Danh sách khách hàng</el-menu-item>
            <el-menu-item index="/customers/groups">Nhóm khách hàng</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="shipping">
            <template #title>
              <el-icon><Van /></el-icon>
              <span>Vận chuyển</span>
            </template>
            <el-menu-item index="/shipping">Quản lý vận chuyển</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="settings">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>Cấu hình</span>
            </template>
            <el-menu-item index="/settings/products">Sản phẩm & Kho</el-menu-item>
            <el-menu-item index="/settings/branches">Chi nhánh</el-menu-item>
            <el-menu-item index="/settings/users">Nhân viên</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </nav>
      
      <!-- Collapse Button -->
      <div v-if="sidebarCollapsed" class="collapse-btn" @click="sidebarCollapsed = false">
        <el-icon><Expand /></el-icon>
      </div>
    </aside>

    <!-- Main Area -->
    <div class="main-area">
      <!-- Top Header - changes based on route, hidden on mobile -->
      <header class="top-header" v-if="!isMobile">
        <!-- Default header with icons (hide on form pages) -->
        <template v-if="!isFormPage">
          <div class="header-icons">
            <el-button text size="small">
              <el-icon><Monitor /></el-icon>
              <span>Chuyển đổi thuế</span>
            </el-button>
            <el-button text size="small">
              <el-icon><Money /></el-icon>
              <span>Vay vốn</span>
            </el-button>
            <el-button text size="small">
              <el-icon><QuestionFilled /></el-icon>
              <span>Trợ giúp</span>
            </el-button>
            <el-button text size="small">
              <el-icon><ChatDotRound /></el-icon>
              <span>Góp ý</span>
            </el-button>
          </div>
        </template>
        
        <!-- Spacer when on form page (action buttons are in page component) -->
        <div v-else class="header-spacer"></div>
        
        <!-- User dropdown always visible -->
        <el-dropdown trigger="click" class="user-dropdown">
          <div class="user-info">
            <el-avatar :size="32" :style="{ background: avatarColor }">
              {{ userInitial }}
            </el-avatar>
            <span class="user-name">{{ userName }}</span>
            <el-icon><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>Thông tin tài khoản</el-dropdown-item>
              <el-dropdown-item>Cài đặt</el-dropdown-item>
              <el-dropdown-item divided @click="handleLogout">Đăng xuất</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </header>

      <!-- Main Content - Page title inside each page component -->
      <main class="main-content" :class="{ 'no-padding': isFormPage }">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { 
  House, Box, Fold, Expand, ShoppingCart, Van, Setting, User,
  Monitor, Money, QuestionFilled, ChatDotRound, ArrowDown, MoreFilled
} from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { useDevice } from '@/composables/useDevice'

const { isMobile } = useDevice()

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const sidebarCollapsed = ref(false)
const openedMenus = ref(['products', 'orders', 'customers', 'settings'])

const activeMenu = computed(() => {
  const path = route.path
  // Handle nested routes
  if (path.startsWith('/products')) {
    if (path === '/products' || path.startsWith('/products/create') || path.match(/\/products\/\d+/)) {
      return '/products'
    }
    return path
  }
  if (path.startsWith('/orders')) {
    if (path === '/orders/create') return '/orders/create'
    if (path === '/orders/returns') return '/orders/returns'
    return '/orders'
  }
  if (path.startsWith('/customers')) {
    if (path === '/customers/groups') return '/customers/groups'
    if (path === '/customers/loyalty') return '/customers/loyalty'
    return '/customers'
  }
  if (path.startsWith('/settings')) return path
  return path
})

// Check if current page is a form page (create/edit)
const isFormPage = computed(() => {
  const path = route.path
  const name = route.name as string
  
  // Product create/edit
  if (name === 'ProductCreate' || name === 'ProductEdit') return true
  if (/\/products\/\d+\/edit/.test(path)) return true
  
  // Order create/edit
  if (name === 'OrderCreate' || name === 'OrderEdit') return true
  if (path === '/orders/create') return true
  if (/\/orders\/\d+\/edit/.test(path)) return true
  
  return false
})

const userName = computed(() => authStore.user?.fullName || authStore.user?.name || 'User')
const userInitial = computed(() => userName.value.charAt(0).toUpperCase())
const avatarColor = computed(() => {
  const colors = ['#f56c6c', '#e6a23c', '#67c23a', '#409eff', '#909399']
  const index = userName.value.charCodeAt(0) % colors.length
  return colors[index]
})

async function handleLogout() {
  try {
    await ElMessageBox.confirm('Bạn có chắc muốn đăng xuất?', 'Xác nhận', {
      confirmButtonText: 'Đăng xuất',
      cancelButtonText: 'Hủy',
      type: 'warning',
    })
    await authStore.logout()
    router.push('/login').catch(() => {})
  } catch {
    // User cancelled
  }
}
</script>

<style scoped lang="scss">
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 220px;
  background-color: #1f2937;
  color: #fff;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 0.3s ease;
  
  &.collapsed {
    width: 64px;
    
    .logo-section {
      justify-content: center;
      padding: 0;
    }
  }

  .logo-section {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    border-bottom: 1px solid #374151;
    
    .logo {
      font-size: 18px;
      font-weight: 700;
      color: #fff;
      white-space: nowrap;
    }
    
    .menu-toggle {
      color: #9ca3af;
      padding: 4px;
      
      &:hover {
        color: #fff;
        background: #374151;
      }
    }
  }

  .sidebar-nav {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;

    .el-menu {
      border-right: none;
      
      :deep(.el-menu-item),
      :deep(.el-sub-menu__title) {
        height: 44px;
        line-height: 44px;
        font-size: 14px;
        
        &:hover {
          background-color: #374151 !important;
        }
      }
      
      :deep(.el-menu-item.is-active) {
        background-color: #3b82f6 !important;
        color: #fff !important;
      }

      :deep(.el-sub-menu.is-active > .el-sub-menu__title) {
        color: #fff !important;
      }

      :deep(.el-sub-menu .el-menu-item) {
        padding-left: 52px !important;
        min-width: auto;
        height: 40px;
        line-height: 40px;
        font-size: 13px;
      }
    }
  }
  
  .collapse-btn {
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-top: 1px solid #374151;
    color: #9ca3af;
    
    &:hover {
      background-color: #374151;
      color: #fff;
    }
  }
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f5f7fa;
}

.top-header {
  height: 50px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
  flex-shrink: 0;
  
  .header-spacer {
    flex: 1;
  }
  
  .header-icons {
    display: flex;
    gap: 4px;
    
    .el-button {
      color: #606266;
      font-size: 13px;
      padding: 6px 12px;
      border-radius: 4px;
      
      span {
        margin-left: 4px;
      }
      
      &:hover {
        color: #409eff;
        background: #ecf5ff;
      }
    }
  }
  
  .user-dropdown {
    margin-left: 20px;
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 6px 10px;
      border-radius: 4px;
      transition: background 0.2s;
      
      &:hover {
        background: #f5f7fa;
      }
      
      .user-name {
        font-size: 14px;
        color: #303133;
        max-width: 150px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .el-icon {
        color: #909399;
        font-size: 12px;
      }
    }
  }
}

.main-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0;
  
  &.no-padding {
    padding: 0;
  }
}

// Mobile adjustments
.app-layout.is-mobile {
  .main-area {
    width: 100%;
  }

  .main-content {
    padding: 0;
    height: 100vh;
    overflow: hidden;
  }
}
</style>
