<template>
  <!-- Mobile View -->
  <template v-if="isMobile">
    <MobileProductMenu v-if="$route.path === '/products'" />
    <MobileProductList v-else />
  </template>
  
  <!-- Desktop View -->
  <div v-else class="product-list-page">
    <div class="page-header">
      <h1 class="page-title">Danh sách sản phẩm</h1>
    </div>

    <!-- Tab Navigation -->
    <div class="tab-navigation">
      <div class="tab-buttons">
        <el-button class="tab-btn">
          <el-icon><Download /></el-icon> Xuất file
        </el-button>
        <el-button class="tab-btn">
          <el-icon><Upload /></el-icon> Nhập file
        </el-button>
        <el-button class="tab-btn">Loại sản phẩm</el-button>
        <el-button class="tab-btn">Lô - HSD</el-button>
        <el-button class="tab-btn">Combo</el-button>
        <el-button class="tab-btn">Sản phẩm quy đổi</el-button>
      </div>
      <el-dropdown split-button type="primary" @click="$router.push('/products/create')">
        + Thêm sản phẩm
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="$router.push('/products/create')">Thêm sản phẩm thường</el-dropdown-item>
            <el-dropdown-item>Thêm sản phẩm lô - HSD</el-dropdown-item>
            <el-dropdown-item>Thêm combo</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- Active Tab Indicator -->
    <div class="active-tab-section">
      <span class="active-tab">Tất cả sản phẩm</span>
    </div>

    <!-- Filters Section -->
    <div class="filters-section">
      <div class="search-box">
        <el-input
          v-model="searchQuery"
          placeholder="Tìm kiếm theo mã sản phẩm, tên sản phẩm, barcode"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <div class="filter-dropdowns">
        <el-select v-model="filters.productTypeId" placeholder="Loại sản phẩm" clearable @change="handleFilterChange">
          <el-option
            v-for="type in productTypes"
            :key="type.id"
            :label="type.name"
            :value="type.id"
          />
        </el-select>
        <el-select v-model="filters.dateFilter" placeholder="Ngày tạo" clearable @change="handleFilterChange">
          <el-option label="Hôm nay" value="today" />
          <el-option label="7 ngày qua" value="week" />
          <el-option label="30 ngày qua" value="month" />
        </el-select>
        <el-select v-model="filters.brandId" placeholder="Nhãn hiệu" clearable @change="handleFilterChange">
          <el-option
            v-for="brand in brands"
            :key="brand.id"
            :label="brand.name"
            :value="brand.id"
          />
        </el-select>
        <el-button class="filter-btn" @click="showFilterDrawer = true">
          <el-icon><Filter /></el-icon> Bộ lọc khác
        </el-button>
        <el-button type="primary" link class="save-filter-btn">Lưu bộ lọc</el-button>
      </div>
    </div>

    <!-- Data Table -->
    <div class="data-table-wrapper">
      <el-table
        :data="productStore.products"
        v-loading="productStore.loading"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
        row-class-name="clickable-row"
        empty-text="Không có dữ liệu"
        style="width: 100%"
      >
        <el-table-column type="selection" width="40" />
        <el-table-column width="40">
          <template #header>
            <el-button text size="small" @click="showColumnConfig = true" style="padding: 0">
              <el-icon><Setting /></el-icon>
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="Ảnh" width="80">
          <template #default="{ row }">
            <el-image
              v-if="row.images?.[0]"
              :src="getImageUrl(row.images[0].url)"
              :alt="row.name"
              fit="cover"
              class="product-image"
            >
              <template #error>
                <div class="image-placeholder">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <div v-else class="image-placeholder">
              <el-icon><Picture /></el-icon>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Sản phẩm" min-width="250">
          <template #default="{ row }">
            <router-link :to="`/products/${row.id}`" class="product-link" @click.stop>
              {{ row.name }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="Loại" width="120">
          <template #default="{ row }">
            {{ row.productType?.name || '' }}
          </template>
        </el-table-column>
        <el-table-column label="Nhãn hiệu" width="120">
          <template #default="{ row }">
            {{ row.brand?.name || '' }}
          </template>
        </el-table-column>
        <el-table-column label="Có thể bán" width="110" align="center">
          <template #default="{ row }">
            <el-popover
              placement="bottom"
              :width="380"
              trigger="hover"
            >
              <template #reference>
                <div style="cursor: pointer">
                  <span>{{ productInventories[row.id]?.available || 0 }}</span>
                  <div class="sub-text">(1 phiên bản)</div>
                </div>
              </template>
              <div class="inventory-popup">
                <div class="popup-header">
                  <strong>{{ row.name }}</strong>
                  <div class="sub-text">1 phiên bản</div>
                </div>
                <div class="inventory-table">
                  <div class="table-header">
                    <div class="col"></div>
                    <div class="col">TỔNG HỆ THỐNG</div>
                    <div class="col">CHI NHÁNH MẶC ĐỊNH</div>
                  </div>
                  <div class="table-row">
                    <div class="col label">Có thể bán</div>
                    <div class="col">{{ productInventories[row.id]?.available || 0 }}</div>
                    <div class="col">{{ productInventories[row.id]?.available || 0 }}</div>
                  </div>
                  <div class="table-row">
                    <div class="col label">Tồn kho</div>
                    <div class="col">{{ productInventories[row.id]?.quantity || 0 }}</div>
                    <div class="col">{{ productInventories[row.id]?.quantity || 0 }}</div>
                  </div>
                  <div class="table-row">
                    <div class="col label">Đang giao dịch</div>
                    <div class="col">{{ productInventories[row.id]?.inTransaction || 0 }}</div>
                    <div class="col">{{ productInventories[row.id]?.inTransaction || 0 }}</div>
                  </div>
                  <div class="table-row">
                    <div class="col label">Hàng đang giao</div>
                    <div class="col">{{ productInventories[row.id]?.incoming || 0 }}</div>
                    <div class="col">{{ productInventories[row.id]?.incoming || 0 }}</div>
                  </div>
                  <div class="table-row">
                    <div class="col label">Hàng đang về</div>
                    <div class="col">{{ productInventories[row.id]?.outgoing || 0 }}</div>
                    <div class="col">{{ productInventories[row.id]?.outgoing || 0 }}</div>
                  </div>
                </div>
              </div>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column label="Tồn kho" width="100" align="center">
          <template #default="{ row }">
            <span>{{ productInventories[row.id]?.quantity || 0 }}</span>
            <div class="sub-text">(1 phiên bản)</div>
          </template>
        </el-table-column>
        <el-table-column label="Ngày khởi tạo" width="130" sortable prop="createdAt">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="Cập nhật cuối" width="130">
          <template #default="{ row }">
            {{ formatDate(row.updatedAt) }}
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="productStore.pagination.page"
          v-model:page-size="productStore.pagination.pageSize"
          :total="productStore.pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <!-- Batch Actions Bar -->
    <transition name="slide-up">
      <div v-if="selectedProducts.length > 0" class="batch-actions">
        <span>Đã chọn {{ selectedProducts.length }} sản phẩm</span>
        <el-button type="danger" size="small" @click="handleBatchDelete">
          <el-icon><Delete /></el-icon> Xóa
        </el-button>
      </div>
    </transition>

    <!-- Column Config Dialog -->
    <el-dialog v-model="showColumnConfig" title="Điều chỉnh cột hiển thị" width="700px">
      <div class="column-config-content">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="column-section">
              <h4>Thêm cột hiển thị</h4>
              <el-input placeholder="Tìm kiếm cột hiển thị" style="margin-bottom: 12px" />
              
              <div class="column-group">
                <div class="group-title">Thông tin sản phẩm</div>
                <div 
                  v-for="col in availableColumns.filter(c => c.category === 'product')" 
                  :key="col.key"
                  class="column-item"
                  :class="{ checked: visibleColumns.includes(col.key) }"
                >
                  <el-checkbox v-model="col.checked" @change="toggleColumn(col.key)">
                    {{ col.label }}
                  </el-checkbox>
                </div>
              </div>
              
              <div class="column-group">
                <div class="group-title">Thông tin kho</div>
                <div 
                  v-for="col in availableColumns.filter(c => c.category === 'inventory')" 
                  :key="col.key"
                  class="column-item"
                  :class="{ checked: visibleColumns.includes(col.key) }"
                >
                  <el-checkbox v-model="col.checked" @change="toggleColumn(col.key)">
                    {{ col.label }}
                  </el-checkbox>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="column-section">
              <h4>Cột hiển thị</h4>
              <div 
                v-for="col in visibleColumns" 
                :key="col"
                class="visible-column-item"
              >
                <span>{{ getColumnLabel(col) }}</span>
                <el-button text size="small" @click="removeColumn(col)">
                  <el-icon><Close /></el-icon>
                </el-button>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
      <template #footer>
        <el-button @click="resetColumns">Quay về mặc định</el-button>
        <el-button @click="showColumnConfig = false">Thoát</el-button>
        <el-button type="primary" @click="saveColumns">Lưu</el-button>
      </template>
    </el-dialog>

    <!-- Filter Drawer -->
    <el-drawer
      v-model="showFilterDrawer"
      title="Bộ lọc"
      direction="rtl"
      size="350px"
    >
      <div class="filter-drawer-content">
        <div class="filter-group">
          <label>Loại sản phẩm</label>
          <el-select v-model="advancedFilters.productTypeId" placeholder="Chọn loại sản phẩm" clearable style="width: 100%">
            <el-option
              v-for="type in productTypes"
              :key="type.id"
              :label="type.name"
              :value="type.id"
            />
          </el-select>
        </div>
        
        <div class="filter-group">
          <label>Ngày tạo</label>
          <el-select v-model="advancedFilters.dateFilter" placeholder="Chọn ngày tạo sản phẩm" clearable style="width: 100%">
            <el-option label="Hôm nay" value="today" />
            <el-option label="Hôm qua" value="yesterday" />
            <el-option label="7 ngày qua" value="week" />
            <el-option label="30 ngày qua" value="month" />
            <el-option label="Tùy chọn" value="custom" />
          </el-select>
        </div>
        
        <div class="filter-group">
          <label>Nhãn hiệu</label>
          <el-select v-model="advancedFilters.brandId" placeholder="Chọn nhãn hiệu" clearable style="width: 100%">
            <el-option
              v-for="brand in brands"
              :key="brand.id"
              :label="brand.name"
              :value="brand.id"
            />
          </el-select>
        </div>
        
        <div class="filter-group">
          <label>Trạng thái</label>
          <el-select v-model="advancedFilters.status" placeholder="Chọn trạng thái" clearable style="width: 100%">
            <el-option label="Đang bán" value="active" />
            <el-option label="Ngừng bán" value="inactive" />
            <el-option label="Hết hàng" value="outofstock" />
          </el-select>
        </div>
        
        <div class="filter-group">
          <label>Tags</label>
          <el-select v-model="advancedFilters.tags" placeholder="Chọn tag" multiple clearable style="width: 100%">
            <el-option label="Bán chạy" value="bestseller" />
            <el-option label="Mới" value="new" />
            <el-option label="Khuyến mãi" value="sale" />
          </el-select>
        </div>
        
        <div class="filter-group">
          <label>Phân loại</label>
          <el-select v-model="advancedFilters.category" placeholder="Chọn phân loại sản phẩm" clearable style="width: 100%">
            <el-option label="Sản phẩm thường" value="normal" />
            <el-option label="Combo" value="combo" />
            <el-option label="Sản phẩm lô - HSD" value="batch" />
          </el-select>
        </div>
      </div>
      
      <template #footer>
        <div class="drawer-footer">
          <el-button @click="clearAdvancedFilters">Xóa bộ lọc</el-button>
          <el-button type="primary" @click="applyAdvancedFilters">Lọc</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product.store'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Picture, Download, Upload, Filter, Delete, Setting, Close, ArrowLeft, Plus, HomeFilled, ArrowDown } from '@element-plus/icons-vue'

// Scan icon
const Scan = {
  template: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 4h2v16H2V4zm4 0h1v16H6V4zm3 0h2v16H9V4zm4 0h1v16h-1V4zm3 0h2v16h-2V4zm4 0h2v16h-2V4z"/></svg>`
}

function scanBarcode() {
  ElMessage.info('Tính năng scan barcode đang phát triển')
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value || 0)
}
import { inventoryService } from '@/services/inventory.service'
import { useDebounceFn } from '@vueuse/core'
import dayjs from 'dayjs'
import productService from '@/services/product.service'
import { useDevice } from '@/composables/useDevice'
import MobileProductList from '@/components/mobile/MobileProductList.vue'
import MobileProductMenu from '@/components/mobile/MobileProductMenu.vue'

const { isMobile } = useDevice()

// Mobile state
const showMobileSearch = ref(false)
const mobileActiveTab = ref('all')

const router = useRouter()
const productStore = useProductStore()

const searchQuery = ref('')
const selectedProducts = ref<any[]>([])
const productTypes = ref<any[]>([])
const brands = ref<any[]>([])
const showFilterDrawer = ref(false)
const showColumnConfig = ref(false)
const productInventories = ref<Record<number, any>>({})

// Column config
const availableColumns = ref([
  { key: 'image', label: 'Ảnh', category: 'product', checked: true },
  { key: 'name', label: 'Sản phẩm', category: 'product', checked: true },
  { key: 'type', label: 'Loại', category: 'product', checked: true },
  { key: 'brand', label: 'Nhãn hiệu', category: 'product', checked: true },
  { key: 'createdAt', label: 'Ngày khởi tạo', category: 'product', checked: true },
  { key: 'updatedAt', label: 'Cập nhật cuối', category: 'product', checked: true },
  { key: 'status', label: 'Trạng thái', category: 'product', checked: false },
  { key: 'available', label: 'Có thể bán', category: 'inventory', checked: true },
  { key: 'stock', label: 'Tồn kho', category: 'inventory', checked: true },
])

const visibleColumns = ref(['image', 'name', 'type', 'brand', 'available', 'stock', 'createdAt', 'updatedAt'])

const filters = reactive({
  productTypeId: null as number | null,
  brandId: null as number | null,
  dateFilter: null as string | null,
})

const advancedFilters = reactive({
  productTypeId: null as number | null,
  brandId: null as number | null,
  dateFilter: null as string | null,
  status: null as string | null,
  tags: [] as string[],
  category: null as string | null,
})

onMounted(async () => {
  await Promise.all([
    productStore.fetchProducts(true),
    loadProductTypes(),
    loadBrands()
  ])
  // Load inventory data for products
  await loadProductInventories()
})

const handleSearch = useDebounceFn(() => {
  productStore.setFilters({ search: searchQuery.value })
  productStore.fetchProducts(true)
}, 500)

function handleFilterChange() {
  productStore.setFilters({
    productTypeId: filters.productTypeId,
    brandId: filters.brandId,
  })
  productStore.fetchProducts(true)
}

function handlePageChange() {
  productStore.fetchProducts()
}

function handleSizeChange(size: number) {
  productStore.pagination.pageSize = size
  productStore.fetchProducts(true)
}

function handleSelectionChange(selection: any[]) {
  selectedProducts.value = selection
}

// Click row → go to View mode
function handleRowClick(row: any) {
  router.push(`/products/${row.id}`)
}

function formatDate(date: string) {
  if (!date) return ''
  return dayjs(date).format('DD/MM/YYYY')
}

function getImageUrl(url: string) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return url.startsWith('/') ? url : `/${url}`
}

async function loadProductTypes() {
  try {
    const response = await productService.getProductTypes()
    productTypes.value = response.data || []
  } catch (error) {
    console.error('Error loading product types:', error)
    productTypes.value = []
  }
}

async function loadBrands() {
  try {
    const response = await productService.getBrands()
    brands.value = response.data || []
  } catch (error) {
    console.error('Error loading brands:', error)
    brands.value = []
  }
}

// Column config functions
function toggleColumn(key: string) {
  const index = visibleColumns.value.indexOf(key)
  if (index > -1) {
    visibleColumns.value.splice(index, 1)
  } else {
    visibleColumns.value.push(key)
  }
}

function removeColumn(key: string) {
  const index = visibleColumns.value.indexOf(key)
  if (index > -1) {
    visibleColumns.value.splice(index, 1)
    const col = availableColumns.value.find(c => c.key === key)
    if (col) col.checked = false
  }
}

function getColumnLabel(key: string) {
  const col = availableColumns.value.find(c => c.key === key)
  return col?.label || key
}

function resetColumns() {
  visibleColumns.value = ['image', 'name', 'type', 'brand', 'available', 'stock', 'createdAt', 'updatedAt']
  availableColumns.value.forEach(col => {
    col.checked = visibleColumns.value.includes(col.key)
  })
}

function saveColumns() {
  showColumnConfig.value = false
}

// Load inventory for products - now using data from products API
function loadProductInventories() {
  for (const product of productStore.products) {
    if (product.id && !productInventories.value[product.id]) {
      // Use inventory data from products API (already included via JOIN)
      productInventories.value[product.id] = {
        available: product.availableQuantity || product.stockQuantity || 0,
        quantity: product.stockQuantity || 0,
        inTransaction: 0,
        incoming: 0,
        outgoing: 0,
      }
    }
  }
}

function clearAdvancedFilters() {
  advancedFilters.productTypeId = null
  advancedFilters.brandId = null
  advancedFilters.dateFilter = null
  advancedFilters.status = null
  advancedFilters.tags = []
  advancedFilters.category = null
}

function applyAdvancedFilters() {
  productStore.setFilters({
    productTypeId: advancedFilters.productTypeId,
    brandId: advancedFilters.brandId,
  })
  productStore.fetchProducts(true)
  showFilterDrawer.value = false
}

async function handleBatchDelete() {
  if (selectedProducts.value.length === 0) return
  
  try {
    await ElMessageBox.confirm(
      `Bạn có chắc muốn xóa ${selectedProducts.value.length} sản phẩm?`,
      'Xác nhận xóa',
      { confirmButtonText: 'Xóa', cancelButtonText: 'Hủy', type: 'warning' }
    )
    
    for (const product of selectedProducts.value) {
      await productStore.deleteProduct(product.id)
    }
    
    ElMessage.success(`Đã xóa ${selectedProducts.value.length} sản phẩm`)
    selectedProducts.value = []
    await productStore.fetchProducts(true)
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('Xóa sản phẩm thất bại')
    }
  }
}

// Helper functions
function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value || 0)
}

function getProductInventory(productId: number) {
  return productInventories.value[productId] || { available: 0, stock: 0 }
}
</script>

<style scoped lang="scss">
.product-list-page {
  background: #fff;
  min-height: 100%;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  // Page Header
  .page-header {
    padding: 20px 24px 16px;

    .page-title {
      margin: 0;
      font-size: 22px;
      font-weight: 600;
      color: #1a1a1a;
    }
  }

  // Tab Navigation
  .tab-navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    border-bottom: 1px solid #e8e8e8;

    .tab-buttons {
      display: flex;
      gap: 0;

      .tab-btn {
        border: none;
        background: transparent;
        color: #666;
        font-size: 14px;
        padding: 14px 20px;
        border-radius: 0;
        position: relative;

        &:hover {
          color: #409eff;
          background: transparent;
        }

        &:first-child {
          color: #409eff;
        }
      }
    }
  }

  // Active Tab Section
  .active-tab-section {
    padding: 0 24px;
    background: #fff;
    border-bottom: 1px solid #e8e8e8;

    .active-tab {
      display: inline-block;
      padding: 14px 4px;
      font-size: 14px;
      color: #f56c6c;
      border-bottom: 2px solid #f56c6c;
      font-weight: 500;
      margin-bottom: -1px;
    }
  }

  // Filters Section
  .filters-section {
    display: flex;
    gap: 12px;
    padding: 20px 24px;
    background: #fff;
    flex-wrap: wrap;
    align-items: center;
    border-bottom: 1px solid #f0f0f0;

    .search-box {
      flex: 0 0 380px;

      :deep(.el-input__wrapper) {
        border-radius: 4px;
        box-shadow: 0 0 0 1px #dcdfe6 inset;
      }
    }

    .filter-dropdowns {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
      flex: 1;
      justify-content: flex-end;

      .el-select {
        width: 130px;

        :deep(.el-input__wrapper) {
          border-radius: 4px;
        }
      }

      .filter-btn {
        border: 1px solid #dcdfe6;
        background: #fff;
        border-radius: 4px;
        padding: 8px 16px;

        &:hover {
          border-color: #409eff;
          color: #409eff;
        }
      }

      .save-filter-btn {
        color: #409eff;
        font-weight: 500;
      }
    }
  }

  // Data Table
  .data-table-wrapper {
    padding: 0;

    :deep(.el-table) {
      --el-table-border-color: #f0f0f0;
      --el-table-header-bg-color: #fafafa;

      .el-table__header-wrapper {
        th {
          background: #fafafa;
          color: #666;
          font-weight: 500;
          font-size: 13px;
          padding: 14px 0;
          border-bottom: 1px solid #e8e8e8;
        }
      }

      .el-table__body-wrapper {
        td {
          padding: 16px 0;
          border-bottom: 1px solid #f5f5f5;
        }
      }

      .clickable-row {
        cursor: pointer;

        &:hover > td {
          background: #f9fbfd !important;
        }
      }

      .cell {
        padding: 0 16px;
      }
    }

    .product-image {
      width: 56px;
      height: 56px;
      border-radius: 6px;
      object-fit: cover;
      border: 1px solid #f0f0f0;
    }

    .image-placeholder {
      width: 56px;
      height: 56px;
      background: #f5f7fa;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #c0c4cc;
      font-size: 22px;
      border: 1px solid #f0f0f0;
    }

    .product-link {
      color: #409eff;
      text-decoration: none;
      font-weight: 500;
      font-size: 14px;

      &:hover {
        text-decoration: underline;
      }
    }

    .sub-text {
      font-size: 12px;
      color: #999;
      margin-top: 2px;
    }

    .pagination-wrapper {
      display: flex;
      justify-content: flex-end;
      padding: 16px 24px;
      border-top: 1px solid #f0f0f0;
      background: #fff;
    }
  }

  // Batch Actions
  .batch-actions {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: #1f2937;
    color: #fff;
    padding: 14px 28px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 20px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    z-index: 100;

    span {
      font-size: 14px;
    }
  }
}

// Transition
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateX(-50%) translateY(100%);
  opacity: 0;
}

// Filter Drawer
.filter-drawer-content {
  padding: 0 20px;
  
  .filter-group {
    margin-bottom: 20px;
    
    label {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      color: #606266;
      font-weight: 500;
    }
  }
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e4e7ed;
}

// Column Config Dialog
.column-config-content {
  .column-section {
    h4 {
      margin: 0 0 16px;
      font-size: 14px;
      font-weight: 600;
    }
    
    .column-group {
      margin-bottom: 16px;
      
      .group-title {
        font-size: 12px;
        color: #909399;
        margin-bottom: 8px;
      }
      
      .column-item {
        padding: 6px 8px;
        border-radius: 4px;
        
        &.checked {
          background: #ecf5ff;
          
          :deep(.el-checkbox__label) {
            color: #409eff;
          }
        }
      }
    }
    
    .visible-column-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: #f5f7fa;
      border-radius: 4px;
      margin-bottom: 8px;
    }
  }
}

// Inventory Popup
.inventory-popup {
  .popup-header {
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e4e7ed;
    
    strong {
      font-size: 14px;
      color: #303133;
      display: block;
    }
    
    .sub-text {
      font-size: 12px;
      color: #909399;
    }
  }
  
  .inventory-table {
    .table-header, .table-row {
      display: flex;
      
      .col {
        flex: 1;
        padding: 8px 4px;
        text-align: center;
        font-size: 12px;
        
        &:first-child {
          flex: 0 0 100px;
          text-align: left;
        }
        
        &.label {
          color: #606266;
        }
      }
    }
    
    .table-header {
      font-weight: 600;
      font-size: 11px;
      color: #909399;
      border-bottom: 1px solid #e4e7ed;
      
      .col {
        padding: 6px 4px;
      }
    }
    
    .table-row {
      border-bottom: 1px solid #f5f7fa;
      
      &:last-child {
        border-bottom: none;
      }
    }
  }
}
</style>
