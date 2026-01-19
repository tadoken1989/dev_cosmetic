<template>
  <div class="mobile-dashboard">
    <!-- Premium Header -->
    <div class="app-header">
      <div class="header-content">
        <div class="branch-selector">
          <el-icon><Location /></el-icon>
          <span>Chi nhánh mặc định</span>
          <el-icon class="arrow"><ArrowDown /></el-icon>
        </div>
        <div class="header-actions">
          <div class="action-btn">
            <el-icon><Search /></el-icon>
          </div>
          <div class="action-btn notification">
            <el-icon><Bell /></el-icon>
            <span class="badge" v-if="notificationCount > 0">{{ notificationCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-content">
      <!-- Revenue Card - Premium Design -->
      <div class="revenue-section">
        <div class="revenue-card">
          <div class="card-header">
            <div class="header-left">
              <span class="label">DOANH THU HÔM NAY</span>
              <div class="date-badge">
                <el-icon><Calendar /></el-icon>
                <span>{{ currentDate }}</span>
              </div>
            </div>
            <div class="header-right" @click="$router.push('/reports')">
              <span>Xem báo cáo</span>
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
          
          <div class="revenue-amount">
            <span class="currency">₫</span>
            <span class="value">{{ formatCurrency(stats.revenue) }}</span>
          </div>

          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-icon orders">
                <el-icon><ShoppingCart /></el-icon>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ stats.newOrders }}</span>
                <span class="stat-label">Đơn mới</span>
              </div>
            </div>
            <div class="stat-box">
              <div class="stat-icon cancelled">
                <el-icon><CircleClose /></el-icon>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ stats.cancelled }}</span>
                <span class="stat-label">Đơn huỷ</span>
              </div>
            </div>
            <div class="stat-box">
              <div class="stat-icon returns">
                <el-icon><RefreshLeft /></el-icon>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ stats.returns }}</span>
                <span class="stat-label">Trả hàng</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Action Buttons -->
      <div class="main-actions">
        <div class="action-card primary" @click="$router.push('/orders/create')">
          <div class="action-icon">
            <el-icon><Van /></el-icon>
          </div>
          <div class="action-text">
            <span class="title">Bán giao hàng</span>
            <span class="subtitle">Tạo đơn & ship</span>
          </div>
        </div>
        <div class="action-card success" @click="$router.push('/orders/create?type=pos')">
          <div class="action-icon">
            <el-icon><Shop /></el-icon>
          </div>
          <div class="action-text">
            <span class="title">Bán tại quầy</span>
            <span class="subtitle">Bán trực tiếp</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions Grid -->
      <div class="section-container">
        <div class="section-header">
          <h3>Thao tác nhanh</h3>
          <span class="link">Tuỳ chỉnh</span>
        </div>
        <div class="quick-actions">
          <div class="quick-item" @click="$router.push('/products')">
            <div class="item-icon blue">
              <el-icon><Box /></el-icon>
            </div>
            <span>Sản phẩm</span>
          </div>
          <div class="quick-item" @click="$router.push('/customers')">
            <div class="item-icon purple">
              <el-icon><User /></el-icon>
            </div>
            <span>Khách hàng</span>
          </div>
          <div class="quick-item" @click="$router.push('/products/inventory')">
            <div class="item-icon orange">
              <el-icon><Histogram /></el-icon>
            </div>
            <span>Kho hàng</span>
          </div>
          <div class="quick-item" @click="$router.push('/reports')">
            <div class="item-icon teal">
              <el-icon><DataLine /></el-icon>
            </div>
            <span>Báo cáo</span>
          </div>
        </div>
      </div>

      <!-- Pending Orders -->
      <div class="section-container">
        <div class="section-header">
          <h3>Đơn hàng chờ xử lý</h3>
          <span class="link">Xem tất cả</span>
        </div>
        <div class="pending-grid">
          <div class="pending-card" @click="$router.push('/orders?status=pending')">
            <div class="pending-icon yellow">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="pending-info">
              <span class="count">{{ pendingStats.pending }}</span>
              <span class="label">Chờ duyệt</span>
            </div>
          </div>
          <div class="pending-card" @click="$router.push('/orders?status=unpaid')">
            <div class="pending-icon green">
              <el-icon><Wallet /></el-icon>
            </div>
            <div class="pending-info">
              <span class="count">{{ pendingStats.waitingPayment }}</span>
              <span class="label">Chờ thanh toán</span>
            </div>
          </div>
          <div class="pending-card" @click="$router.push('/orders?status=packing')">
            <div class="pending-icon blue">
              <el-icon><Box /></el-icon>
            </div>
            <div class="pending-info">
              <span class="count">{{ pendingStats.packing }}</span>
              <span class="label">Chờ đóng gói</span>
            </div>
          </div>
          <div class="pending-card" @click="$router.push('/orders?status=shipping')">
            <div class="pending-icon purple">
              <el-icon><Van /></el-icon>
            </div>
            <div class="pending-info">
              <span class="count">{{ pendingStats.shipping }}</span>
              <span class="label">Đang giao</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Inventory Alert -->
      <div class="section-container" v-if="inventoryStats.lowStock > 0">
        <div class="alert-card">
          <div class="alert-icon">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="alert-content">
            <span class="alert-title">Sản phẩm sắp hết hàng</span>
            <span class="alert-count">{{ inventoryStats.lowStock }} sản phẩm cần nhập thêm</span>
          </div>
          <el-icon class="alert-arrow"><ArrowRight /></el-icon>
        </div>
      </div>
    </div>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { 
  Location, ArrowDown, Search, ArrowRight, Calendar,
  Van, Shop, Box, User, Histogram, DataLine,
  Clock, Wallet, RefreshLeft, CircleClose, Warning, ShoppingCart
} from '@element-plus/icons-vue'
import { orderService } from '@/services/order.service'
import BottomNav from './BottomNav.vue'

const Bell = {
  template: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>`
}

const notificationCount = ref(4)

const currentDate = computed(() => {
  return new Date().toLocaleDateString('vi-VN', { 
    day: '2-digit', 
    month: '2-digit' 
  })
})

const stats = reactive({
  revenue: 0,
  newOrders: 0,
  cancelled: 0,
  returns: 0
})

const pendingStats = reactive({
  pending: 0,
  waitingPayment: 0,
  packing: 0,
  pickup: 0,
  shipping: 0,
  reship: 0
})

const inventoryStats = reactive({
  lowStock: 0
})

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value || 0)
}

async function loadStats() {
  try {
    const response = await orderService.getOrderStats()
    if (response.success) {
      stats.revenue = response.data.totalRevenue || 0
      stats.newOrders = response.data.totalOrders || 0
      stats.cancelled = response.data.totalCancelled || 0
      stats.returns = response.data.totalReturns || 0
      
      pendingStats.pending = response.data.pending || 0
      pendingStats.waitingPayment = response.data.waitingPayment || 0
      pendingStats.packing = response.data.packing || 0
      pendingStats.pickup = response.data.pickup || 0
      pendingStats.shipping = response.data.shipping || 0
      pendingStats.reship = response.data.reship || 0
    }
  } catch (e) {
    console.error('Load stats error:', e)
  }
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped lang="scss">
// Premium Color System
$primary: #4f46e5;
$primary-light: #6366f1;
$primary-dark: #4338ca;
$success: #10b981;
$success-light: #34d399;
$warning: #f59e0b;
$danger: #ef4444;
$purple: #8b5cf6;
$teal: #14b8a6;
$orange: #f97316;

$gray-50: #f8fafc;
$gray-100: #f1f5f9;
$gray-200: #e2e8f0;
$gray-300: #cbd5e1;
$gray-400: #94a3b8;
$gray-500: #64748b;
$gray-600: #475569;
$gray-700: #334155;
$gray-800: #1e293b;
$gray-900: #0f172a;

$radius: 16px;
$radius-sm: 12px;
$radius-xs: 8px;

.mobile-dashboard {
  min-height: 100vh;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, $primary 0%, $primary-dark 200px, $gray-50 200px);
  overflow: hidden;
}

// Premium Header
.app-header {
  padding: 16px 20px;
  padding-top: calc(env(safe-area-inset-top, 16px) + 16px);
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .branch-selector {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #fff;
    font-size: 15px;
    font-weight: 500;
    background: rgba(255,255,255,0.15);
    padding: 10px 16px;
    border-radius: 50px;
    backdrop-filter: blur(10px);
    
    .arrow { 
      font-size: 12px; 
      opacity: 0.7;
    }
  }

  .header-actions {
    display: flex;
    gap: 8px;

    .action-btn {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.15);
      border-radius: 50%;
      color: #fff;
      backdrop-filter: blur(10px);
      position: relative;

      .el-icon { font-size: 22px; }

      .badge {
        position: absolute;
        top: 6px;
        right: 6px;
        min-width: 18px;
        height: 18px;
        background: $danger;
        color: #fff;
        font-size: 10px;
        font-weight: 700;
        border-radius: 9px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid $primary;
      }
    }
  }
}

.dashboard-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 100px;
}

// Revenue Card
.revenue-section {
  padding: 0 16px 24px;
}

.revenue-card {
  background: #fff;
  border-radius: $radius;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 8px 20px rgba(0,0,0,0.1);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;

    .header-left {
      .label {
        display: block;
        font-size: 11px;
        font-weight: 700;
        color: $gray-400;
        letter-spacing: 0.1em;
        margin-bottom: 8px;
      }

      .date-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: $gray-100;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 12px;
        color: $gray-600;
        font-weight: 500;

        .el-icon { font-size: 14px; }
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 4px;
      color: $primary;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;

      &:active { opacity: 0.7; }
      .el-icon { font-size: 16px; }
    }
  }

  .revenue-amount {
    margin-bottom: 28px;
    display: flex;
    align-items: baseline;
    gap: 4px;

    .currency {
      font-size: 24px;
      font-weight: 600;
      color: $gray-400;
    }

    .value {
      font-size: 42px;
      font-weight: 800;
      color: $gray-900;
      letter-spacing: -0.03em;
      line-height: 1;
    }
  }

  .stats-grid {
    display: flex;
    gap: 12px;
    padding-top: 20px;
    border-top: 1px solid $gray-100;

    .stat-box {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px;
      background: $gray-50;
      border-radius: $radius-sm;

      .stat-icon {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        .el-icon { font-size: 20px; color: #fff; }

        &.orders { background: linear-gradient(135deg, $primary-light, $primary); }
        &.cancelled { background: linear-gradient(135deg, #f87171, $danger); }
        &.returns { background: linear-gradient(135deg, $warning, #d97706); }
      }

      .stat-info {
        display: flex;
        flex-direction: column;
        
        .stat-value {
          font-size: 20px;
          font-weight: 700;
          color: $gray-800;
          line-height: 1.2;
        }

        .stat-label {
          font-size: 11px;
          color: $gray-500;
          font-weight: 500;
        }
      }
    }
  }
}

// Main Actions
.main-actions {
  display: flex;
  gap: 12px;
  padding: 0 16px 24px;

  .action-card {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 18px 16px;
    border-radius: $radius;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);

    &:active {
      transform: scale(0.97);
    }

    &.primary {
      background: linear-gradient(135deg, $primary-light 0%, $primary 100%);
      color: #fff;
    }

    &.success {
      background: linear-gradient(135deg, $success-light 0%, $success 100%);
      color: #fff;
    }

    .action-icon {
      width: 48px;
      height: 48px;
      background: rgba(255,255,255,0.2);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;

      .el-icon { font-size: 24px; }
    }

    .action-text {
      display: flex;
      flex-direction: column;

      .title {
        font-size: 15px;
        font-weight: 700;
      }

      .subtitle {
        font-size: 12px;
        opacity: 0.85;
        margin-top: 2px;
      }
    }
  }
}

// Section Container
.section-container {
  background: #fff;
  margin: 0 16px 16px;
  padding: 20px;
  border-radius: $radius;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      font-size: 16px;
      font-weight: 700;
      color: $gray-800;
      margin: 0;
    }

    .link {
      font-size: 13px;
      color: $primary;
      font-weight: 600;
      cursor: pointer;
    }
  }
}

// Quick Actions
.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;

  .quick-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 8px;
    border-radius: $radius-sm;
    cursor: pointer;
    transition: all 0.15s;

    &:active {
      background: $gray-50;
      transform: scale(0.95);
    }

    .item-icon {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 10px;

      .el-icon { font-size: 26px; color: #fff; }

      &.blue { background: linear-gradient(135deg, #60a5fa, #3b82f6); }
      &.purple { background: linear-gradient(135deg, #a78bfa, $purple); }
      &.orange { background: linear-gradient(135deg, #fb923c, $orange); }
      &.teal { background: linear-gradient(135deg, #2dd4bf, $teal); }
    }

    span {
      font-size: 12px;
      font-weight: 600;
      color: $gray-600;
    }
  }
}

// Pending Grid
.pending-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  .pending-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px;
    background: $gray-50;
    border-radius: $radius-sm;
    cursor: pointer;
    transition: all 0.15s;

    &:active {
      background: $gray-100;
    }

    .pending-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      .el-icon { font-size: 22px; color: #fff; }

      &.yellow { background: linear-gradient(135deg, #fbbf24, $warning); }
      &.green { background: linear-gradient(135deg, #34d399, $success); }
      &.blue { background: linear-gradient(135deg, #60a5fa, #3b82f6); }
      &.purple { background: linear-gradient(135deg, #a78bfa, $purple); }
    }

    .pending-info {
      display: flex;
      flex-direction: column;

      .count {
        font-size: 22px;
        font-weight: 800;
        color: $gray-800;
        line-height: 1.2;
      }

      .label {
        font-size: 12px;
        color: $gray-500;
        font-weight: 500;
      }
    }
  }
}

// Alert Card
.alert-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border-radius: $radius-sm;
  cursor: pointer;

  .alert-icon {
    width: 44px;
    height: 44px;
    background: $warning;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;

    .el-icon { font-size: 22px; color: #fff; }
  }

  .alert-content {
    flex: 1;
    display: flex;
    flex-direction: column;

    .alert-title {
      font-size: 14px;
      font-weight: 700;
      color: $gray-800;
    }

    .alert-count {
      font-size: 12px;
      color: $gray-600;
      margin-top: 2px;
    }
  }

  .alert-arrow {
    color: $gray-400;
    font-size: 18px;
  }
}
</style>
