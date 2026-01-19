<template>
  <div class="mobile-product-menu">
    <!-- Header -->
    <div class="mobile-header">
      <div class="page-title">Sản phẩm</div>
    </div>

    <!-- Main Content -->
    <div class="menu-content">
      <!-- Main Action Card -->
      <div class="main-action-card" @click="createProduct">
        <div class="action-icon">
          <el-icon><Plus /></el-icon>
        </div>
        <span class="action-text">Thêm sản phẩm</span>
      </div>

      <!-- Menu List -->
      <div class="menu-list">
        <div class="menu-item" @click="goToProductList">
          <div class="item-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M20 2H4c-1 0-2 1-2 2v3c0 1 1 2 2 2v11c0 1 1 2 2 2h12c1 0 2-1 2-2V9c1 0 2-1 2-2V4c0-1-1-2-2-2zm-1 18H5V9h14v11zm1-13H4V4h16v3z"/>
            </svg>
          </div>
          <span class="item-text">Danh sách sản phẩm</span>
          <el-icon class="arrow-icon"><ArrowRight /></el-icon>
        </div>

        <div class="menu-item" @click="goToImport">
          <div class="item-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
          </div>
          <span class="item-text">Nhập hàng</span>
          <el-icon class="arrow-icon"><ArrowRight /></el-icon>
        </div>

        <div class="menu-item" @click="goToStockCheck">
          <div class="item-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <span class="item-text">Kiểm hàng</span>
          <el-icon class="arrow-icon"><ArrowRight /></el-icon>
        </div>

        <div class="menu-item" @click="goToSuppliers">
          <div class="item-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <span class="item-text">Nhà cung cấp</span>
          <el-icon class="arrow-icon"><ArrowRight /></el-icon>
        </div>

        <div class="menu-item" @click="goToBarcodes">
          <div class="item-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M2 4h2v16H2V4zm4 0h1v16H6V4zm2 0h2v16H8V4zm3 0h2v16h-2V4zm3 0h2v16h-2V4zm3 0h1v16h-1V4zm2 0h2v16h-2V4z"/>
            </svg>
          </div>
          <span class="item-text">In tem mã vạch</span>
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

function createProduct() {
  router.push('/products/create')
}

function goToProductList() {
  router.push('/products/list')
}

function goToImport() {
  router.push('/products/import')
}

function goToStockCheck() {
  router.push('/products/stock-check')
}

function goToSuppliers() {
  router.push('/products/suppliers')
}

function goToBarcodes() {
  router.push('/products/barcodes')
}
</script>

<style scoped lang="scss">
.mobile-product-menu {
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
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;

  &:last-child {
    border-bottom: none;
  }

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
</style>
