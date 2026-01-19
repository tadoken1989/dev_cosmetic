<template>
  <div class="mobile-inventory">
    <!-- Header -->
    <div class="mobile-header">
      <div class="header-left" @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="page-title">Quản lý kho</div>
      <div class="header-right">
        <el-icon @click="showFilter = true"><Filter /></el-icon>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="summary-section">
      <div class="summary-card">
        <div class="card-icon green">
          <el-icon><Box /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-label">Tổng tồn kho</div>
          <div class="card-value">{{ formatNumber(summaryData.totalStock) }}</div>
        </div>
      </div>
      <div class="summary-card">
        <div class="card-icon blue">
          <el-icon><Sell /></el-icon>
        </div>
        <div class="card-content">
          <div class="card-label">Có thể bán</div>
          <div class="card-value">{{ formatNumber(summaryData.totalAvailable) }}</div>
        </div>
      </div>
    </div>

    <div class="value-card">
      <div class="value-label">Giá trị tồn kho</div>
      <div class="value-amount">{{ formatCurrency(summaryData.totalValue) }}</div>
    </div>

    <!-- Search -->
    <div class="search-section">
      <el-input
        v-model="searchQuery"
        placeholder="Tìm theo tên, SKU, barcode"
        clearable
        @input="handleSearch"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
    </div>

    <!-- Tabs -->
    <div class="tabs-section">
      <div class="tab" :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">
        Tất cả
      </div>
      <div class="tab" :class="{ active: activeTab === 'low' }" @click="activeTab = 'low'">
        Sắp hết
      </div>
      <div class="tab" :class="{ active: activeTab === 'out' }" @click="activeTab = 'out'">
        Hết hàng
      </div>
    </div>

    <!-- Inventory List -->
    <div class="inventory-list" v-loading="loading">
      <div 
        class="inventory-item"
        v-for="item in filteredItems"
        :key="item.id"
        @click="viewProduct(item.productId)"
      >
        <div class="item-image">
          <img v-if="item.imageUrl" :src="item.imageUrl" />
          <div v-else class="image-placeholder">
            <el-icon><Picture /></el-icon>
          </div>
        </div>
        <div class="item-info">
          <div class="item-name">{{ item.productName }}</div>
          <div class="item-sku">{{ item.sku }}</div>
        </div>
        <div class="item-stock">
          <div class="stock-row">
            <span class="label">Có thể bán:</span>
            <span class="value" :class="{ warning: item.availableQuantity <= 0 }">
              {{ item.availableQuantity }}
            </span>
          </div>
          <div class="stock-row">
            <span class="label">Tồn kho:</span>
            <span class="value">{{ item.stockQuantity }}</span>
          </div>
        </div>
      </div>

      <div v-if="!loading && filteredItems.length === 0" class="empty-state">
        <el-icon :size="48"><Box /></el-icon>
        <p>Không có dữ liệu</p>
      </div>
    </div>

    <BottomNav />

    <!-- Filter Drawer -->
    <el-drawer v-model="showFilter" direction="rtl" size="85%" title="Bộ lọc">
      <div class="filter-content">
        <div class="filter-group">
          <div class="filter-label">Loại sản phẩm</div>
          <el-select v-model="filters.productType" placeholder="Tất cả" style="width: 100%">
            <el-option label="Tất cả" value="" />
            <el-option v-for="type in productTypes" :key="type.id" :label="type.name" :value="type.id" />
          </el-select>
        </div>
        <div class="filter-group">
          <div class="filter-label">Trạng thái tồn kho</div>
          <el-checkbox-group v-model="filters.stockStatus">
            <el-checkbox label="instock">Còn hàng</el-checkbox>
            <el-checkbox label="low">Sắp hết</el-checkbox>
            <el-checkbox label="out">Hết hàng</el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
      <template #footer>
        <el-button @click="resetFilters">Đặt lại</el-button>
        <el-button type="primary" @click="applyFilters">Áp dụng</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Filter, Box, Search, Picture, Sell } from '@element-plus/icons-vue'
import { productService } from '@/services/product.service'
import BottomNav from './BottomNav.vue'

const router = useRouter()

const loading = ref(false)
const searchQuery = ref('')
const activeTab = ref('all')
const showFilter = ref(false)
const inventoryItems = ref<any[]>([])
const productTypes = ref<any[]>([])

const filters = reactive({
  productType: '',
  stockStatus: [] as string[]
})

const summaryData = reactive({
  totalStock: 0,
  totalAvailable: 0,
  totalValue: 0
})

const filteredItems = computed(() => {
  let items = inventoryItems.value

  // Filter by search
  if (searchQuery.value) {
    const search = searchQuery.value.toLowerCase()
    items = items.filter(item => 
      item.productName?.toLowerCase().includes(search) ||
      item.sku?.toLowerCase().includes(search)
    )
  }

  // Filter by tab
  if (activeTab.value === 'low') {
    items = items.filter(item => item.availableQuantity > 0 && item.availableQuantity <= 5)
  } else if (activeTab.value === 'out') {
    items = items.filter(item => item.availableQuantity <= 0)
  }

  return items
})

function formatNumber(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value || 0)
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value || 0) + ' ₫'
}

function handleSearch() {
  // Filtering is done in computed
}

function viewProduct(productId: number) {
  router.push(`/products/${productId}`)
}

function resetFilters() {
  filters.productType = ''
  filters.stockStatus = []
  showFilter.value = false
}

function applyFilters() {
  showFilter.value = false
  loadInventory()
}

async function loadInventory() {
  loading.value = true
  try {
    const params: any = {
      page: 1,
      pageSize: 100,
      search: searchQuery.value || undefined,
    }

    const res = await productService.getProducts(params)
    const products = res?.data || res?.items || res || []
    
    let totalStock = 0
    let totalAvailable = 0
    let totalValue = 0
    
    // Use inventory data from products API (already included via JOIN)
    inventoryItems.value = products.map((product: any) => {
      const stockQuantity = product.stockQuantity || 0
      const availableQuantity = product.availableQuantity || product.stockQuantity || 0
      const costPrice = product.costPrice || product.importPrice || 0
      
      totalStock += stockQuantity
      totalAvailable += availableQuantity
      totalValue += stockQuantity * costPrice
        
      return {
        id: product.id,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        imageUrl: product.images?.[0]?.url || product.imageUrl,
        availableQuantity,
        stockQuantity,
        retailPrice: product.retailPrice,
        costPrice,
      }
    })
    
    summaryData.totalStock = totalStock
    summaryData.totalAvailable = totalAvailable
    summaryData.totalValue = totalValue
  } catch (e) {
    console.error('Load inventory error:', e)
  } finally {
    loading.value = false
  }
}

async function loadProductTypes() {
  try {
    const res = await productService.getProductTypes()
    productTypes.value = res?.data || res || []
  } catch (e) {
    console.error('Load types error:', e)
  }
}

onMounted(() => {
  loadInventory()
  loadProductTypes()
})
</script>

<style scoped lang="scss">
.mobile-inventory {
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
  .header-right .el-icon { font-size: 20px; cursor: pointer; color: #606266; }
}

.summary-section {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #fff;

  .summary-card {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 12px;

    .card-icon {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &.green { background: #e8f5e9; color: #4caf50; }
      &.blue { background: #e3f2fd; color: #2196f3; }
      .el-icon { font-size: 20px; }
    }

    .card-content {
      .card-label { font-size: 12px; color: #909399; margin-bottom: 4px; }
      .card-value { font-size: 20px; font-weight: 700; color: #303133; }
    }
  }
}

.value-card {
  background: #fff;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e4e7ed;

  .value-label { font-size: 14px; color: #606266; }
  .value-amount { font-size: 18px; font-weight: 600; color: #2196f3; }
}

.search-section {
  background: #fff;
  padding: 12px 16px;

  :deep(.el-input__wrapper) {
    background: #f5f7fa;
    border-radius: 8px;
    box-shadow: none;
  }
}

.tabs-section {
  display: flex;
  background: #fff;
  padding: 0 16px;
  border-bottom: 1px solid #e4e7ed;

  .tab {
    padding: 12px 16px;
    font-size: 14px;
    color: #909399;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    
    &.active {
      color: #2196f3;
      border-bottom-color: #2196f3;
      font-weight: 500;
    }
  }
}

.inventory-list {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: #fff;
  padding-bottom: 100px;

  .inventory-item {
    display: flex;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
    gap: 12px;
    cursor: pointer;

    &:active { background: #f9f9f9; }

    .item-image {
      width: 56px;
      height: 56px;
      border-radius: 8px;
      overflow: hidden;
      background: #f5f7fa;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;

      img { width: 100%; height: 100%; object-fit: cover; }
      .image-placeholder { color: #c0c4cc; }
    }

    .item-info {
      flex: 1;
      min-width: 0;
      
      .item-name {
        font-size: 14px;
        font-weight: 500;
        color: #303133;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .item-sku {
        font-size: 12px;
        color: #909399;
      }
    }

    .item-stock {
      text-align: right;
      
      .stock-row {
        font-size: 13px;
        margin-bottom: 4px;
        
        &:last-child { margin-bottom: 0; }
        
        .label { color: #909399; margin-right: 4px; }
        .value { 
          font-weight: 500; 
          color: #303133;
          
          &.warning { color: #f56c6c; }
        }
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #c0c4cc;
    p { margin-top: 16px; font-size: 14px; }
  }
}

.filter-content {
  .filter-group {
    margin-bottom: 24px;
    .filter-label { font-weight: 500; margin-bottom: 12px; color: #303133; }
    
    :deep(.el-checkbox-group) {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  }
}
</style>
