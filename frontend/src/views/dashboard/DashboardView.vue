<template>
  <!-- Mobile View - Render separate component -->
  <MobileDashboard v-if="isMobile" />
  
  <!-- Desktop View -->
  <div v-else class="dashboard">
    <div class="dashboard-content">
      <!-- Title -->
      <div class="page-title-bar">
        <h1>Tổng quan</h1>
        <div class="header-actions">
          <el-button text @click="handleSwitchBranch">
            <el-icon><Switch /></el-icon> Chuyển đổi
          </el-button>
        </div>
      </div>

      <!-- Kết quả kinh doanh trong ngày -->
      <div class="stats-section">
        <div class="section-header">
          <span class="title">KẾT QUẢ KINH DOANH TRONG NGÀY</span>
          <el-select v-model="branchFilter" size="small" style="width: 150px">
            <el-option label="Tất cả chi nhánh" value="all" />
          </el-select>
        </div>

        <el-row :gutter="16" class="stats-row">
          <el-col :span="6">
            <div class="stat-card revenue">
              <div class="icon-wrapper">
                <el-icon :size="24"><Money /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-label">Doanh thu</div>
                <div class="stat-value text-primary">{{ formatCurrency(stats.revenue) }}</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card new-orders">
              <div class="icon-wrapper">
                <el-icon :size="24"><ShoppingBag /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-label">Đơn hàng mới</div>
                <div class="stat-value text-success">{{ stats.newOrders }}</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card returns">
              <div class="icon-wrapper">
                <el-icon :size="24"><RefreshLeft /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-label">Đơn trả hàng</div>
                <div class="stat-value text-warning">{{ stats.returns }}</div>
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card cancelled">
              <div class="icon-wrapper">
                <el-icon :size="24"><CircleClose /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-label">Đơn hủy</div>
                <div class="stat-value text-danger">{{ stats.cancelled }}</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- Main Content Row -->
      <el-row :gutter="16">
        <!-- Left Column -->
        <el-col :span="16">
          <!-- Doanh thu bán hàng -->
          <el-card class="content-card chart-card">
            <template #header>
              <div class="card-header-left">
                <el-tabs v-model="salesTab" class="card-tabs">
                  <el-tab-pane label="DOANH THU BÁN HÀNG" name="sales" />
                  <el-tab-pane label="TỶ TRỌNG BÁN HÀNG" name="proportion" />
                </el-tabs>
              </div>
              <div class="header-filters">
                <el-select v-model="salesBranchFilter" size="small" style="width: 150px">
                  <el-option label="Tất cả chi nhánh" value="all" />
                </el-select>
                <el-select v-model="salesPeriod" size="small" style="width: 140px" @change="loadRevenueData">
                  <el-option label="Hôm nay" value="today" />
                  <el-option label="Hôm qua" value="yesterday" />
                  <el-option label="7 ngày qua" value="7" />
                  <el-option label="Tháng này" value="month" />
                  <el-option label="Tháng trước" value="lastmonth" />
                </el-select>
              </div>
            </template>
            <div class="chart-container">
              <div class="bar-chart-wrapper">
                <!-- Y Axis Labels -->
                <div class="y-axis">
                  <div class="y-label" v-for="label in yAxisLabels" :key="label">
                    {{ formatYAxisLabel(label) }}
                  </div>
                </div>
                
                <!-- Chart Area -->
                <div class="chart-area">
                  <!-- Grid Lines -->
                  <div class="grid-lines">
                    <div class="grid-line" v-for="i in 4" :key="i"></div>
                  </div>
                  
                  <!-- Bars -->
                  <div class="bars-container">
                    <div 
                      v-for="(item, index) in revenueChartData" 
                      :key="index" 
                      class="bar-wrapper"
                    >
                      <div 
                        class="bar" 
                        :style="{ height: getBarHeight(item.value) + '%' }"
                        :title="formatCurrency(item.value)"
                      ></div>
                      <div class="x-label">{{ item.label }}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="chart-total">
                Tổng doanh thu: <strong>{{ formatCurrency(totalRevenue) }}</strong>
              </div>
            </div>
          </el-card>

          <!-- Đơn hàng chờ xử lý -->
          <el-card class="content-card">
            <template #header>
              <span class="card-title">ĐƠN HÀNG CHỜ XỬ LÝ</span>
              <el-select v-model="pendingPeriod" size="small" style="width: 120px">
                <el-option label="7 ngày qua" value="7" />
              </el-select>
            </template>
            <div class="pending-orders-grid">
              <div class="pending-item" @click="goToOrders('pending')">
                <el-icon :size="32" color="#e6a23c"><Clock /></el-icon>
                <div class="pending-info">
                  <div class="label">Chờ duyệt</div>
                  <div class="value">{{ pendingStats.pending }}</div>
                </div>
              </div>
              <div class="pending-item" @click="goToOrders('waiting_payment')">
                <el-icon :size="32" color="#909399"><Wallet /></el-icon>
                <div class="pending-info">
                  <div class="label">Chờ thanh toán</div>
                  <div class="value">{{ pendingStats.waitingPayment }}</div>
                </div>
              </div>
              <div class="pending-item" @click="goToOrders('packing')">
                <el-icon :size="32" color="#409eff"><Box /></el-icon>
                <div class="pending-info">
                  <div class="label">Chờ đóng gói</div>
                  <div class="value">{{ pendingStats.packing }}</div>
                </div>
              </div>
              <div class="pending-item" @click="goToOrders('pickup')">
                <el-icon :size="32" color="#67c23a"><Van /></el-icon>
                <div class="pending-info">
                  <div class="label">Chờ lấy hàng</div>
                  <div class="value">{{ pendingStats.pickup }}</div>
                </div>
              </div>
              <div class="pending-item" @click="goToOrders('shipping')">
                <el-icon :size="32" color="#409eff"><Coordinate /></el-icon>
                <div class="pending-info">
                  <div class="label">Đang giao hàng</div>
                  <div class="value">{{ pendingStats.shipping }}</div>
                </div>
              </div>
              <div class="pending-item" @click="goToOrders('cancelled')">
                <el-icon :size="32" color="#f56c6c"><RefreshLeft /></el-icon>
                <div class="pending-info">
                  <div class="label">Hủy giao - Chờ nhận</div>
                  <div class="value">{{ pendingStats.cancelled }}</div>
                </div>
              </div>
            </div>
          </el-card>

          <!-- Top sản phẩm -->
          <el-card class="content-card">
            <template #header>
              <span class="card-title">TOP SẢN PHẨM</span>
              <div class="header-filters">
                <el-select v-model="topProductsPeriod" size="small" style="width: 140px" @change="loadTopProducts">
                  <el-option label="Hôm nay" value="today" />
                  <el-option label="Hôm qua" value="yesterday" />
                  <el-option label="7 ngày qua" value="7" />
                  <el-option label="Tháng này" value="month" />
                  <el-option label="Năm nay" value="year" />
                </el-select>
                <el-button text size="small">...</el-button>
              </div>
            </template>
            <div class="top-products-list">
              <div v-if="topProducts.length === 0" class="empty-state">
                <el-empty description="Chưa có sản phẩm bán chạy" :image-size="60" />
              </div>
              <div v-else>
                <div 
                  v-for="(product, idx) in topProducts" 
                  :key="product.id" 
                  class="top-product-item"
                >
                  <div class="rank" :class="{ top: Number(idx) < 3 }">{{ String(Number(idx) + 1).padStart(2, '0') }}</div>
                  <div class="product-info">
                    <div class="name">{{ product.name }}</div>
                    <div class="sku">{{ product.sku }}</div>
                  </div>
                  <div class="quantity">{{ product.quantity }}</div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- Right Column -->
        <el-col :span="8">
          <!-- Thông tin kho -->
          <el-card class="content-card info-card">
            <template #header>
              <span class="card-title">THÔNG TIN KHO</span>
              <el-select v-model="inventoryBranchFilter" size="small" style="width: 150px">
                <el-option label="Tất cả chi nhánh" value="all" />
              </el-select>
            </template>
            <div class="info-list">
              <div class="info-item clickable" @click="goToInventory('low')">
                <div class="info-label">
                  <el-icon color="#f56c6c"><WarningFilled /></el-icon>
                  <span>Sản phẩm dưới định mức</span>
                </div>
                <div class="info-value">{{ inventoryStats.lowStock }}</div>
                <el-icon><ArrowRight /></el-icon>
              </div>
              <div class="info-item clickable" @click="goToInventory('total')">
                <div class="info-label">
                  <span>Số tồn kho chi nhánh</span>
                </div>
                <div class="info-value">{{ formatNumber(inventoryStats.totalStock) }}</div>
                <el-icon><ArrowRight /></el-icon>
              </div>
              <div class="info-item clickable" @click="goToInventory('value')">
                <div class="info-label">
                  <span>Giá trị tồn kho chi nhánh</span>
                </div>
                <div class="info-value">{{ formatCurrency(inventoryStats.totalValue) }}</div>
                <el-icon><ArrowRight /></el-icon>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Money, ShoppingBag, RefreshLeft, CircleClose, Clock, Wallet,
  Box, Van, Coordinate, WarningFilled, ArrowRight, Switch
} from '@element-plus/icons-vue'
import { orderService } from '@/services/order.service'
import { productService } from '@/services/product.service'
import { useDevice } from '@/composables/useDevice'
import MobileDashboard from '@/components/mobile/MobileDashboard.vue'

const { isMobile } = useDevice()

const router = useRouter()

// Filters
const branchFilter = ref('all')
const salesTab = ref('sales')
const salesBranchFilter = ref('all')
const salesPeriod = ref('7')
const pendingPeriod = ref('7')
const topProductsPeriod = ref('7')
const inventoryBranchFilter = ref('all')

// Stats from database
const stats = reactive({
  revenue: 0,
  newOrders: 0,
  returns: 0,
  cancelled: 0,
})

const pendingStats = reactive({
  pending: 0,
  waitingPayment: 0,
  packing: 0,
  pickup: 0,
  shipping: 0,
  cancelled: 0,
})

const inventoryStats = reactive({
  lowStock: 0,
  totalStock: 0,
  totalValue: 0,
})

const topProducts = ref<any[]>([])
const revenueChartData = ref<any[]>([])
const recentOrders = ref<any[]>([])

// Computed
const totalRevenue = computed(() => {
  return revenueChartData.value.reduce((sum: number, item: any) => sum + (item.value || 0), 0)
})

const maxChartValue = computed(() => {
  const max = Math.max(...revenueChartData.value.map((d: any) => d.value || 0), 1)
  // Round up to nice number
  const magnitude = Math.pow(10, Math.floor(Math.log10(max)))
  return Math.ceil(max / magnitude) * magnitude || 1000000
})

const yAxisLabels = computed(() => {
  const max = maxChartValue.value
  return [max, max * 0.75, max * 0.5, max * 0.25, 0].reverse()
})

// Methods
function formatYAxisLabel(value: number) {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(0) + ',000,000'
  } else if (value >= 1000) {
    return new Intl.NumberFormat('vi-VN').format(value)
  }
  return value.toString()
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value || 0)
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value || 0)
}

function getBarHeight(value: number) {
  return Math.round((value / maxChartValue.value) * 100)
}

async function loadDashboardStats() {
  try {
    // Load order stats
    const orderStats = await orderService.getOrderStats()
    if (orderStats.success) {
      stats.revenue = orderStats.data.totalRevenue || 0
      stats.newOrders = orderStats.data.totalOrders || 0
      stats.returns = orderStats.data.totalReturns || 0
      stats.cancelled = orderStats.data.totalCancelled || 0
      
      // Pending stats - map from backend response
      pendingStats.pending = orderStats.data.pending || 0
      pendingStats.waitingPayment = orderStats.data.waitingPayment || 0
      pendingStats.packing = orderStats.data.packing || 0
      pendingStats.pickup = orderStats.data.pickup || 0
      pendingStats.shipping = orderStats.data.shipping || 0
      pendingStats.cancelled = orderStats.data.reship || 0
    }
    
    // Also calculate total revenue from all orders (not just today/delivered)
    const allOrders = await orderService.getOrders({ page: 1, pageSize: 1000, _t: Date.now() })
    const orders = allOrders.data?.data || allOrders.data || []
    
    // Set recent orders for mobile view
    recentOrders.value = Array.isArray(orders) ? orders.slice(0, 10) : []
    
    // Calculate total revenue from paid/delivered orders
    const todayRevenue = orders
      .filter((o: any) => {
        const today = new Date()
        const orderDate = new Date(o.createdAt)
        return orderDate.toDateString() === today.toDateString() &&
          (o.status === 'delivered' || o.paymentStatus === 'paid')
      })
      .reduce((sum: number, o: any) => sum + (parseFloat(o.total) || 0), 0)
    
    // Update revenue if backend returns 0 but we have orders
    if (stats.revenue === 0 && todayRevenue > 0) {
      stats.revenue = todayRevenue
    }
  } catch (e) {
    console.error('Load dashboard stats error:', e)
  }
}

async function loadInventoryStats() {
  try {
    const res = await productService.getProducts({ page: 1, pageSize: 1000 })
    const products = res.data || []
    
    let totalStock = 0
    let totalValue = 0
    let lowStock = 0
    
    // Use inventory data from products API (already included via JOIN)
    products.forEach((product: any) => {
      const qty = product.stockQuantity || 0
      const price = product.costPrice || product.importPrice || product.retailPrice || 0
      const minStock = product.minStock || 5
      
      totalStock += qty
      totalValue += qty * price
      if (qty <= minStock) {
        lowStock++
      }
    })
    
    inventoryStats.totalStock = totalStock
    inventoryStats.totalValue = totalValue
    inventoryStats.lowStock = lowStock
  } catch (e) {
    console.error('Load inventory stats error:', e)
  }
}

async function loadRevenueData() {
  try {
    const today = new Date()
    const data: any[] = []
    let startDate: Date
    let numDays: number
    
    // Calculate date range
    switch (salesPeriod.value) {
      case 'today':
        startDate = new Date(today)
        startDate.setHours(0, 0, 0, 0)
        numDays = 1
        break
      case 'yesterday':
        startDate = new Date(today)
        startDate.setDate(startDate.getDate() - 1)
        startDate.setHours(0, 0, 0, 0)
        numDays = 1
        break
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        numDays = today.getDate()
        break
      case 'lastmonth':
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        startDate = lastMonth
        numDays = new Date(today.getFullYear(), today.getMonth(), 0).getDate()
        break
      default:
        numDays = parseInt(salesPeriod.value) || 7
        startDate = new Date(today)
        startDate.setDate(startDate.getDate() - numDays + 1)
        startDate.setHours(0, 0, 0, 0)
    }
    
    // Get orders
    const res = await orderService.getOrders({ page: 1, pageSize: 1000, _t: Date.now() })
    const orders = res.data?.data || res.data || []
    
    // Generate chart data
    for (let i = 0; i < numDays; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayRevenue = orders
        .filter((o: any) => {
          const orderDate = new Date(o.createdAt).toISOString().split('T')[0]
          return orderDate === dateStr && o.status === 'delivered'
        })
        .reduce((sum: number, o: any) => sum + (parseFloat(o.total) || 0), 0)
      
      data.push({
        label: `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`,
        value: dayRevenue,
      })
    }
    
    revenueChartData.value = data
  } catch (e) {
    console.error('Load revenue data error:', e)
    revenueChartData.value = []
  }
}

async function loadTopProducts() {
  try {
    const res = await orderService.getOrders({ page: 1, pageSize: 1000 })
    const orders = res.data?.data || res.data || []
    
    // Calculate date range based on period
    const now = new Date()
    let startDate: Date
    
    switch (topProductsPeriod.value) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'yesterday':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
        const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        // Filter only yesterday
        const filteredOrders = orders.filter((o: any) => {
          const orderDate = new Date(o.createdAt)
          return orderDate >= startDate && orderDate < endDate && o.status !== 'cancelled'
        })
        calculateTopProducts(filteredOrders)
        return
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      case '7':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }
    
    // Filter orders by date range
    const filteredOrders = orders.filter((o: any) => {
      const orderDate = new Date(o.createdAt)
      return orderDate >= startDate && o.status !== 'cancelled'
    })
    
    calculateTopProducts(filteredOrders)
  } catch (e) {
    console.error('Load top products error:', e)
    topProducts.value = []
  }
}

function calculateTopProducts(orders: any[]) {
  // Count product sales
  const productCounts: Record<string, { name: string; sku: string; quantity: number }> = {}
  
  orders.forEach((order: any) => {
    if (order.items) {
      order.items.forEach((item: any) => {
        const key = item.productId || item.productName
        if (!productCounts[key]) {
          productCounts[key] = {
            name: item.productName || 'Sản phẩm',
            sku: item.sku || '',
            quantity: 0,
          }
        }
        productCounts[key].quantity += item.quantity || 1
      })
    }
  })
  
  // Sort by quantity
  topProducts.value = Object.entries(productCounts)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
}

function goToOrders(status: string) {
  router.push({ path: '/orders', query: { status } })
}

function goToInventory(type: string) {
  router.push('/products/inventory')
}

function handleSwitchBranch() {
  ElMessage.info('Tính năng chuyển đổi chi nhánh')
}

onMounted(() => {
  loadDashboardStats()
  loadInventoryStats()
  loadRevenueData()
  loadTopProducts()
})
</script>

<style scoped lang="scss">
.dashboard {
  background: #f5f7fa;
  min-height: 100%;

  .dashboard-content {
    padding: 20px;
  }

  .page-title-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h1 {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }
  }

  .stats-section {
    background: #fff;
    border-radius: 8px;
    padding: 16px 20px;
    margin-bottom: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .title {
        font-size: 13px;
        font-weight: 600;
        color: #606266;
        text-transform: uppercase;
      }
    }

    .stats-row {
      .stat-card {
        background: #fff;
        border-radius: 8px;
        padding: 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        border: 1px solid #f0f0f0;

        .icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        &.revenue .icon-wrapper {
          background: #e3f2fd;
          color: #2196f3;
        }

        &.new-orders .icon-wrapper {
          background: #e8f5e9;
          color: #4caf50;
        }

        &.returns .icon-wrapper {
          background: #fff3e0;
          color: #ff9800;
        }

        &.cancelled .icon-wrapper {
          background: #ffebee;
          color: #f44336;
        }

        .stat-content {
          .stat-label {
            font-size: 13px;
            color: #909399;
            margin-bottom: 4px;
          }

          .stat-value {
            font-size: 22px;
            font-weight: 600;
            
            &.text-primary { color: #2196f3; }
            &.text-success { color: #4caf50; }
            &.text-warning { color: #ff9800; }
            &.text-danger { color: #f44336; }
          }
        }
      }
    }
  }

  .content-card {
    margin-bottom: 16px;
    border-radius: 8px;
    border: none;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

    :deep(.el-card__header) {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      border-bottom: 1px solid #f0f0f0;
    }

    .card-title {
      font-size: 13px;
      font-weight: 600;
      color: #303133;
      text-transform: uppercase;
    }

    .card-header-left {
      flex: 1;
    }

    .card-tabs {
      :deep(.el-tabs__header) {
        margin: 0;
      }

      :deep(.el-tabs__nav-wrap::after) {
        display: none;
      }

      :deep(.el-tabs__item) {
        font-size: 13px;
        font-weight: 600;
      }

      :deep(.el-tabs__active-bar) {
        height: 3px;
      }
    }

    .header-filters {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  }

  .chart-card {
    .chart-container {
      padding: 16px 0;
    }

    .bar-chart-wrapper {
      display: flex;
      height: 280px;
      
      .y-axis {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding-right: 12px;
        padding-bottom: 28px;
        min-width: 80px;
        text-align: right;
        
        .y-label {
          font-size: 12px;
          color: #909399;
          line-height: 1;
        }
      }
      
      .chart-area {
        flex: 1;
        position: relative;
        border-left: 1px solid #e4e7ed;
        border-bottom: 1px solid #e4e7ed;
        
        .grid-lines {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 28px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          
          .grid-line {
            border-top: 1px dashed #e4e7ed;
            height: 0;
          }
        }
        
        .bars-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: flex-end;
          padding-bottom: 28px;
          
          .bar-wrapper {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            height: 100%;
            justify-content: flex-end;
            
            .bar {
              width: 36px;
              max-width: 80%;
              background: #409eff;
              border-radius: 3px 3px 0 0;
              min-height: 2px;
              transition: height 0.3s ease;
              cursor: pointer;
              
              &:hover {
                background: #337ecc;
              }
            }
            
            .x-label {
              position: absolute;
              bottom: 0;
              font-size: 12px;
              color: #909399;
              padding-top: 8px;
              height: 28px;
              line-height: 20px;
            }
          }
        }
      }
    }
    
    .chart-total {
      text-align: center;
      margin-top: 16px;
      font-size: 14px;
      color: #606266;
      
      strong {
        color: #303133;
      }
    }
  }

  .pending-orders-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    padding: 8px 0;

    .pending-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: #f5f7fa;
      }

      .pending-info {
        .label {
          font-size: 13px;
          color: #909399;
          margin-bottom: 4px;
        }

        .value {
          font-size: 20px;
          font-weight: 600;
          color: #303133;
        }
      }
    }
  }

  .top-products-list {
    .empty-state {
      padding: 20px 0;
    }

    .top-product-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .rank {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #f0f0f0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
        color: #909399;
        margin-right: 12px;

        &.top {
          background: #409eff;
          color: #fff;
        }
      }

      .product-info {
        flex: 1;

        .name {
          font-size: 14px;
          color: #303133;
          font-weight: 500;
        }

        .sku {
          font-size: 12px;
          color: #909399;
        }
      }

      .quantity {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }
  }

  .info-card {
    .info-list {
      .info-item {
        display: flex;
        align-items: center;
        padding: 16px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        &.clickable {
          cursor: pointer;
          margin: 0 -20px;
          padding: 16px 20px;
          border-radius: 0;

          &:hover {
            background: #f5f7fa;
          }
        }

        .info-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #606266;
          flex: 1;
        }

        .info-value {
          font-size: 16px;
          font-weight: 600;
          color: #409eff;
          margin-right: 8px;
        }
      }
    }
  }
}
</style>
