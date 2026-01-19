<template>
  <!-- Mobile View -->
  <template v-if="isMobile">
    <MobileOrderMenu v-if="$route.path === '/orders'" />
    <MobileOrderList v-else />
  </template>
  
  <!-- Desktop View -->
  <div v-else class="order-list-page">
    <!-- Desktop Header -->
    <div class="desktop-header">
      <h1 class="page-title">Danh sách đơn hàng</h1>
      <div class="header-actions">
        <el-button @click="exportOrders">
          <el-icon><Download /></el-icon> Xuất file
        </el-button>
        <el-button @click="importOrders">
          <el-icon><Upload /></el-icon> Nhập file
        </el-button>
        <el-button type="primary" @click="$router.push('/orders/create')">
          <el-icon><Plus /></el-icon> Tạo đơn hàng
        </el-button>
      </div>
    </div>

    <!-- ========== SEARCH BAR (SHARED) ========== -->
    <div class="search-section">
      <el-input
        v-model="searchQuery"
        :placeholder="isMobile ? 'Nhập tên, số điện thoại, mã' : 'Tìm kiếm theo mã đơn hàng, vận đơn, tên, SĐT khách hàng'"
        clearable
        @keyup.enter="loadOrders"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- Stats Card -->
    <el-card class="stats-card">
      <div class="stats-header">
        <span>ĐƠN HÀNG CẦN XỬ LÝ</span>
        <el-select v-model="dateRange" size="small" style="width: 150px">
          <el-option label="90 ngày gần nhất" value="90" />
          <el-option label="30 ngày gần nhất" value="30" />
          <el-option label="7 ngày gần nhất" value="7" />
          <el-option label="Hôm nay" value="1" />
        </el-select>
      </div>
      <div class="stats-row">
        <div class="stat-item">
          <span class="label">Chờ duyệt</span>
          <span class="badge warning">{{ stats.pending || 0 }}</span>
          <span class="value">{{ formatCurrency(stats.pendingAmount || 0) }}</span>
        </div>
        <div class="stat-item">
          <span class="label">Chờ thanh toán</span>
          <span class="badge info">{{ stats.waitingPayment || 0 }}</span>
          <span class="value">{{ formatCurrency(stats.waitingPaymentAmount || 0) }}</span>
        </div>
        <div class="stat-item">
          <span class="label">Chờ đóng gói</span>
          <span class="badge primary">{{ stats.packing || 0 }}</span>
          <span class="value">{{ formatCurrency(stats.packingAmount || 0) }}</span>
        </div>
        <div class="stat-item">
          <span class="label">Chờ lấy hàng</span>
          <span class="badge success">{{ stats.pickup || 0 }}</span>
          <span class="value">{{ formatCurrency(stats.pickupAmount || 0) }}</span>
        </div>
        <div class="stat-item">
          <span class="label">Đang giao hàng</span>
          <span class="badge">{{ stats.shipping || 0 }}</span>
          <span class="value">{{ formatCurrency(stats.shippingAmount || 0) }}</span>
        </div>
        <div class="stat-item">
          <span class="label">Chờ giao lại</span>
          <span class="badge danger">{{ stats.reship || 0 }}</span>
          <span class="value">{{ formatCurrency(stats.reshipAmount || 0) }}</span>
        </div>
      </div>
    </el-card>

    <!-- ========== FILTERS (SHARED) ========== -->
    <div class="filter-section">
      <!-- Tabs -->
      <div class="filter-tabs">
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'all' }"
          @click="handleTabChange('all')"
        >
          Tất cả
        </div>
        <div 
          class="tab-item" 
          :class="{ active: activeTab === 'active' }"
          @click="handleTabChange('active')"
        >
          Đang giao dịch
        </div>
      </div>
      
      <!-- Filter controls -->
      <div class="filter-controls">
        <el-select v-model="datePreset" placeholder="Ngày tạo" clearable style="width: 140px" @change="handleDatePresetChange">
          <el-option label="Hôm nay" value="today" />
          <el-option label="Hôm qua" value="yesterday" />
          <el-option label="Tuần này" value="thisweek" />
          <el-option label="Tháng này" value="thismonth" />
        </el-select>
        <el-select v-model="statusFilter" placeholder="Trạng thái" clearable style="width: 140px" @change="loadOrders">
          <el-option label="Đặt hàng" value="pending" />
          <el-option label="Đang giao dịch" value="confirmed" />
          <el-option label="Hoàn thành" value="delivered" />
          <el-option label="Đã hủy" value="cancelled" />
        </el-select>
      </div>
    </div>

    <!-- ========== ORDER COUNT ========== -->
    <div class="order-count">
      {{ formatNumber(total) }} đơn hàng
    </div>

    <!-- Orders Table -->
    <div class="orders-container" v-loading="loading">
      <el-table
        :data="orders"
        @row-click="handleRowClick"
        @selection-change="handleSelectionChange"
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="40" />
        <el-table-column label="Mã đơn hàng" width="140">
          <template #default="{ row }">
            <el-link type="primary" @click.stop="viewOrder(row)">{{ row.orderCode }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="Thời gian" width="150">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="Khách hàng" prop="customerName" min-width="150">
          <template #default="{ row }">{{ row.customerName || 'Khách lẻ' }}</template>
        </el-table-column>
        <el-table-column label="Tổng tiền" width="120" align="right">
          <template #default="{ row }">{{ formatCurrency(row.total) }}</template>
        </el-table-column>
        <el-table-column label="Trạng thái" width="130">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getDetailedStatusLabel(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Thanh toán" width="130">
          <template #default="{ row }">
            <el-tag :type="row.paymentStatus === 'paid' ? 'success' : 'warning'" size="small">
              {{ row.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- Empty State -->
      <div v-if="orders.length === 0 && !loading" class="empty-state">
        <el-icon :size="48"><Document /></el-icon>
        <p>Không có đơn hàng nào</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="total > pageSize" class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        @size-change="loadOrders"
        @current-change="loadOrders"
      />
    </div>


    <!-- Mobile Filter Drawer -->
    <el-drawer
      v-model="showFilterDrawer"
      direction="btt"
      title="Bộ lọc"
      size="50%"
    >
      <el-form label-position="top">
        <el-form-item label="Trạng thái">
          <el-select v-model="statusFilter" placeholder="Chọn trạng thái" clearable>
            <el-option label="Đặt hàng" value="pending" />
            <el-option label="Đang giao dịch" value="confirmed" />
            <el-option label="Hoàn thành" value="delivered" />
            <el-option label="Đã hủy" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="Thời gian">
          <el-select v-model="datePreset" placeholder="Chọn thời gian" clearable @change="handleDatePresetChange">
            <el-option label="Hôm nay" value="today" />
            <el-option label="Hôm qua" value="yesterday" />
            <el-option label="Tuần này" value="thisweek" />
            <el-option label="Tháng này" value="thismonth" />
          </el-select>
        </el-form-item>
        <el-button type="primary" @click="applyFilter">Áp dụng</el-button>
      </el-form>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Plus, Download, Upload, Search, ArrowLeft, Grid, More, Filter, Document
} from '@element-plus/icons-vue'
import { orderService } from '@/services/order.service'
import { useDevice } from '@/composables/useDevice'
import MobileOrderList from '@/components/mobile/MobileOrderList.vue'
import MobileOrderMenu from '@/components/mobile/MobileOrderMenu.vue'

// Custom scan icon
const Scan = {
  template: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 4h2v16H2V4zm4 0h1v16H6V4zm3 0h2v16H9V4zm4 0h1v16h-1V4zm3 0h2v16h-2V4zm4 0h2v16h-2V4z"/></svg>`
}

const { isMobile } = useDevice()
const router = useRouter()

// ========== STATE (SHARED) ==========
const loading = ref(false)
const orders = ref<any[]>([])
const selectedOrders = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

// Filters
const searchQuery = ref('')
const dateFilter = ref<[Date, Date] | null>(null)
const datePreset = ref('')
const statusFilter = ref('')
const activeTab = ref('all')
const dateRange = ref('90')

// Mobile-specific state
const showCreateOptions = ref(false)
const showFilterDrawer = ref(false)
const showMoreMenu = ref(false)

// Stats
const stats = reactive({
  pending: 0,
  pendingAmount: 0,
  waitingPayment: 0,
  waitingPaymentAmount: 0,
  packing: 0,
  packingAmount: 0,
  pickup: 0,
  pickupAmount: 0,
  shipping: 0,
  shippingAmount: 0,
  reship: 0,
  reshipAmount: 0,
})

// ========== METHODS (SHARED) ==========
async function loadStats() {
  try {
    const res = await orderService.getOrderStats()
    if (res.success && res.data) {
      Object.assign(stats, res.data)
    }
  } catch (e) {
    console.error('Load stats error:', e)
  }
}

async function loadOrders() {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
      search: searchQuery.value || undefined,
      status: statusFilter.value || undefined,
    }

    if (dateFilter.value) {
      params.startDate = dateFilter.value[0].toISOString()
      params.endDate = dateFilter.value[1].toISOString()
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
  if (tab === 'active') {
    statusFilter.value = 'confirmed'
  } else {
    statusFilter.value = ''
  }
  loadOrders()
}

function handleDatePresetChange(preset: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  switch (preset) {
    case 'today':
      dateFilter.value = [today, new Date()]
      break
    case 'yesterday':
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      dateFilter.value = [yesterday, today]
      break
    case 'thisweek':
      const thisWeekStart = new Date(today)
      thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay())
      dateFilter.value = [thisWeekStart, new Date()]
      break
    case 'thismonth':
      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      dateFilter.value = [thisMonthStart, new Date()]
      break
    default:
      dateFilter.value = null
      return
  }
  loadOrders()
}

function handleRowClick(row: any) {
  router.push(`/orders/${row.id}`)
}

function handleSelectionChange(selection: any[]) {
  selectedOrders.value = selection
}

function viewOrder(order: any) {
  router.push(`/orders/${order.id}`)
}

function exportOrders() {
  ElMessage.info('Tính năng xuất file đang được phát triển')
}

function importOrders() {
  ElMessage.info('Tính năng nhập file đang được phát triển')
}

// Mobile-specific methods
function toggleViewMode() {
  // Toggle view mode
}

function scanBarcode() {
  ElMessage.info('Tính năng scan barcode đang được phát triển')
}

function createOrder(type: string) {
  showCreateOptions.value = false
  router.push('/orders/create')
}

function applyFilter() {
  showFilterDrawer.value = false
  loadOrders()
}

// ========== FORMATTERS (SHARED) ==========
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

function formatDateMobile(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const today = new Date()
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' })
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

function getDetailedStatusLabel(order: any): string {
  if (order.status === 'cancelled') return 'Hủy đơn'
  if (order.status === 'delivered') return 'Hoàn thành'
  if (order.paymentStatus === 'unpaid') return 'Chờ thanh toán'
  if (order.packagingStatus === 'pending') return 'Chờ đóng gói'
  if (order.status === 'pending') return 'Chờ duyệt'
  return 'Đang giao dịch'
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

function getStatusClass(status: string): string {
  if (status === 'cancelled') return 'cancelled'
  if (status === 'delivered') return 'completed'
  return 'processing'
}

// ========== LIFECYCLE ==========
onMounted(() => {
  loadOrders()
  loadStats()
})
</script>

<style scoped lang="scss">
// ========== DESKTOP STYLES ==========
.order-list-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100%;
}

.desktop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .page-title {
    font-size: 20px;
    font-weight: 600;
    color: #303133;
    margin: 0;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.search-section {
  margin-bottom: 16px;
  
  :deep(.el-input) {
    max-width: 600px;
  }
}

.stats-card {
  margin-bottom: 20px;

  .stats-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    font-weight: 500;
  }

  .stats-row {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .label {
      font-size: 13px;
      color: #909399;
    }

    .badge {
      font-size: 18px;
      font-weight: 600;

      &.warning { color: #e6a23c; }
      &.info { color: #409eff; }
      &.primary { color: #409eff; }
      &.success { color: #67c23a; }
      &.danger { color: #f56c6c; }
    }

    .value {
      font-size: 12px;
      color: #606266;
    }
  }
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  background: #fff;
  padding: 8px 16px;
  border-radius: 4px;

  .filter-tabs {
    display: flex;
    gap: 24px;

    .tab-item {
      padding: 8px 0;
      cursor: pointer;
      color: #606266;

      &.active {
        color: #409eff;
        border-bottom: 2px solid #409eff;
      }
    }
  }

  .filter-controls {
    display: flex;
    gap: 12px;
  }
}

.order-count {
  padding: 8px 16px;
  background: #f0f7ff;
  font-size: 13px;
  color: #606266;
  margin-bottom: 16px;
  border-radius: 4px;
}

.orders-container {
  background: #fff;
  border-radius: 4px;
  min-height: 300px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #909399;

  .el-icon {
    margin-bottom: 12px;
  }
}
</style>
