<template>
  <div class="mobile-reports">
    <!-- Header -->
    <div class="reports-header">
      <div class="header-left" @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="page-title">Báo cáo</div>
      <div class="header-right"></div>
    </div>

    <!-- Tabs -->
    <div class="tabs-section">
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'sales' }" 
        @click="activeTab = 'sales'"
      >
        BÁN HÀNG
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'inventory' }" 
        @click="activeTab = 'inventory'"
      >
        KHO
      </div>
      <div 
        class="tab-item" 
        :class="{ active: activeTab === 'finance' }" 
        @click="activeTab = 'finance'"
      >
        TÀI CHÍNH
      </div>
    </div>

    <!-- Filters -->
    <div class="filter-bar">
      <div class="date-filter" @click="showDatePicker = true">
        {{ dateRangeLabel }} <el-icon><ArrowDown /></el-icon>
      </div>
      <div class="branch-filter">
        Chi nhánh mặc định
      </div>
    </div>

    <!-- Content -->
    <div class="reports-content">
      <!-- BÁN HÀNG Tab -->
      <template v-if="activeTab === 'sales'">
        <!-- Summary Card with Swiper -->
        <div class="summary-swiper">
          <div class="swiper-slide active">
            <div class="summary-card sales-card">
              <div class="card-icon">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect x='12' y='28' width='8' height='24' fill='%2367c23a'/%3E%3Crect x='28' y='20' width='8' height='32' fill='%2367c23a'/%3E%3Crect x='44' y='12' width='8' height='40' fill='%2367c23a'/%3E%3Ccircle cx='52' cy='10' r='6' fill='%23f7ba2a'/%3E%3Ctext x='50' y='14' font-size='10' fill='white'%3E$%3C/text%3E%3C/svg%3E" />
              </div>
              <div class="card-label">DOANH THU</div>
              <div class="card-value">
                <span class="amount">{{ formatNumber(salesData.revenue) }}</span>
                <span class="trend up" v-if="salesData.trend > 0">
                  <el-icon><Top /></el-icon> {{ salesData.trend }}%
                </span>
              </div>
              <div class="card-sub">Số đơn hàng: {{ salesData.orderCount }}</div>
            </div>
            <div class="card-note">
              <strong>Doanh thu</strong> bằng tổng giá trị các đơn hàng giao thành công đã trừ trả hàng.
            </div>
          </div>
          <div class="swiper-dots">
            <span class="dot active"></span>
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>

        <!-- Report List -->
        <div class="section-title">XEM BÁO CÁO CHI TIẾT</div>
        <div class="report-list">
          <div class="report-item" @click="goToReport('revenue')">
            <div class="item-icon blue">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="item-content">
              <div class="item-title">Báo cáo doanh thu</div>
              <div class="item-desc">Hiển thị doanh thu của cửa hàng trong kỳ</div>
            </div>
          </div>
          <div class="report-item" @click="goToReport('profit')">
            <div class="item-icon green">
              <el-icon><Coin /></el-icon>
            </div>
            <div class="item-content">
              <div class="item-title">Báo cáo lợi nhuận</div>
              <div class="item-desc">Quản lý lợi nhuận gộp từ việc bán hàng</div>
            </div>
          </div>
          <div class="report-item" @click="goToReport('payment')">
            <div class="item-icon orange">
              <el-icon><Money /></el-icon>
            </div>
            <div class="item-content">
              <div class="item-title">Báo cáo thanh toán</div>
              <div class="item-desc">Tổng hợp các thông tin thanh toán cho đơn hàng</div>
            </div>
          </div>
          <div class="report-item" @click="goToReport('order-stats')">
            <div class="item-icon purple">
              <el-icon><DataAnalysis /></el-icon>
            </div>
            <div class="item-content">
              <div class="item-title">Báo cáo thống kê đơn hàng</div>
              <div class="item-desc">Thống kê các dữ liệu tổng hợp về đơn hàng</div>
            </div>
          </div>
          <div class="report-item" @click="goToReport('orders')">
            <div class="item-icon teal">
              <el-icon><List /></el-icon>
            </div>
            <div class="item-content">
              <div class="item-title">Báo cáo đặt hàng</div>
              <div class="item-desc">Tổng hợp về các đơn hàng đã tạo bao gồm cả đơn chưa ghi nhận doanh thu</div>
            </div>
            <span class="badge new">MỚI</span>
          </div>
        </div>
      </template>

      <!-- KHO Tab -->
      <template v-if="activeTab === 'inventory'">
        <!-- Inventory Summary Card -->
        <div class="summary-swiper">
          <div class="swiper-slide active">
            <div class="summary-card inventory-card">
              <div class="card-icon">
                <el-icon :size="36" color="#67c23a"><Box /></el-icon>
              </div>
              <div class="card-label">TỒN KHO CUỐI KỲ</div>
              <div class="card-value">
                <span class="amount green">{{ formatNumber(inventoryData.totalValue) }}</span>
              </div>
              <div class="card-sub">SL: {{ formatNumber(inventoryData.totalQuantity) }}</div>
              <div class="card-note-small">* Số liệu bao gồm các sản phẩm đang giao dịch</div>
              
              <div class="stats-row">
                <div class="stat-item">
                  <div class="stat-label">Nhập hàng</div>
                  <div class="stat-value">{{ formatNumber(inventoryData.importValue) }}</div>
                  <div class="stat-desc">Tổng giá trị nhập</div>
                </div>
                <div class="stat-item">
                  <div class="stat-label">Xuất bán</div>
                  <div class="stat-value">{{ formatNumber(inventoryData.exportValue) }}</div>
                  <div class="stat-desc">Tổng giá trị xuất</div>
                </div>
              </div>
              
              <div class="card-formula">
                <strong>Giá trị tồn kho = Số lượng * Giá vốn</strong>
                <p>Giá vốn (MAC) là bình quân giá sản phẩm được tính sau mỗi lần nhập hàng</p>
              </div>
            </div>
          </div>
          <div class="swiper-dots">
            <span class="dot active"></span>
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>

        <!-- Inventory Report List -->
        <div class="section-title">XEM BÁO CÁO CHI TIẾT</div>
        <div class="report-list">
          <div class="report-item" @click="goToReport('inventory-stock')">
            <div class="item-icon blue">
              <el-icon><Box /></el-icon>
            </div>
            <div class="item-content">
              <div class="item-title">Báo cáo tồn kho</div>
              <div class="item-desc">Tổng hợp giá trị và số lượng sản phẩm tồn kho</div>
            </div>
          </div>
          <div class="report-item" @click="goToReport('inventory-ledger')">
            <div class="item-icon orange">
              <el-icon><Tickets /></el-icon>
            </div>
            <div class="item-content">
              <div class="item-title">Sổ kho</div>
              <div class="item-desc">Quản lý luồng xuất kho, nhập kho</div>
            </div>
          </div>
          <div class="report-item" @click="goToReport('inventory-movement')">
            <div class="item-icon green">
              <el-icon><DataLine /></el-icon>
            </div>
            <div class="item-content">
              <div class="item-title">Xuất nhập tồn</div>
              <div class="item-desc">Quản lý giá trị xuất, nhập, tồn kho theo sản phẩm</div>
            </div>
          </div>
          <div class="report-item" @click="goToReport('low-stock')">
            <div class="item-icon red">
              <el-icon><WarningFilled /></el-icon>
            </div>
            <div class="item-content">
              <div class="item-title">Dưới định mức</div>
              <div class="item-desc">Tổng hợp các sản phẩm dưới định mức tồn</div>
            </div>
          </div>
          <div class="report-item" @click="goToReport('over-stock')">
            <div class="item-icon purple">
              <el-icon><CircleCheckFilled /></el-icon>
            </div>
            <div class="item-content">
              <div class="item-title">Vượt định mức</div>
              <div class="item-desc">Tổng hợp các sản phẩm vượt định mức tồn</div>
            </div>
          </div>
          <div class="report-item" @click="goToReport('batch-expiry')">
            <div class="item-icon teal">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="item-content">
              <div class="item-title">Báo cáo Lô - Hạn sử dụng</div>
              <div class="item-desc">Quản lý lô và hạn sử dụng sản phẩm</div>
            </div>
            <span class="badge new">MỚI</span>
          </div>
        </div>
      </template>

      <!-- TÀI CHÍNH Tab -->
      <template v-if="activeTab === 'finance'">
        <div class="placeholder-content">
          <el-icon :size="60"><Money /></el-icon>
          <p>Báo cáo tài chính đang được phát triển</p>
        </div>
      </template>
    </div>

    <BottomNav />

    <!-- Date Picker Drawer -->
    <el-drawer 
      v-model="showDatePicker" 
      direction="btt" 
      size="auto" 
      :show-close="false"
      :with-header="false"
    >
      <div class="date-picker-sheet">
        <div class="sheet-title">Chọn kỳ báo cáo</div>
        <div class="sheet-item" @click="selectDateRange('today')">Hôm nay</div>
        <div class="sheet-item" @click="selectDateRange('yesterday')">Hôm qua</div>
        <div class="sheet-item" @click="selectDateRange('thisWeek')">Tuần này</div>
        <div class="sheet-item" @click="selectDateRange('lastWeek')">Tuần trước</div>
        <div class="sheet-item" @click="selectDateRange('thisMonth')">Tháng này</div>
        <div class="sheet-item" @click="selectDateRange('lastMonth')">Tháng trước</div>
        <div class="sheet-item cancel" @click="showDatePicker = false">Đóng</div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  ArrowLeft, ArrowDown, Top, TrendCharts, Coin, Money, DataAnalysis, List,
  Box, Tickets, DataLine, WarningFilled, CircleCheckFilled, Calendar
} from '@element-plus/icons-vue'
import { orderService } from '@/services/order.service'
import { productService } from '@/services/product.service'
import BottomNav from './BottomNav.vue'

const router = useRouter()
const route = useRoute()

const activeTab = ref('sales') // Default to sales tab
const showDatePicker = ref(false)
const dateRange = ref('thisMonth')
const loading = ref(false)

const salesData = reactive({
  revenue: 0,
  trend: 0,
  orderCount: 0
})

const inventoryData = reactive({
  totalValue: 0,
  totalQuantity: 0,
  importValue: 0,
  exportValue: 0
})

const dateRangeLabel = computed(() => {
  const labels: Record<string, string> = {
    today: 'Hôm nay',
    yesterday: 'Hôm qua',
    thisWeek: 'Tuần này',
    lastWeek: 'Tuần trước',
    thisMonth: 'Tháng này',
    lastMonth: 'Tháng trước',
    custom: 'Tùy chọn'
  }
  return labels[dateRange.value] || 'Hôm nay'
})

function formatNumber(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value || 0)
}

function selectDateRange(range: string) {
  dateRange.value = range
  showDatePicker.value = false
  loadData()
}

function goToReport(type: string) {
  router.push(`/reports/${type}`)
}

async function loadSalesData() {
  try {
    // Get all orders to calculate filtered data
    const allOrders = await orderService.getOrders({ page: 1, pageSize: 1000, _t: Date.now() })
    const orders = allOrders.data?.data || allOrders.data || []
    
    // Filter by date range
    const filteredOrders = filterOrdersByDateRange(orders)
    
    // Calculate revenue from delivered/paid orders in the period
    const deliveredOrders = filteredOrders.filter((o: any) => 
      o.status === 'delivered' || o.paymentStatus === 'paid'
    )
    
    salesData.revenue = deliveredOrders.reduce((sum: number, o: any) => 
      sum + (parseFloat(o.total) || 0), 0
    )
    
    salesData.orderCount = deliveredOrders.length
    
    // Calculate trend by comparing with previous period
    const previousOrders = filterOrdersByPreviousPeriod(orders)
    const previousRevenue = previousOrders
      .filter((o: any) => o.status === 'delivered' || o.paymentStatus === 'paid')
      .reduce((sum: number, o: any) => sum + (parseFloat(o.total) || 0), 0)
    
    if (previousRevenue > 0) {
      salesData.trend = ((salesData.revenue - previousRevenue) / previousRevenue) * 100
    } else {
      salesData.trend = salesData.revenue > 0 ? 100 : 0
    }
  } catch (e) {
    console.error('Load sales error:', e)
  }
}

function filterOrdersByPreviousPeriod(orders: any[]) {
  const now = new Date()
  let startDate: Date
  let endDate: Date
  
  switch (dateRange.value) {
    case 'today':
      startDate = new Date(now)
      startDate.setDate(startDate.getDate() - 1)
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(startDate)
      endDate.setHours(23, 59, 59, 999)
      break
    case 'yesterday':
      startDate = new Date(now)
      startDate.setDate(startDate.getDate() - 2)
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(startDate)
      endDate.setHours(23, 59, 59, 999)
      break
    case 'thisWeek':
      startDate = new Date(now)
      startDate.setDate(startDate.getDate() - startDate.getDay() - 7)
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 6)
      endDate.setHours(23, 59, 59, 999)
      break
    case 'lastWeek':
      startDate = new Date(now)
      startDate.setDate(startDate.getDate() - startDate.getDay() - 14)
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 6)
      endDate.setHours(23, 59, 59, 999)
      break
    case 'thisMonth':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      endDate = new Date(now.getFullYear(), now.getMonth(), 0)
      break
    case 'lastMonth':
      startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1)
      endDate = new Date(now.getFullYear(), now.getMonth() - 1, 0)
      break
    default:
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      endDate = new Date(now.getFullYear(), now.getMonth(), 0)
  }
  
  return orders.filter((o: any) => {
    const orderDate = new Date(o.createdAt)
    return orderDate >= startDate && orderDate <= endDate
  })
}

function filterOrdersByDateRange(orders: any[]) {
  const now = new Date()
  let startDate: Date
  let endDate = new Date()
  
  switch (dateRange.value) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0))
      break
    case 'yesterday':
      startDate = new Date(now)
      startDate.setDate(startDate.getDate() - 1)
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(startDate)
      endDate.setHours(23, 59, 59, 999)
      break
    case 'thisWeek':
      startDate = new Date(now)
      startDate.setDate(startDate.getDate() - startDate.getDay())
      startDate.setHours(0, 0, 0, 0)
      break
    case 'lastWeek':
      startDate = new Date(now)
      startDate.setDate(startDate.getDate() - startDate.getDay() - 7)
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 6)
      endDate.setHours(23, 59, 59, 999)
      break
    case 'thisMonth':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case 'lastMonth':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      endDate = new Date(now.getFullYear(), now.getMonth(), 0)
      break
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  }
  
  return orders.filter((o: any) => {
    const orderDate = new Date(o.createdAt)
    return orderDate >= startDate && orderDate <= endDate
  })
}

async function loadInventoryData() {
  try {
    const res = await productService.getProducts({ page: 1, pageSize: 1000 })
    const products = res?.data || res?.items || res || []
    
    let totalValue = 0
    let totalQuantity = 0
    
    // Use inventory data from products API (already included via JOIN)
    for (const product of products) {
      const stockQty = product.stockQuantity || 0
      const costPrice = product.costPrice || product.importPrice || product.retailPrice || 0
      
      totalQuantity += stockQty
      // Giá trị tồn kho = SL * giá nhập (nếu không có giá nhập thì dùng giá bán)
      totalValue += stockQty * costPrice
    }
    
    inventoryData.totalValue = totalValue
    inventoryData.totalQuantity = totalQuantity
    
    // Calculate import/export values from orders in the period
    try {
      const allOrders = await orderService.getOrders({ page: 1, pageSize: 1000, _t: Date.now() })
      const orders = allOrders.data?.data || allOrders.data || []
      const filteredOrders = filterOrdersByDateRange(orders)
      
      // Xuất trong kỳ = Tổng giá trị đơn hàng đã giao (delivered)
      inventoryData.exportValue = filteredOrders
        .filter((o: any) => o.status === 'delivered')
        .reduce((sum: number, o: any) => {
          // Use cost price instead of selling price for more accurate calculation
          const orderValue = (o.items || []).reduce((itemSum: number, item: any) => {
            const product = products.find((p: any) => p.id === item.productId)
            const costPrice = product?.importPrice || item.unitPrice || 0
            return itemSum + (costPrice * (item.quantity || 0))
          }, 0)
          return sum + orderValue
        }, 0)
      
      // Nhập trong kỳ: Currently we don't have import orders
      // This would need a separate import orders system
      inventoryData.importValue = 0
    } catch (e) {
      console.error('Load order data error:', e)
      inventoryData.importValue = 0
      inventoryData.exportValue = 0
    }
  } catch (e) {
    console.error('Load inventory error:', e)
  }
}

async function loadData() {
  loading.value = true
  try {
    await Promise.all([
      loadSalesData(),
      loadInventoryData()
    ])
  } finally {
    loading.value = false
  }
}

// Check if route has tab param
watch(() => route.query.tab, (tab) => {
  if (tab === 'inventory') activeTab.value = 'inventory'
  else if (tab === 'finance') activeTab.value = 'finance'
  else activeTab.value = 'sales'
}, { immediate: true })

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
// Premium Design Tokens
$primary: #2563eb;
$primary-gradient: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
$success: #10b981;
$gray-50: #f9fafb;
$gray-100: #f3f4f6;
$gray-200: #e5e7eb;
$gray-300: #d1d5db;
$gray-400: #9ca3af;
$gray-500: #6b7280;
$gray-600: #4b5563;
$gray-700: #374151;
$gray-800: #1f2937;
$gray-900: #111827;

.mobile-reports {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: $gray-50;
}

.reports-header {
  background: $primary-gradient;
  padding: 16px 20px;
  padding-top: calc(16px + env(safe-area-inset-top, 0));
  display: flex;
  align-items: center;
  color: #fff;

  .header-left { 
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    margin-left: -8px;
    transition: background 0.15s;
    
    &:active { background: rgba(255,255,255,0.15); }
    .el-icon { font-size: 24px; }
  }
  .page-title { 
    flex: 1; 
    text-align: center; 
    font-size: 17px; 
    font-weight: 600;
    letter-spacing: -0.01em;
  }
  .header-right { width: 44px; }
}

.tabs-section {
  display: flex;
  background: $primary-gradient;
  padding: 0 16px 16px;
  gap: 8px;

  .tab-item {
    flex: 1;
    text-align: center;
    padding: 12px 0;
    color: rgba(255, 255, 255, 0.7);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border-radius: 12px;
    transition: all 0.25s ease;
    letter-spacing: 0.02em;

    &.active {
      background: #fff;
      color: $gray-800;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
  }
}

.filter-bar {
  background: #fff;
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid $gray-100;

  .date-filter {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: $gray-50;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
    color: $gray-700;
    cursor: pointer;
    transition: all 0.15s;
    
    &:active { background: $gray-100; }
    .el-icon { font-size: 14px; color: $gray-500; }
  }
  
  .branch-filter {
    font-size: 13px;
    color: $gray-500;
  }
}

.reports-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 100px;
}

.summary-swiper {
  padding: 20px 16px;

  .swiper-slide {
    background: #fff;
    border-radius: 20px;
    padding: 28px 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .swiper-dots {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 20px;

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: $gray-200;
      transition: all 0.25s;
      
      &.active { 
        background: $primary;
        width: 24px;
        border-radius: 4px;
      }
    }
  }
}

.summary-card {
  text-align: center;

  .card-icon {
    margin-bottom: 20px;
    img { width: 64px; height: 64px; }
  }

  .card-label {
    font-size: 11px;
    color: $gray-500;
    font-weight: 700;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .card-value {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    margin-bottom: 12px;

    .amount {
      font-size: 36px;
      font-weight: 800;
      color: $primary;
      letter-spacing: -0.02em;
      
      &.green { color: $success; }
    }

    .trend {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 20px;
      
      &.up { 
        background: rgba($success, 0.1); 
        color: $success; 
      }
    }
  }

  .card-sub {
    font-size: 15px;
    color: $gray-600;
    font-weight: 500;
  }

  .card-note-small {
    font-size: 12px;
    color: $gray-400;
    margin: 16px 0;
  }

  .stats-row {
    display: flex;
    border-top: 1px solid $gray-100;
    padding-top: 20px;
    margin-top: 16px;

    .stat-item {
      flex: 1;
      text-align: center;
      
      .stat-label {
        font-size: 12px;
        color: $gray-500;
        margin-bottom: 6px;
        font-weight: 500;
      }
      .stat-value {
        font-size: 20px;
        font-weight: 700;
        color: $gray-800;
      }
      .stat-desc {
        font-size: 11px;
        color: $gray-400;
        margin-top: 2px;
      }
    }
  }

  .card-formula {
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid $gray-100;
    text-align: left;
    font-size: 14px;
    color: $gray-600;
    
    strong { color: $gray-800; font-weight: 600; }
    p { margin-top: 6px; color: $gray-500; font-size: 13px; line-height: 1.5; }
  }
}

.card-note {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid $gray-100;
  font-size: 14px;
  color: $gray-600;
  text-align: left;
  line-height: 1.6;
  
  strong { color: $gray-800; font-weight: 600; }
}

.section-title {
  padding: 20px 16px 12px;
  font-size: 12px;
  font-weight: 700;
  color: $gray-500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.report-list {
  background: #fff;
  margin: 0 16px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);

  .report-item {
    display: flex;
    align-items: center;
    padding: 16px 18px;
    border-bottom: 1px solid $gray-100;
    cursor: pointer;
    transition: all 0.15s;

    &:last-child { border-bottom: none; }
    &:active { background: $gray-50; }

    .item-icon {
      width: 50px;
      height: 50px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      flex-shrink: 0;

      .el-icon { font-size: 24px; }

      &.blue { background: rgba(37, 99, 235, 0.1); .el-icon { color: #2563eb; } }
      &.green { background: rgba(16, 185, 129, 0.1); .el-icon { color: #10b981; } }
      &.orange { background: rgba(245, 158, 11, 0.1); .el-icon { color: #f59e0b; } }
      &.purple { background: rgba(139, 92, 246, 0.1); .el-icon { color: #8b5cf6; } }
      &.red { background: rgba(239, 68, 68, 0.1); .el-icon { color: #ef4444; } }
      &.teal { background: rgba(20, 184, 166, 0.1); .el-icon { color: #14b8a6; } }
    }

    .item-content {
      flex: 1;
      min-width: 0;

      .item-title {
        font-size: 15px;
        font-weight: 600;
        color: $gray-800;
        margin-bottom: 4px;
      }
      .item-desc {
        font-size: 13px;
        color: $gray-500;
        line-height: 1.4;
      }
    }

    .badge {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      
      &.new { 
        background: linear-gradient(135deg, #f87171, #ef4444);
        color: #fff; 
      }
    }
  }
}

.placeholder-content {
  text-align: center;
  padding: 80px 20px;
  color: $gray-400;
  
  p { margin-top: 20px; font-size: 15px; font-weight: 500; }
}

.date-picker-sheet {
  .sheet-title {
    padding: 20px 16px 16px;
    text-align: center;
    font-size: 13px;
    color: $gray-500;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    
    &::before {
      content: '';
      display: block;
      width: 40px;
      height: 4px;
      background: $gray-300;
      border-radius: 2px;
      margin: 0 auto 16px;
    }
  }

  .sheet-item {
    padding: 18px 16px;
    text-align: center;
    font-size: 16px;
    font-weight: 500;
    color: $gray-800;
    border-bottom: 1px solid $gray-100;
    cursor: pointer;
    transition: all 0.15s;

    &:active { background: $gray-50; }
    &.cancel { 
      color: $gray-500; 
      font-weight: 600;
      margin-top: 8px;
      border-top: 8px solid $gray-100;
      border-bottom: none;
    }
  }
}
</style>
