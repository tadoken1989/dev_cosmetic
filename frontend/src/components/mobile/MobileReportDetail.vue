<template>
  <div class="mobile-report-detail">
    <!-- Header -->
    <div class="detail-header">
      <div class="header-left" @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="page-title">{{ pageTitle }}</div>
      <div class="header-right">
        <el-icon><Search /></el-icon>
      </div>
    </div>

    <!-- Date & Filter Bar -->
    <div class="filter-bar">
      <div class="date-picker" @click="showDatePicker = true">
        <el-icon><Calendar /></el-icon>
        <span>{{ formattedDate }}</span>
        <el-icon><ArrowDown /></el-icon>
      </div>
      <div class="filter-actions">
        <el-icon @click="showFilter = true"><Filter /></el-icon>
        <el-icon @click="refreshData"><Refresh /></el-icon>
      </div>
    </div>

    <!-- Content based on report type -->
    <div class="report-content" v-loading="loading">
      <!-- Báo cáo tồn kho -->
      <template v-if="reportType === 'inventory-stock'">
        <div class="summary-box">
          <div class="summary-header">
            <el-icon color="#67c23a" :size="28"><Box /></el-icon>
            <el-icon class="info-icon"><InfoFilled /></el-icon>
          </div>
          <div class="summary-label">GIÁ TRỊ TỒN KHO</div>
          <div class="summary-value green">{{ formatNumber(inventorySummary.totalValue) }}</div>
          <div class="summary-sub">SL: {{ formatNumber(inventorySummary.totalQuantity) }}</div>
        </div>

        <div class="product-list">
          <div 
            class="product-item" 
            v-for="item in inventoryItems" 
            :key="item.id"
            @click="viewProduct(item.productId)"
          >
            <div class="item-left">
              <div class="item-name">{{ item.productName }}</div>
              <div class="item-sku">SKU: {{ item.sku }}</div>
            </div>
            <div class="item-right">
              <div class="item-value">{{ formatNumber(item.value) }}</div>
              <div class="item-qty">SL: {{ item.quantity }}</div>
              <div class="item-cost">Giá vốn:{{ formatNumber(item.costPrice) }}</div>
            </div>
          </div>
        </div>
      </template>

      <!-- Sổ kho -->
      <template v-else-if="reportType === 'inventory-ledger'">
        <div class="ledger-summary">
          <div class="summary-item">
            <el-icon color="#2196f3"><Download /></el-icon>
            <div class="summary-content">
              <div class="summary-label">Giá trị nhập kho</div>
              <div class="summary-value">{{ formatNumber(ledgerSummary.importValue) }}</div>
            </div>
          </div>
          <div class="summary-item">
            <el-icon color="#67c23a"><Upload /></el-icon>
            <div class="summary-content">
              <div class="summary-label">Giá trị xuất kho</div>
              <div class="summary-value">{{ formatNumber(ledgerSummary.exportValue) }}</div>
            </div>
          </div>
          <el-icon class="info-icon"><InfoFilled /></el-icon>
        </div>

        <div class="ledger-list">
          <div 
            class="ledger-item" 
            v-for="entry in ledgerEntries" 
            :key="entry.id"
          >
            <div class="entry-header">
              <div class="entry-name">{{ entry.productName }}</div>
              <div class="entry-value">{{ formatNumber(entry.value) }}</div>
            </div>
            <div class="entry-details">
              <div class="entry-date">{{ formatDate(entry.date) }}</div>
              <div class="entry-qty" :class="{ positive: entry.quantityChange > 0, negative: entry.quantityChange < 0 }">
                SL: {{ entry.quantityChange > 0 ? '+' : '' }}{{ entry.quantityChange }}
              </div>
            </div>
            <div class="entry-meta">
              <span class="entry-doc">{{ entry.documentCode }}</span>
              <span class="entry-branch">{{ entry.branch }}</span>
            </div>
            <div class="entry-action">{{ entry.action }}</div>
          </div>
        </div>
      </template>

      <!-- Empty state for other report types -->
      <template v-else>
        <div class="placeholder-content">
          <el-icon :size="60"><DataAnalysis /></el-icon>
          <p>Báo cáo "{{ pageTitle }}" đang được phát triển</p>
        </div>
      </template>
    </div>

    <!-- Date Picker -->
    <el-action-sheet v-model="showDatePicker" title="Chọn ngày">
      <div class="action-item" @click="setDate('today')">Hôm nay</div>
      <div class="action-item" @click="setDate('yesterday')">Hôm qua</div>
      <div class="action-item" @click="setDate('thisWeek')">Tuần này</div>
      <div class="action-item" @click="setDate('thisMonth')">Tháng này</div>
    </el-action-sheet>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ArrowLeft, Search, Calendar, ArrowDown, Filter, Refresh,
  Box, InfoFilled, Download, Upload, DataAnalysis
} from '@element-plus/icons-vue'
import { productService } from '@/services/product.service'
import { orderService } from '@/services/order.service'

const route = useRoute()
const router = useRouter()

const reportType = computed(() => route.params.type as string)
const loading = ref(false)
const showDatePicker = ref(false)
const showFilter = ref(false)
const selectedDate = ref(new Date())

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    'inventory-stock': 'Báo cáo tồn kho',
    'inventory-ledger': 'Sổ kho',
    'inventory-movement': 'Xuất nhập tồn',
    'low-stock': 'Dưới định mức',
    'over-stock': 'Vượt định mức',
    'batch-expiry': 'Báo cáo Lô - HSD',
    'revenue': 'Báo cáo doanh thu',
    'profit': 'Báo cáo lợi nhuận',
    'payment': 'Báo cáo thanh toán',
    'order-stats': 'Thống kê đơn hàng',
    'orders': 'Báo cáo đặt hàng'
  }
  return titles[reportType.value] || 'Báo cáo'
})

const formattedDate = computed(() => {
  return selectedDate.value.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
})

const inventorySummary = reactive({
  totalValue: 0,
  totalQuantity: 0
})

const ledgerSummary = reactive({
  importValue: 0,
  exportValue: 0
})

const inventoryItems = ref<any[]>([])
const ledgerEntries = ref<any[]>([])

function formatNumber(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value || 0)
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function setDate(preset: string) {
  const now = new Date()
  switch (preset) {
    case 'today':
      selectedDate.value = now
      break
    case 'yesterday':
      selectedDate.value = new Date(now.setDate(now.getDate() - 1))
      break
    case 'thisWeek':
    case 'thisMonth':
      selectedDate.value = now
      break
  }
  showDatePicker.value = false
  loadData()
}

function viewProduct(productId: number) {
  router.push(`/products/${productId}`)
}

function refreshData() {
  loadData()
}

async function loadInventoryStock() {
  try {
    const res = await productService.getProducts({ page: 1, pageSize: 500 })
    const products = res?.data || res?.items || res || []
    
    let totalValue = 0
    let totalQuantity = 0
    const items: any[] = []
    
    // Use inventory data from products API (already included via JOIN)
    for (const product of products) {
      const stockQty = product.stockQuantity || 0
      const costPrice = product.costPrice || product.importPrice || product.retailPrice || 0
      
      const value = stockQty * costPrice
      totalValue += value
      totalQuantity += stockQty
      
      items.push({
        id: product.id,
        productId: product.id,
        productName: product.name,
        sku: product.sku || 'N/A',
        quantity: stockQty,
        costPrice: costPrice,
        value: value
      })
    }
    
    // Sort by value descending
    items.sort((a, b) => b.value - a.value)
    
    inventoryItems.value = items
    inventorySummary.totalValue = totalValue
    inventorySummary.totalQuantity = totalQuantity
  } catch (e) {
    console.error('Load inventory stock error:', e)
  }
}

async function loadInventoryLedger() {
  try {
    // Get delivered orders for export
    const ordersRes = await orderService.getOrders({ 
      page: 1, 
      pageSize: 100,
      status: 'delivered'
    })
    const orders = ordersRes?.data || ordersRes?.items || []
    
    let importValue = 0
    let exportValue = 0
    const entries: any[] = []
    
    // Process delivered orders as exports
    for (const order of orders) {
      const orderItems = order.items || []
      for (const item of orderItems) {
        const value = (item.unitPrice || item.price || 0) * (item.quantity || 1)
        exportValue += value
        
        entries.push({
          id: `order-${order.id}-${item.productId || item.id}`,
          productName: item.productName || item.name || 'Sản phẩm',
          date: order.deliveredAt || order.createdAt,
          documentCode: order.orderNumber || `SON${String(order.id).padStart(5, '0')}`,
          quantityChange: -(item.quantity || 1),
          value: value,
          action: 'Giao hàng cho khách',
          branch: 'Chi nhánh mặc định'
        })
      }
    }
    
    // TODO: Get import receipts for importValue
    importValue = 26900000 // Placeholder
    
    // Sort by date descending
    entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    ledgerEntries.value = entries.slice(0, 50) // Limit to 50 entries
    ledgerSummary.importValue = importValue
    ledgerSummary.exportValue = exportValue
  } catch (e) {
    console.error('Load ledger error:', e)
  }
}

async function loadData() {
  loading.value = true
  try {
    if (reportType.value === 'inventory-stock') {
      await loadInventoryStock()
    } else if (reportType.value === 'inventory-ledger') {
      await loadInventoryLedger()
    }
  } finally {
    loading.value = false
  }
}

watch(reportType, () => {
  loadData()
}, { immediate: false })

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.mobile-report-detail {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.detail-header {
  background: #fff;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e4e7ed;

  .header-left { 
    width: 40px;
    .el-icon { font-size: 24px; cursor: pointer; color: #303133; }
  }
  .page-title { 
    flex: 1; 
    text-align: center; 
    font-size: 17px; 
    font-weight: 600; 
  }
  .header-right { 
    width: 40px; 
    text-align: right;
    .el-icon { font-size: 20px; cursor: pointer; color: #606266; }
  }
}

.filter-bar {
  background: #fff;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e4e7ed;

  .date-picker {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #606266;
    cursor: pointer;
    
    .el-icon { font-size: 16px; color: #909399; }
  }

  .filter-actions {
    display: flex;
    gap: 16px;
    .el-icon { 
      font-size: 20px; 
      color: #409eff; 
      cursor: pointer; 
    }
  }
}

.report-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.summary-box {
  background: #fff;
  margin: 16px;
  padding: 24px;
  border-radius: 12px;
  text-align: center;
  position: relative;

  .summary-header {
    display: flex;
    justify-content: center;
    margin-bottom: 12px;
  }

  .info-icon {
    position: absolute;
    top: 16px;
    right: 16px;
    font-size: 18px;
    color: #909399;
  }

  .summary-label {
    font-size: 12px;
    color: #909399;
    margin-bottom: 8px;
  }

  .summary-value {
    font-size: 28px;
    font-weight: 700;
    color: #303133;
    margin-bottom: 4px;
    
    &.green { color: #67c23a; }
  }

  .summary-sub {
    font-size: 14px;
    color: #606266;
  }
}

.product-list {
  background: #fff;

  .product-item {
    display: flex;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid #f5f5f5;
    cursor: pointer;

    &:active { background: #f9f9f9; }

    .item-left {
      flex: 1;
      min-width: 0;
      
      .item-name {
        font-size: 14px;
        font-weight: 500;
        color: #303133;
        margin-bottom: 4px;
        line-height: 1.4;
      }
      .item-sku {
        font-size: 12px;
        color: #909399;
      }
    }

    .item-right {
      text-align: right;
      
      .item-value {
        font-size: 15px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 2px;
      }
      .item-qty {
        font-size: 12px;
        color: #909399;
      }
      .item-cost {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}

.ledger-summary {
  background: #fff;
  margin: 16px;
  padding: 20px;
  border-radius: 12px;
  display: flex;
  gap: 24px;
  position: relative;

  .summary-item {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;

    .el-icon { font-size: 24px; }

    .summary-content {
      .summary-label {
        font-size: 12px;
        color: #909399;
        margin-bottom: 4px;
      }
      .summary-value {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }
  }

  .info-icon {
    position: absolute;
    top: 12px;
    right: 12px;
    font-size: 18px;
    color: #909399;
  }
}

.ledger-list {
  background: #fff;

  .ledger-item {
    padding: 16px;
    border-bottom: 1px solid #f5f5f5;

    .entry-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;

      .entry-name {
        font-size: 15px;
        font-weight: 600;
        color: #303133;
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding-right: 12px;
      }
      .entry-value {
        font-size: 15px;
        font-weight: 600;
        color: #303133;
      }
    }

    .entry-details {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      font-size: 13px;

      .entry-date { color: #909399; }
      .entry-qty {
        &.positive { color: #67c23a; }
        &.negative { color: #f56c6c; }
      }
    }

    .entry-meta {
      display: flex;
      gap: 12px;
      font-size: 12px;
      color: #909399;
      margin-bottom: 4px;
    }

    .entry-action {
      font-size: 13px;
      color: #606266;
    }
  }
}

.placeholder-content {
  text-align: center;
  padding: 80px 20px;
  color: #c0c4cc;
  
  p { margin-top: 16px; font-size: 14px; }
}

.action-item {
  padding: 16px;
  text-align: center;
  font-size: 16px;
  color: #303133;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;

  &:active { background: #f5f7fa; }
}
</style>
