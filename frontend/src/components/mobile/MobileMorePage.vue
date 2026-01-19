<template>
  <div class="mobile-more-page">
    <!-- Blue Header -->
    <div class="mobile-header">
      <div class="header-left">
        <el-icon><Flag /></el-icon>
      </div>
      <div class="header-center">
        <div class="shop-name">{{ shopName }}</div>
        <div class="shop-domain">{{ shopDomain }}</div>
      </div>
      <div class="header-right">
        <el-icon><Shop /></el-icon>
      </div>
    </div>

    <div class="mobile-content">
      <!-- User Card -->
      <div class="user-card" @click="$router.push('/settings/profile')">
        <div class="user-avatar" :style="{ background: avatarColor }">{{ userInitial }}</div>
        <div class="user-info">
          <div class="user-name">{{ userName }}</div>
          <div class="user-phone">{{ userPhone }}</div>
          <div class="user-plan">Gói dịch vụ: {{ userPlan }}</div>
        </div>
        <el-icon class="arrow"><ArrowRight /></el-icon>
      </div>

      <!-- Menu Section -->
      <div class="menu-section">
        <div class="menu-item" @click="$router.push('/settings')">
          <el-icon><Setting /></el-icon>
          <span>Cài đặt</span>
          <el-icon class="arrow"><ArrowRight /></el-icon>
        </div>
        <div class="menu-item" @click="$router.push('/settings/users')">
          <el-icon><User /></el-icon>
          <span>Quản lý nhân viên</span>
          <el-icon class="arrow"><ArrowRight /></el-icon>
        </div>
        <div class="menu-item" @click="$router.push('/settings/branches')">
          <el-icon><OfficeBuilding /></el-icon>
          <span>Quản lý chi nhánh</span>
          <el-icon class="arrow"><ArrowRight /></el-icon>
        </div>
        <div class="menu-item" @click="$router.push('/reports')">
          <el-icon><DataAnalysis /></el-icon>
          <span>Báo cáo</span>
          <el-icon class="arrow"><ArrowRight /></el-icon>
        </div>
      </div>

      <!-- Info Card -->
      <div class="info-card">
        <div class="info-icon">
          <el-icon :size="40"><Monitor /></el-icon>
        </div>
        <div class="info-content">
          <p>Sử dụng Sapo POS trên máy tính để quản lý bán hàng hiệu quả hơn!</p>
          <el-link type="primary">Tìm hiểu thêm</el-link>
        </div>
      </div>

      <!-- Logout -->
      <div class="logout-section">
        <el-button type="danger" plain @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
          Đăng xuất
        </el-button>
      </div>
    </div>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { 
  Setting, User, OfficeBuilding, DataAnalysis, SwitchButton
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth.store'
import BottomNav from './BottomNav.vue'

const Flag = { template: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>` }
const Shop = { template: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z"/></svg>` }
const Monitor = { template: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v2H8v2h8v-2h-2v-2h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H3V4h18v12z"/></svg>` }
const ArrowRight = { template: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>` }

const router = useRouter()
const authStore = useAuthStore()

const shopName = ref('Cửa hàng của tôi')
const shopDomain = ref('mystore.sapo.vn')

const userName = computed(() => authStore.user?.name || 'Admin User')
const userPhone = computed(() => authStore.user?.phone || '0123456789')
const userPlan = computed(() => 'Sapo POS Basic')
const userInitial = computed(() => userName.value.charAt(0).toUpperCase())
const avatarColor = ref('#409eff')

async function handleLogout() {
  try {
    await ElMessageBox.confirm('Bạn có chắc muốn đăng xuất?', 'Xác nhận', {
      confirmButtonText: 'Đăng xuất',
      cancelButtonText: 'Huỷ',
      type: 'warning'
    })
    authStore.logout()
    router.push('/login')
  } catch {
    // Cancelled
  }
}
</script>

<style scoped lang="scss">
.mobile-more-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.mobile-header {
  background: linear-gradient(135deg, #2196F3, #1976D2);
  padding: 16px;
  padding-top: calc(16px + env(safe-area-inset-top, 0));
  display: flex;
  align-items: center;
  gap: 12px;
  color: #fff;

  .header-left .el-icon { font-size: 20px; }
  
  .header-center {
    flex: 1;
    .shop-name { font-size: 16px; font-weight: 600; }
    .shop-domain { font-size: 12px; opacity: 0.8; }
  }

  .header-right .el-icon { font-size: 20px; }
}

.mobile-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 80px;
}

.user-card {
  background: #fff;
  margin: 16px;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;

  &:active { background: #f9f9f9; }

  .user-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 24px;
    font-weight: 600;
    flex-shrink: 0;
  }

  .user-info {
    flex: 1;
    
    .user-name { font-size: 16px; font-weight: 600; margin-bottom: 4px; }
    .user-phone { font-size: 13px; color: #909399; margin-bottom: 2px; }
    .user-plan { font-size: 12px; color: #67c23a; }
  }

  .arrow { color: #c0c4cc; font-size: 18px; }
}

.menu-section {
  background: #fff;
  margin: 0 16px 16px;
  border-radius: 12px;
  overflow: hidden;

  .menu-item {
    display: flex;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #f5f5f5;
    cursor: pointer;

    &:last-child { border-bottom: none; }
    &:active { background: #f9f9f9; }

    .el-icon:first-child { 
      font-size: 20px; 
      color: #606266;
      margin-right: 12px;
    }

    span { flex: 1; font-size: 15px; color: #303133; }

    .arrow { font-size: 14px; color: #c0c4cc; }
  }
}

.info-card {
  background: #e3f2fd;
  margin: 0 16px 16px;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  gap: 12px;

  .info-icon { 
    color: #2196F3;
    flex-shrink: 0;
  }

  .info-content {
    flex: 1;
    
    p { 
      font-size: 13px; 
      color: #303133; 
      margin: 0 0 8px;
      line-height: 1.5;
    }
  }
}

.logout-section {
  padding: 16px;
  text-align: center;

  .el-button {
    width: 100%;
    height: 44px;
  }
}
</style>
