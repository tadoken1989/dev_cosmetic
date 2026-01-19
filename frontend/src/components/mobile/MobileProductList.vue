<template>
  <div class="mobile-product-list">
    <!-- Header -->
    <div class="mobile-header">
      <div class="header-left" @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="page-title">Sản phẩm</div>
      <div class="header-right">
        <div class="icon-btn" @click="$router.push('/products/inventory')">
          <el-icon><HomeFilled /></el-icon>
        </div>
        <div class="icon-btn" @click="showConfig = true">
          <el-icon><Setting /></el-icon>
        </div>
      </div>
    </div>

    <!-- Search -->
    <div class="search-section">
      <el-input
        v-model="searchQuery"
        placeholder="Nhập tên, mã SKU, barcode"
        clearable
        @input="handleSearch"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
        <template #suffix>
          <div class="barcode-divider"></div>
          <el-icon class="barcode-icon" @click="scanBarcode"><Scan /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- Filter Row -->
    <div class="filter-row">
      <el-dropdown trigger="click" @command="filterByType">
        <span class="type-dropdown">
          {{ selectedType || 'Tất cả loại sản phẩm' }} <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="">Tất cả loại sản phẩm</el-dropdown-item>
            <el-dropdown-item v-for="type in productTypes" :key="type.id" :command="type.name">
              {{ type.name }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <div class="filter-btn" @click="showFilter = true">
        <el-icon><Filter /></el-icon>
      </div>
    </div>

    <!-- Count -->
    <div class="product-count">{{ formatNumber(total) }} sản phẩm</div>

    <!-- Product List -->
    <div class="products-list" v-loading="loading">
      <div 
        class="product-item"
        v-for="product in products"
        :key="product.id"
        @click="$router.push(`/products/${product.id}`)"
      >
        <div class="product-image">
          <img v-if="product.imageUrl" :src="product.imageUrl" />
          <div v-else class="image-placeholder">
            <el-icon :size="24"><Picture /></el-icon>
          </div>
        </div>
        <div class="product-info">
          <div class="product-name">{{ product.name }}</div>
          <div class="product-meta">
            <span>1 phiên bản</span>
            <span class="separator">|</span>
            <span>Tồn kho <span class="stock-value">{{ getStockQuantity(product) }}</span></span>
          </div>
        </div>
      </div>

      <div v-if="!loading && products.length === 0" class="empty-state">
        <el-icon :size="60"><ShoppingBag /></el-icon>
        <p>Không có sản phẩm nào</p>
      </div>

      <!-- Load more -->
      <div v-if="hasMore && products.length > 0" class="load-more" @click="loadMore">
        <el-button text :loading="loadingMore">Tải thêm...</el-button>
      </div>
    </div>

    <!-- FAB -->
    <div class="fab" @click="$router.push('/products/create')">
      <el-icon><Plus /></el-icon>
    </div>

    <BottomNav />

    <!-- Filter Drawer -->
    <el-drawer v-model="showFilter" direction="rtl" size="85%" title="Lọc sản phẩm">
      <div class="filter-content">
        <div class="filter-group">
          <div class="filter-label">Trạng thái</div>
          <el-checkbox-group v-model="filters.status">
            <el-checkbox label="active">Đang kinh doanh</el-checkbox>
            <el-checkbox label="inactive">Ngừng kinh doanh</el-checkbox>
          </el-checkbox-group>
        </div>
        <div class="filter-group">
          <div class="filter-label">Tồn kho</div>
          <el-checkbox-group v-model="filters.stock">
            <el-checkbox label="instock">Còn hàng</el-checkbox>
            <el-checkbox label="outofstock">Hết hàng</el-checkbox>
            <el-checkbox label="lowstock">Sắp hết</el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
      <template #footer>
        <el-button @click="resetFilters">Đặt lại</el-button>
        <el-button type="primary" @click="applyFilters">Áp dụng</el-button>
      </template>
    </el-drawer>

    <!-- Config Drawer -->
    <el-drawer v-model="showConfig" direction="rtl" size="85%" title="Cấu hình hiển thị">
      <div class="config-content">
        <div class="config-item">
          <span>Hiển thị giá</span>
          <el-switch v-model="displayConfig.showPrice" />
        </div>
        <div class="config-item">
          <span>Hiển thị tồn kho</span>
          <el-switch v-model="displayConfig.showStock" />
        </div>
        <div class="config-item">
          <span>Hiển thị có thể bán</span>
          <el-switch v-model="displayConfig.showAvailable" />
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  ArrowLeft, HomeFilled, Setting, Search, Filter, Plus, 
  ArrowDown, ShoppingBag, Picture
} from '@element-plus/icons-vue'
import { productService } from '@/services/product.service'
import BottomNav from './BottomNav.vue'

const Scan = { template: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h2v12H4zm3 0h1v12H7zm2 0h3v12H9zm4 0h1v12h-1zm3 0h2v12h-2zm3 0h1v12h-1z"/></svg>` }

const searchQuery = ref('')
const products = ref<any[]>([])
const productTypes = ref<any[]>([])
const selectedType = ref('')
const showFilter = ref(false)
const showConfig = ref(false)
const loading = ref(false)
const loadingMore = ref(false)
const currentPage = ref(1)
const pageSize = ref(100)
const total = ref(0)

const filters = reactive({
  status: [] as string[],
  stock: [] as string[]
})

const displayConfig = reactive({
  showPrice: true,
  showStock: true,
  showAvailable: true
})

const hasMore = computed(() => products.value.length < total.value)

function formatNumber(num: number) {
  return num?.toLocaleString('vi-VN') || '0'
}

function handleSearch() {
  currentPage.value = 1
  loadProducts()
}

function filterByType(type: string) {
  selectedType.value = type
  currentPage.value = 1
  loadProducts()
}

function scanBarcode() {
  ElMessage.info('Quét mã vạch...')
}

function getStockQuantity(product: any) {
  return product?.stockQuantity || product?.availableQuantity || 0
}

function getAvailableQuantity(product: any) {
  return product?.availableQuantity || product?.stockQuantity || 0
}

function resetFilters() {
  filters.status = []
  filters.stock = []
  showFilter.value = false
  currentPage.value = 1
  loadProducts()
}

function applyFilters() {
  showFilter.value = false
  currentPage.value = 1
  loadProducts()
}

async function loadProducts() {
  loading.value = true
  try {
    const params: any = { 
      page: currentPage.value, 
      pageSize: pageSize.value,
      search: searchQuery.value || undefined,
      productType: selectedType.value || undefined
    }

    const result = await productService.getProducts(params)
    const rawProducts = result?.data || result?.items || result || []
    
    // Map products with imageUrl only, no individual API calls
    const productsWithImageUrl = rawProducts.map((product: any) => ({
      ...product,
      imageUrl: product.images?.[0]?.url || null,
      stockQuantity: product.stockQuantity || 0,
      availableQuantity: product.availableQuantity || product.stockQuantity || 0
    }))
    
    products.value = currentPage.value === 1 ? productsWithImageUrl : [...products.value, ...productsWithImageUrl]
    total.value = result?.total || result?.meta?.total || products.value.length
  } catch (e) {
    console.error('Load products error:', e)
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  if (loadingMore.value) return
  loadingMore.value = true
  
  try {
    currentPage.value++
    const params: any = { 
      page: currentPage.value, 
      pageSize: pageSize.value,
      search: searchQuery.value || undefined,
      productType: selectedType.value || undefined
    }

    const result = await productService.getProducts(params)
    const newProducts = result?.data || result?.items || result || []
    products.value = [...products.value, ...newProducts]
  } catch (e) {
    console.error('Load more error:', e)
    currentPage.value--
  } finally {
    loadingMore.value = false
  }
}

async function loadProductTypes() {
  try {
    const result = await productService.getProductTypes()
    productTypes.value = result?.data || result || []
  } catch (e) {
    console.error('Load types error:', e)
  }
}

onMounted(() => {
  loadProducts()
  loadProductTypes()
})
</script>

<style scoped lang="scss">
.mobile-product-list {
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

  .header-left .el-icon { font-size: 24px; cursor: pointer; color: #303133; }
  .page-title { flex: 1; text-align: center; font-size: 17px; font-weight: 600; }
  .header-right { 
    display: flex; 
    gap: 8px;
    .icon-btn { 
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f7fa;
      border-radius: 50%;
      cursor: pointer;
      .el-icon { font-size: 18px; color: #606266; }
      &:active { background: #e4e7ed; }
    }
  }
}

.search-section {
  background: #fff;
  padding: 12px 16px;

  :deep(.el-input__wrapper) {
    background: #f5f7fa;
    border-radius: 20px;
    box-shadow: none;
    padding: 8px 16px;
  }

  :deep(.el-input__suffix) {
    display: flex;
    align-items: center;
  }

  .barcode-divider {
    width: 1px;
    height: 20px;
    background: #dcdfe6;
    margin-right: 10px;
  }

  .barcode-icon {
    font-size: 20px;
    color: #409eff;
    cursor: pointer;
  }
}

.filter-row {
  background: #fff;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e4e7ed;

  .type-dropdown {
    font-size: 14px;
    color: #303133;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;

    .el-icon { font-size: 12px; color: #909399; }
  }

  .filter-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f7fa;
    border-radius: 8px;
    cursor: pointer;
    .el-icon { font-size: 18px; color: #606266; }
    &:active { background: #e4e7ed; }
  }
}

.product-count {
  background: #e3f2fd;
  padding: 10px 16px;
  font-size: 13px;
  color: #1976D2;
}

.products-list {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: #fff;
  padding-bottom: 140px;

  .product-item {
    display: flex;
    align-items: flex-start;
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
    gap: 14px;
    cursor: pointer;

    &:active { background: #f9f9f9; }

    .product-image {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      overflow: hidden;
      background: #f5f7fa;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .image-placeholder {
        color: #c0c4cc;
      }
    }

    .product-info { flex: 1; min-width: 0; }
    .product-name { 
      font-size: 15px; 
      font-weight: 500; 
      margin-bottom: 8px; 
      color: #303133;
      line-height: 1.3;
    }
    .product-meta { 
      font-size: 13px; 
      color: #909399;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 4px;
      
      .separator { margin: 0 4px; color: #dcdfe6; }
      .stock-value { color: #2196F3; font-weight: 500; }
    }
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #c0c4cc;
    
    p { margin-top: 16px; font-size: 14px; }
  }

  .load-more {
    text-align: center;
    padding: 20px;
  }
}

.fab {
  position: fixed;
  bottom: calc(80px + env(safe-area-inset-bottom, 0));
  right: 16px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #2196F3;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
  z-index: 999;
  cursor: pointer;

  .el-icon { font-size: 28px; }
  &:active { transform: scale(0.95); }
}

.filter-content, .config-content {
  .filter-group {
    margin-bottom: 24px;
    .filter-label { font-weight: 500; margin-bottom: 12px; color: #303133; }
    
    :deep(.el-checkbox-group) {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  }

  .config-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    font-size: 15px;
    color: #303133;
  }
}
</style>
