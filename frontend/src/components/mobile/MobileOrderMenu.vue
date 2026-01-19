<template>
  <div class="mobile-order-menu">
    <!-- Header -->
    <div class="mobile-header">
      <div class="page-title">Đơn hàng</div>
    </div>

    <!-- Main Content -->
    <div class="menu-content">
      <!-- Main Action Card -->
      <div class="main-action-card" @click="createOrderDelivery">
        <div class="action-icon">
          <el-icon><Plus /></el-icon>
        </div>
        <span class="action-text">Tạo đơn và giao hàng</span>
      </div>

      <!-- Menu List -->
      <div class="menu-list">
        <div class="menu-item" @click="goToOrderList">
          <div class="item-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
            </svg>
          </div>
          <span class="item-text">Danh sách đơn hàng</span>
          <el-icon class="arrow-icon"><ArrowRight /></el-icon>
        </div>

        <div class="menu-item" @click="goToReturns">
          <div class="item-icon return-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
            </svg>
          </div>
          <span class="item-text">Khách trả hàng</span>
          <el-icon class="arrow-icon"><ArrowRight /></el-icon>
        </div>

        <div class="divider"></div>

        <div class="menu-item" @click="goToShipping">
          <div class="item-icon shipping-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm13.5-9l1.96 2.5H17V9h2.5zm-1.5 9c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
            </svg>
          </div>
          <span class="item-text">Quản lý giao hàng</span>
          <el-icon class="arrow-icon"><ArrowRight /></el-icon>
        </div>

        <div class="divider"></div>

        <div class="menu-item" @click="createOrderPOS">
          <div class="item-icon pos-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z"/>
            </svg>
          </div>
          <span class="item-text">Bán tại cửa hàng</span>
          <el-icon class="arrow-icon"><ArrowRight /></el-icon>
        </div>

        <div class="menu-item" @click="goToDrafts">
          <div class="item-icon draft-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
            </svg>
          </div>
          <span class="item-text">Đơn lưu tạm</span>
          <el-icon class="arrow-icon"><ArrowRight /></el-icon>
        </div>
      </div>
    </div>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Plus, ArrowRight } from '@element-plus/icons-vue'
import BottomNav from './BottomNav.vue'

const router = useRouter()

function createOrderDelivery() {
  router.push('/orders/create')
}

function createOrderPOS() {
  router.push('/orders/create?type=pos')
}

function goToOrderList() {
  router.push('/orders/list')
}

function goToReturns() {
  router.push('/orders/returns')
}

function goToShipping() {
  router.push('/orders/shipping')
}

function goToDrafts() {
  router.push('/orders/drafts')
}
</script>

<style scoped lang="scss">
.mobile-order-menu {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.mobile-header {
  background: #fff;
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;

  .page-title {
    font-size: 18px;
    font-weight: 600;
    text-align: center;
    color: #303133;
  }
}

.menu-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 16px;
  padding-bottom: 100px;
}

.main-action-card {
  background: #fff;
  border-radius: 12px;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s;

  &:active {
    transform: scale(0.98);
  }

  .action-icon {
    width: 64px;
    height: 64px;
    background: #2196F3;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    .el-icon {
      font-size: 32px;
      color: #fff;
    }
  }

  .action-text {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
  }
}

.menu-list {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  transition: background 0.2s;

  &:active {
    background: #f5f7fa;
  }

  .item-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    color: #606266;

    svg {
      width: 24px;
      height: 24px;
    }
  }

  .return-icon {
    color: #606266;
  }

  .shipping-icon {
    color: #606266;
  }

  .pos-icon {
    background: #E8F5E9;
    border-radius: 8px;
    
    svg {
      color: #4CAF50;
    }
  }

  .draft-icon {
    color: #606266;
  }

  .item-text {
    flex: 1;
    font-size: 15px;
    color: #303133;
  }

  .arrow-icon {
    color: #c0c4cc;
    font-size: 16px;
  }
}

.divider {
  height: 8px;
  background: #f5f7fa;
}
</style>
