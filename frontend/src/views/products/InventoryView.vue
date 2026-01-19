<template>
  <!-- Mobile View -->
  <MobileInventoryView v-if="isMobile" />
  
  <!-- Desktop View -->
  <div v-else class="inventory-view">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">Quản lý kho</h1>
      <div class="header-actions">
        <el-button type="primary" @click="$router.push('/products')">
          Xem danh sách sản phẩm
        </el-button>
      </div>
    </div>

    <!-- Tabs & Filters -->
    <el-card class="filter-card">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="Tất cả phiên bản sản phẩm" name="all" />
        <el-tab-pane label="Lô - HSD" name="batch" />
        <el-tab-pane label="Loại sản phẩm" name="types" />
        <el-tab-pane label="Combo" name="combo" />
        <el-tab-pane label="Sản phẩm quy đổi" name="converted" />
      </el-tabs>

      <div class="filter-row">
        <el-input
          v-model="searchQuery"
          placeholder="Tìm theo mã sản phẩm, tên sản phẩm, barcode"
          clearable
          class="search-input"
          @keyup.enter="loadInventory"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="productTypeFilter" placeholder="Loại sản phẩm" clearable style="width: 150px">
          <el-option label="Tất cả" value="" />
        </el-select>
        <el-select v-model="brandFilter" placeholder="Nhãn hiệu" clearable style="width: 150px">
          <el-option label="Tất cả" value="" />
        </el-select>
        <el-select v-model="statusFilter" placeholder="Trạng thái" clearable style="width: 150px">
          <el-option label="Tất cả" value="" />
          <el-option label="Đang bán" value="active" />
          <el-option label="Ngừng bán" value="inactive" />
        </el-select>
        <el-button>Bộ lọc khác</el-button>
        <el-button>Lưu bộ lọc</el-button>
      </div>
    </el-card>

    <!-- Inventory Table -->
    <el-card class="table-card">
      <el-table
        :data="inventoryItems"
        v-loading="loading"
        style="width: 100%"
        @row-click="handleRowClick"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="40" />
        <el-table-column label="" width="40">
          <template #default>
            <el-icon class="row-icon"><Setting /></el-icon>
          </template>
        </el-table-column>
        <el-table-column label="Ảnh" width="80">
          <template #default="{ row }">
            <el-image
              v-if="row.imageUrl"
              :src="row.imageUrl"
              fit="cover"
              style="width: 50px; height: 50px; border-radius: 4px"
            />
            <div v-else class="no-image">
              <el-icon><Picture /></el-icon>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Tên phiên bản sản phẩm" min-width="250">
          <template #default="{ row }">
            <el-link type="primary" @click.stop="viewProduct(row.productId)">
              {{ row.productName }}
            </el-link>
            <div class="sku">{{ row.sku }}</div>
          </template>
        </el-table-column>
        <el-table-column label="Có thể bán" width="120" align="right">
          <template #default="{ row }">
            <span :class="{ 'text-danger': row.availableQuantity <= 0 }">
              {{ row.availableQuantity || 0 }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="Tồn kho" width="120" align="right">
          <template #default="{ row }">
            {{ row.stockQuantity || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="Ngày khởi tạo" width="150">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="Giá bán lẻ" width="120" align="right">
          <template #default="{ row }">
            {{ formatCurrency(row.retailPrice) }}
          </template>
        </el-table-column>
        <el-table-column label="Giá nhập" width="120" align="right">
          <template #default="{ row }">
            {{ formatCurrency(row.importPrice) }}
          </template>
        </el-table-column>
        <el-table-column label="Giá bán buôn" width="120" align="right">
          <template #default="{ row }">
            {{ formatCurrency(row.wholesalePrice) }}
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="loadInventory"
          @current-change="loadInventory"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Setting, Picture } from '@element-plus/icons-vue'
import { productService } from '@/services/product.service'
import { useDevice } from '@/composables/useDevice'
import MobileInventoryView from '@/components/mobile/MobileInventoryView.vue'

const { isMobile } = useDevice()

const router = useRouter()

// State
const loading = ref(false)
const inventoryItems = ref<any[]>([])
const selectedItems = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

// Filters
const searchQuery = ref('')
const activeTab = ref('all')
const productTypeFilter = ref('')
const brandFilter = ref('')
const statusFilter = ref('')

// Methods
async function loadInventory() {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
      search: searchQuery.value || undefined,
      _t: Date.now(), // Prevent cache
    }

    const res = await productService.getProducts(params)
    if (res.success || res.data) {
      const products = res.data || []
      
      // Use inventory data from products API (already included via JOIN)
      inventoryItems.value = products.map((product: any) => ({
        id: product.id,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        imageUrl: product.images?.[0]?.url || product.imageUrl,
        availableQuantity: product.availableQuantity || product.stockQuantity || 0,
        stockQuantity: product.stockQuantity || 0,
        inTransaction: 0,
        incoming: 0,
        outgoing: 0,
        retailPrice: product.retailPrice,
        importPrice: product.costPrice || product.importPrice || 0,
        wholesalePrice: product.wholesalePrice,
        createdAt: product.createdAt,
      }))
      
      total.value = products.length
    }
  } catch (e: any) {
    console.error('Load inventory error:', e)
    inventoryItems.value = []
  } finally {
    loading.value = false
  }
}

function handleTabChange() {
  loadInventory()
}

function handleRowClick(row: any) {
  router.push(`/products/${row.productId}`)
}

function handleSelectionChange(selection: any[]) {
  selectedItems.value = selection
}

function viewProduct(productId: number) {
  router.push(`/products/${productId}`)
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value || 0)
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

onMounted(() => {
  loadInventory()
})
</script>

<style scoped lang="scss">
.inventory-view {
  padding: 20px;

  .page-header {
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

  .filter-card {
    margin-bottom: 16px;
    border-radius: 8px;

    :deep(.el-tabs__header) {
      margin-bottom: 16px;
    }

    .filter-row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;

      .search-input {
        flex: 1;
        min-width: 300px;
      }
    }
  }

  .table-card {
    border-radius: 8px;

    .row-icon {
      color: #c0c4cc;
      cursor: pointer;

      &:hover {
        color: #409eff;
      }
    }

    .no-image {
      width: 50px;
      height: 50px;
      background: #f5f7fa;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #c0c4cc;
    }

    .sku {
      font-size: 12px;
      color: #909399;
      margin-top: 4px;
    }

    .text-danger {
      color: #f56c6c;
      font-weight: 500;
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    padding: 16px 0;
  }
}

.inventory-detail-popup {
  .popup-header {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;
  }

  .popup-content {
    display: flex;
    gap: 24px;
  }

  .popup-column {
    flex: 1;

    .column-title {
      font-weight: 600;
      font-size: 12px;
      color: #606266;
      margin-bottom: 8px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13px;

      .label {
        color: #606266;
      }

      .value {
        font-weight: 500;
        color: #303133;
      }
    }
  }
}
</style>



