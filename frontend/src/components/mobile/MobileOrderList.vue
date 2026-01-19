<template>
  <div class="mobile-order-list">
    <!-- Header -->
    <div class="mobile-header">
      <div class="header-left" @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="page-title">Đơn hàng</div>
      <div class="header-right">
        <el-icon @click="toggleViewMode"><Grid /></el-icon>
        <el-icon @click="showMoreMenu = true"><More /></el-icon>
      </div>
    </div>

    <!-- Search -->
    <div class="search-section">
      <el-input
        v-model="searchQuery"
        placeholder="Tìm mã đơn, khách hàng, SĐT..."
        clearable
        @input="handleSearch"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
        <template #suffix>
          <el-icon class="barcode-icon" @click="scanBarcode"><Scan /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- Filter Tabs -->
    <div class="filter-tabs">
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'all' }" 
        @click="handleTabChange('all')"
      >Tất cả</div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'pending' }" 
        @click="handleTabChange('pending')"
      >Chờ xử lý</div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'shipping' }" 
        @click="handleTabChange('shipping')"
      >Đang giao</div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'completed' }" 
        @click="handleTabChange('completed')"
      >Hoàn thành</div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'cancelled' }" 
        @click="handleTabChange('cancelled')"
      >Đã huỷ</div>
    </div>

    <!-- Order Count -->
    <div class="order-count">{{ formatNumber(total) }} đơn hàng</div>

    <!-- Order List -->
    <div class="orders-list" v-loading="loading">
      <div 
        class="order-item"
        v-for="order in orders"
        :key="order.id"
        @click="viewOrder(order)"
      >
        <div class="order-header">
          <span class="order-code">{{ order.orderCode }}</span>
          <el-tag :type="getStatusType(order.status)" size="small">
            {{ getStatusLabel(order.status) }}
          </el-tag>
        </div>
        <div class="order-info">
          <div class="customer-name">{{ order.customerName || 'Khách lẻ' }}</div>
          <div class="order-time">{{ formatDate(order.createdAt) }}</div>
        </div>
        <div class="order-footer">
          <span class="order-items">{{ order.items?.length || 0 }} sản phẩm</span>
          <span class="order-total">{{ formatCurrency(order.total) }}</span>
        </div>
      </div>

      <div v-if="orders.length === 0 && !loading" class="empty-state">
        <el-icon :size="60"><Document /></el-icon>
        <p>Không có đơn hàng nào</p>
      </div>
    </div>

    <!-- FAB -->
    <div class="fab" @click="showCreateOptions = true">
      <el-icon><Plus /></el-icon>
    </div>

    <BottomNav />

    <!-- Create Options Action Sheet -->
    <el-drawer v-model="showCreateOptions" direction="btt" size="auto" :show-close="false">
      <div class="action-item" @click="createOrder('delivery')">
        <el-icon><Van /></el-icon>
        <span>Tạo đơn giao hàng</span>
      </div>
      <div class="action-item" @click="createOrder('pos')">
        <el-icon><Shop /></el-icon>
        <span>Bán tại quầy</span>
      </div>
    </el-drawer>

    <!-- More Menu -->
    <el-drawer v-model="showMoreMenu" direction="btt" size="auto" :show-close="false">
      <div class="action-item" @click="handleExport">
        <el-icon><Download /></el-icon>
        <span>Xuất file</span>
      </div>
      <div class="action-item" @click="handleImport">
        <el-icon><Upload /></el-icon>
        <span>Nhập file</span>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  ArrowLeft, Grid, More, Search, Plus, Document, Van, Shop, Download, Upload
} from '@element-plus/icons-vue'
import { orderService } from '@/services/order.service'
import BottomNav from './BottomNav.vue'

const Scan = { template: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h2v12H4zm3 0h1v12H7zm2 0h3v12H9zm4 0h1v12h-1zm3 0h2v12h-2zm3 0h1v12h-1z"/></svg>` }

const router = useRouter()

// ========== STATE (SAME AS DESKTOP) ==========
const loading = ref(false)
const orders = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

// Filters
const searchQuery = ref('')
const statusFilter = ref('')
const activeTab = ref('all')

// Mobile-specific state
const viewMode = ref('list')
const showCreateOptions = ref(false)
const showMoreMenu = ref(false)

// ========== METHODS (SAME AS DESKTOP) ==========
async function loadOrders() {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
      search: searchQuery.value || undefined,
      status: statusFilter.value || undefined,
    }

    const res = await orderService.getOrders(params)
    if (res.success) {
      orders.value = res.data?.data || res.data?.items || []
      total.value = res.data?.total || orders.value.length
    }
  } catch (e: any) {
    console.error('Load orders error:', e)
    orders.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function handleTabChange(tab: string) {
  activeTab.value = tab
  if (tab === 'all') {
    statusFilter.value = ''
  } else {
    statusFilter.value = tab
  }
  currentPage.value = 1
  loadOrders()
}

function handleSearch() {
  currentPage.value = 1
  loadOrders()
}

function viewOrder(order: any) {
  router.push(`/orders/${order.id}`)
}

function toggleViewMode() {
  // Toggle view mode
}

function scanBarcode() {
  ElMessage.info('Tính năng scan barcode đang được phát triển')
}

function createOrder(type: string) {
  showCreateOptions.value = false
  router.push(`/orders/create${type === 'pos' ? '?type=pos' : ''}`)
}

function handleExport() {
  showMoreMenu.value = false
  ElMessage.info('Xuất file...')
}

function handleImport() {
  showMoreMenu.value = false
  ElMessage.info('Nhập file...')
}

// ========== FORMATTERS (SAME AS DESKTOP) ==========
function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value || 0)
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value || 0)
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getStatusType(status: string): string {
  const types: Record<string, string> = {
    pending: 'warning',
    confirmed: 'primary',
    delivered: 'success',
    cancelled: 'danger',
  }
  return types[status] || 'info'
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Đang giao dịch',
    confirmed: 'Đang giao dịch',
    processing: 'Đang giao dịch',
    delivered: 'Hoàn thành',
    cancelled: 'Đã hủy',
  }
  return labels[status] || status
}

// ========== LIFECYCLE ==========
onMounted(() => {
  loadOrders()
})
</script>

<style scoped lang="scss">
.mobile-order-list {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.mobile-header {
  background: #fff;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e4e7ed;

  .header-left .el-icon { font-size: 24px; cursor: pointer; color: #303133; }
  .page-title { flex: 1; text-align: center; font-size: 17px; font-weight: 600; }
  .header-right { 
    display: flex; 
    gap: 12px;
    .el-icon { font-size: 22px; cursor: pointer; color: #606266; }
  }
}

.search-section {
  background: #fff;
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;

  :deep(.el-input__wrapper) {
    background: #f5f7fa;
    border-radius: 20px;
    box-shadow: none;
  }

  .barcode-icon {
    font-size: 20px;
    color: #606266;
    cursor: pointer;
    padding-left: 8px;
    border-left: 1px solid #dcdfe6;
  }
}

.filter-tabs {
  background: #fff;
  padding: 0 16px;
  display: flex;
  border-bottom: 1px solid #e4e7ed;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar { display: none; }

  .tab-item {
    padding: 12px 16px;
    font-size: 14px;
    color: #606266;
    cursor: pointer;
    position: relative;
    white-space: nowrap;

    &.active {
      color: #409eff;
      font-weight: 500;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 16px;
        right: 16px;
        height: 2px;
        background: #409eff;
      }
    }
  }
}

.order-count {
  background: #e3f2fd;
  padding: 10px 16px;
  font-size: 13px;
  color: #1976D2;
}

.orders-list {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 140px;

  .order-item {
    background: #fff;
    margin: 8px 16px;
    padding: 16px;
    border-radius: 8px;
    cursor: pointer;

    &:active { background: #f9f9f9; }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .order-code { font-weight: 600; color: #409eff; font-size: 15px; }
    }

    .order-info {
      margin-bottom: 8px;
      .customer-name { font-size: 14px; font-weight: 500; margin-bottom: 4px; }
      .order-time { font-size: 12px; color: #909399; }
    }

    .order-footer {
      display: flex;
      justify-content: space-between;
      padding-top: 8px;
      border-top: 1px solid #f0f0f0;

      .order-items { font-size: 13px; color: #909399; }
      .order-total { font-size: 15px; font-weight: 600; color: #f56c6c; }
    }
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #c0c4cc;
    
    p { margin-top: 16px; font-size: 14px; }
  }
}

.fab {
  position: fixed;
  bottom: calc(80px + env(safe-area-inset-bottom, 0));
  right: 16px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #409eff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
  z-index: 999;
  cursor: pointer;

  .el-icon { font-size: 28px; }
  &:active { transform: scale(0.95); }
}

.action-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px;
  font-size: 16px;
  color: #303133;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;

  &:active { background: #f5f7fa; }
  &:last-child { border-bottom: none; }
  .el-icon { font-size: 22px; color: #606266; }
}
</style>
