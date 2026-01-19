<template>
  <div class="mobile-inventory-report">
    <!-- Header -->
    <div class="report-header">
      <el-icon class="back-btn" @click="$router.back()"><ArrowLeft /></el-icon>
      <div class="header-title">{{ pageTitle }}</div>
      <el-icon class="search-btn" @click="showSearch = !showSearch"><Search /></el-icon>
    </div>

    <!-- Filters -->
    <div class="filter-bar">
      <div class="date-filter" @click="showDatePicker = true">
        <el-icon><Calendar /></el-icon>
        {{ formatDateRange() }} <el-icon><ArrowDown /></el-icon>
      </div>
      <div class="actions">
        <el-icon @click="loadData"><Filter /></el-icon>
        <el-icon @click="loadData"><Refresh /></el-icon>
      </div>
    </div>

    <!-- Search -->
    <div class="search-bar" v-if="showSearch">
      <el-input v-model="searchQuery" placeholder="Tìm kiếm sản phẩm..." clearable @input="handleSearch">
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
    </div>

    <!-- Summary Card (for inventory report) -->
    <div class="summary-card" v-if="reportType === 'inventory-report'">
      <div class="info-icon">
        <el-icon><InfoFilled /></el-icon>
      </div>
      <div class="summary-icon">
        <el-icon><Box /></el-icon>
      </div>
      <div class="summary-label">GIÁ TRỊ TỒN KHO</div>
      <div class="summary-value">{{ formatCurrency(summaryData.totalValue) }}</div>
      <div class="summary-sub">SL: {{ formatNumber(summaryData.totalQuantity) }}</div>
    </div>

    <!-- Summary Card (for stock book) -->
    <div class="summary-card double" v-if="reportType === 'stock-book'">
      <div class="info-icon">
        <el-icon><InfoFilled /></el-icon>
      </div>
      <div class="summary-row">
        <div class="summary-col">
          <div class="col-icon blue">
            <el-icon><Download /></el-icon>
          </div>
          <div class="col-label">Giá trị nhập kho</div>
          <div class="col-value">{{ formatCurrency(summaryData.importValue) }}</div>
        </div>
        <div class="summary-col">
          <div class="col-icon green">
            <el-icon><Upload /></el-icon>
          </div>
          <div class="col-label">Giá trị xuất kho</div>
          <div class="col-value">{{ formatCurrency(summaryData.exportValue) }}</div>
        </div>
      </div>
    </div>

    <!-- Items List -->
    <div class="items-list" v-loading="loading">
      <!-- Inventory Report Items -->
      <template v-if="reportType === 'inventory-report'">
        <div class="item-row" v-for="item in filteredItems" :key="item.id" @click="viewProduct(item.productId)">
          <div class="item-name">{{ item.name }}</div>
          <div class="item-right">
            <div class="item-value">{{ formatCurrency(item.value) }}</div>
            <div class="item-meta">SL: {{ item.quantity }}</div>
          </div>
          <div class="item-details">
            <div class="detail-row">
              <span class="label">SKU:</span>
              <span class="value">{{ item.sku }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Giá vốn:</span>
              <span class="value">{{ formatCurrency(item.costPrice) }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- Stock Book Items -->
      <template v-else-if="reportType === 'stock-book'">
        <div class="transaction-row" v-for="item in filteredItems" :key="item.id">
          <div class="transaction-main">
            <div class="product-name">{{ item.productName }}</div>
            <div class="transaction-value">{{ formatCurrency(item.value) }}</div>
          </div>
          <div class="transaction-meta">
            <div>{{ formatDate(item.date) }}</div>
            <div class="quantity" :class="item.type">SL: {{ item.type === 'in' ? '+' : '-' }}{{ item.quantity }}</div>
          </div>
          <div class="transaction-info">
            <div>{{ item.documentCode }}</div>
            <div>{{ item.branch }}</div>
          </div>
          <div class="transaction-action">{{ item.action }}</div>
        </div>
      </template>

      <!-- Empty state -->
      <div v-if="!loading && filteredItems.length === 0" class="empty-state">
        <el-icon :size="48"><Box /></el-icon>
        <p>Không có dữ liệu</p>
      </div>
    </div>

    <!-- Date Picker Dialog -->
    <el-dialog v-model="showDatePicker" title="Chọn khoảng thời gian" width="90%">
      <div class="date-presets">
        <div class="preset-item" @click="setDatePreset('today')">Hôm nay</div>
        <div class="preset-item" @click="setDatePreset('week')">7 ngày qua</div>
        <div class="preset-item" @click="setDatePreset('month')">30 ngày qua</div>
        <div class="preset-item" @click="setDatePreset('thisMonth')">Tháng này</div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  ArrowLeft, Search, Calendar, ArrowDown, Filter, Refresh, 
  InfoFilled, Box, Download, Upload 
} from '@element-plus/icons-vue'
import { productService } from '@/services/product.service'
import { inventoryService } from '@/services/inventory.service'

const router = useRouter()
const route = useRoute()

const reportType = computed(() => route.params.type as string || 'inventory-report')
const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    'inventory-report': 'Báo cáo tồn kho',
    'stock-book': 'Sổ kho',
    'stock-io': 'Xuất nhập tồn',
    'low-stock': 'Dưới định mức',
    'over-stock': 'Vượt định mức',
  }
  return titles[reportType.value] || 'Báo cáo'
})

const loading = ref(false)
const showSearch = ref(false)
const showDatePicker = ref(false)
const searchQuery = ref('')
const items = ref<any[]>([])

const dateRange = reactive({
  start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  end: new Date()
})

const summaryData = reactive({
  totalValue: 0,
  totalQuantity: 0,
  importValue: 0,
  exportValue: 0
})

const filteredItems = computed(() => {
  if (!searchQuery.value) return items.value
  const search = searchQuery.value.toLowerCase()
  return items.value.filter((item: any) => 
    item.name?.toLowerCase().includes(search) ||
    item.productName?.toLowerCase().includes(search) ||
    item.sku?.toLowerCase().includes(search)
  )
})

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value || 0)
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value || 0)
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`
}

function formatDateRange() {
  const formatDate = (d: Date) => {
    const day = d.getDate().toString().padStart(2, '0')
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  }
  return `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`
}

function setDatePreset(preset: string) {
  const now = new Date()
  switch (preset) {
    case 'today':
      dateRange.start = new Date(now.setHours(0, 0, 0, 0))
      dateRange.end = new Date()
      break
    case 'week':
      dateRange.start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      dateRange.end = new Date()
      break
    case 'month':
      dateRange.start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      dateRange.end = new Date()
      break
    case 'thisMonth':
      dateRange.start = new Date(now.getFullYear(), now.getMonth(), 1)
      dateRange.end = new Date()
      break
  }
  showDatePicker.value = false
  loadData()
}

function handleSearch() {
  // Filtering is done in computed property
}

function viewProduct(productId: number) {
  router.push(`/products/${productId}`)
}

async function loadData() {
  loading.value = true
  try {
    if (reportType.value === 'inventory-report') {
      await loadInventoryReport()
    } else if (reportType.value === 'stock-book') {
      await loadStockBook()
    } else {
      await loadInventoryReport()
    }
  } catch (e) {
    console.error('Load report error:', e)
  } finally {
    loading.value = false
  }
}

async function loadInventoryReport() {
  const productsRes = await productService.getProducts({ page: 1, pageSize: 1000 })
  const products = productsRes?.data || productsRes?.items || productsRes || []
  
  let totalValue = 0
  let totalQuantity = 0
  
  const inventoryItems = products.map((product: any) => {
    const qty = product.stockQuantity || product.availableQuantity || 0
    const costPrice = product.importPrice || 0
    const value = qty * costPrice
    
    totalQuantity += qty
    totalValue += value
    
    return {
      id: product.id,
      productId: product.id,
      name: product.name,
      sku: product.sku,
      quantity: qty,
      costPrice,
      value
    }
  })
  
  items.value = inventoryItems.sort((a: any, b: any) => b.value - a.value)
  summaryData.totalValue = totalValue
  summaryData.totalQuantity = totalQuantity
}

async function loadStockBook() {
  // Load from inventory history or orders
  const productsRes = await productService.getProducts({ page: 1, pageSize: 100 })
  const products = productsRes?.data || productsRes?.items || productsRes || []
  
  // Generate mock stock book entries from products
  const entries: any[] = []
  let importTotal = 0
  let exportTotal = 0
  
  products.forEach((product: any, index: number) => {
    const qty = product.stockQuantity || 1
    const price = product.importPrice || product.retailPrice || 0
    
    // Mock import entry
    entries.push({
      id: `in-${product.id}`,
      productId: product.id,
      productName: product.name,
      date: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
      documentCode: `PON00${400 + index}`,
      action: 'Nhập hàng vào kho',
      type: 'in',
      quantity: qty,
      value: qty * price,
      branch: 'Chi nhánh mặc định'
    })
    importTotal += qty * price
    
    // Mock export entry for some products
    if (index % 3 === 0 && qty > 0) {
      entries.push({
        id: `out-${product.id}`,
        productId: product.id,
        productName: product.name,
        date: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
        documentCode: `SON02${200 + index}`,
        action: 'Giao hàng cho khách',
        type: 'out',
        quantity: 1,
        value: product.retailPrice || price,
        branch: 'Chi nhánh mặc định'
      })
      exportTotal += product.retailPrice || price
    }
  })
  
  items.value = entries.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
  summaryData.importValue = importTotal
  summaryData.exportValue = exportTotal
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.mobile-inventory-report {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.report-header {
  background: #fff;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e4e7ed;

  .back-btn, .search-btn {
    font-size: 22px;
    color: #606266;
    cursor: pointer;
    padding: 4px;
  }

  .header-title {
    flex: 1;
    text-align: center;
    font-size: 17px;
    font-weight: 600;
  }
}

.filter-bar {
  background: #fff;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e4e7ed;

  .date-filter {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #303133;
    cursor: pointer;

    .el-icon:first-child { color: #409eff; }
  }

  .actions {
    display: flex;
    gap: 16px;
    .el-icon {
      font-size: 20px;
      color: #409eff;
      cursor: pointer;
    }
  }
}

.search-bar {
  background: #fff;
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
}

.summary-card {
  background: #fff;
  margin: 16px;
  border-radius: 12px;
  padding: 24px;
  position: relative;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);

  .info-icon {
    position: absolute;
    top: 12px;
    right: 12px;
    color: #909399;
    .el-icon { font-size: 18px; }
  }

  .summary-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #e8f5e9;
    color: #4caf50;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    .el-icon { font-size: 24px; }
  }

  .summary-label {
    text-align: center;
    font-size: 13px;
    color: #909399;
    margin-bottom: 8px;
  }

  .summary-value {
    text-align: center;
    font-size: 28px;
    font-weight: 700;
    color: #2196F3;
    margin-bottom: 4px;
  }

  .summary-sub {
    text-align: center;
    font-size: 14px;
    color: #606266;
  }

  &.double {
    .summary-row {
      display: flex;
      gap: 24px;

      .summary-col {
        flex: 1;
        text-align: center;

        .col-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;

          &.blue { background: #e3f2fd; color: #2196F3; }
          &.green { background: #e8f5e9; color: #4caf50; }
          .el-icon { font-size: 20px; }
        }

        .col-label {
          font-size: 13px;
          color: #909399;
          margin-bottom: 8px;
        }
        .col-value {
          font-size: 18px;
          font-weight: 600;
          color: #303133;
        }
      }
    }
  }
}

.items-list {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: #fff;
}

.item-row {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;

  &:active { background: #f9f9f9; }

  .item-name {
    font-size: 15px;
    font-weight: 500;
    color: #303133;
    margin-bottom: 8px;
  }

  .item-right {
    position: absolute;
    right: 16px;
    top: 16px;
    text-align: right;

    .item-value {
      font-size: 15px;
      font-weight: 600;
      color: #303133;
    }
    .item-meta {
      font-size: 13px;
      color: #909399;
    }
  }

  .item-details {
    .detail-row {
      display: flex;
      gap: 8px;
      font-size: 13px;
      color: #909399;
      margin-top: 4px;
      
      .label { color: #909399; }
      .value { color: #606266; }
    }
  }
}

.transaction-row {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;

  .transaction-main {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;

    .product-name {
      font-size: 15px;
      font-weight: 500;
      color: #303133;
      flex: 1;
      margin-right: 12px;
    }
    .transaction-value {
      font-size: 15px;
      font-weight: 600;
      color: #303133;
    }
  }

  .transaction-meta {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: #909399;
    margin-bottom: 4px;

    .quantity {
      font-weight: 500;
      &.in { color: #4caf50; }
      &.out { color: #f56c6c; }
    }
  }

  .transaction-info {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: #909399;
    margin-bottom: 4px;
  }

  .transaction-action {
    font-size: 13px;
    color: #606266;
  }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #c0c4cc;
  
  p { margin-top: 16px; font-size: 14px; }
}

.date-presets {
  .preset-item {
    padding: 16px;
    text-align: center;
    border-bottom: 1px solid #f0f0f0;
    font-size: 15px;
    cursor: pointer;

    &:last-child { border-bottom: none; }
    &:active { background: #f5f7fa; }
  }
}

:deep(.el-dialog) {
  border-radius: 12px;
  .el-dialog__header { padding: 16px 20px; }
  .el-dialog__body { padding: 0; }
}
</style>
