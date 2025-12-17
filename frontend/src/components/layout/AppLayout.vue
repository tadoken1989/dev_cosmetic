<template>
  <el-container class="app-layout">
    <el-aside width="250px" class="sidebar">
      <div class="logo">Sapo POS</div>
      <el-menu
        :default-active="activeMenu"
        router
        class="sidebar-menu"
        background-color="#1f2937"
        text-color="#fff"
        active-text-color="#409eff"
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
        </el-sub-menu>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-content">
          <div class="breadcrumb">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">Trang chủ</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="user-info">
            <el-dropdown>
              <span class="user-name">{{ authStore.user?.fullName }}</span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleLogout">Đăng xuất</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { House, Box } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const activeMenu = computed(() => route.path)

async function handleLogout() {
  try {
    await ElMessageBox.confirm('Bạn có chắc muốn đăng xuất?', 'Xác nhận', {
      confirmButtonText: 'Đăng xuất',
      cancelButtonText: 'Hủy',
      type: 'warning',
    })
    await authStore.logout()
    router.push('/login')
  } catch {
    // User cancelled
  }
}
</script>

<style scoped lang="scss">
.app-layout {
  height: 100vh;
}

.sidebar {
  background-color: #1f2937;
  color: #fff;

  .logo {
    height: 60px;
    line-height: 60px;
    text-align: center;
    font-size: 20px;
    font-weight: bold;
    color: #fff;
    border-bottom: 1px solid #374151;
  }

  .sidebar-menu {
    border-right: none;
  }
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 20px;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;

    .user-name {
      cursor: pointer;
    }
  }
}

.main-content {
  background-color: #f3f4f6;
  padding: 20px;
}
</style>

