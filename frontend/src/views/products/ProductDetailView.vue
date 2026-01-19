<template>
  <!-- Mobile View -->
  <MobileProductDetail v-if="isMobile" />
  
  <!-- Desktop View -->
  <div v-else class="product-detail-page">
    <!-- Header -->
    <div class="detail-header">
      <div class="header-left">
        <el-link @click="$router.push('/products')" :underline="false" class="back-link">
          <el-icon><ArrowLeft /></el-icon>
          <span>Quay lại danh sách sản phẩm</span>
        </el-link>
      </div>
      <div class="header-actions">
        <el-button @click="$router.push('/products')">Thoát</el-button>
        <el-button type="danger" plain @click="handleDelete">Xoá</el-button>
        <el-button type="primary" @click="$router.push(`/products/${productId}/edit`)">
          Sửa sản phẩm
        </el-button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="productStore.loading" class="loading-container">
      <el-icon class="is-loading" :size="40"><Loading /></el-icon>
      <p>Đang tải thông tin sản phẩm...</p>
    </div>

    <!-- Content -->
    <div v-else-if="productStore.currentProduct" class="detail-content">
      <!-- Product Title -->
      <div class="product-title-section">
        <h1>{{ productStore.currentProduct.name }}</h1>
        <el-button text>
          <el-icon><CopyDocument /></el-icon> Sao chép
        </el-button>
      </div>

      <!-- Product Info Card - FULL WIDTH with Images -->
      <el-card class="info-card">
        <div class="card-header-tabs">
          <span class="tab-item active">Thông tin sản phẩm</span>
          <span class="tab-item">
            <el-tag type="warning" size="small">Đang giao dịch</el-tag>
          </span>
        </div>

        <div class="info-content">
          <!-- Images Section -->
          <div v-if="productStore.currentProduct.images?.length" class="product-images">
            <el-image
              v-for="(image, index) in productStore.currentProduct.images"
              :key="index"
              :src="getImageUrl(image.url)"
              fit="cover"
              class="product-image"
            >
              <template #error>
                <div class="image-placeholder">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
          <div v-else class="no-images">
            <el-icon :size="60"><Picture /></el-icon>
            <p>Chưa có hình ảnh</p>
          </div>

          <!-- Product Info Grid -->
          <div class="info-grid">
            <div class="info-column">
              <div class="info-row">
                <span class="label">Mã SKU</span>
                <span class="value">: {{ productStore.currentProduct.sku || '---' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Mã barcode</span>
                <span class="value">: {{ productStore.currentProduct.barcode || '---' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Khối lượng</span>
                <span class="value">: {{ productStore.currentProduct.weight || 0 }}{{ productStore.currentProduct.weightUnit || 'g' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Đơn vị tính</span>
                <span class="value">: {{ productStore.currentProduct.unit || '---' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Phân loại</span>
                <span class="value">: {{ productStore.currentProduct.managementType === 'normal' ? 'Sản phẩm thường' : 'Sản phẩm lô - HSD' }}</span>
              </div>
              <el-link type="primary">Xem mô tả</el-link>
            </div>
            <div class="info-column">
              <div class="info-row">
                <span class="label">Loại sản phẩm</span>
                <span class="value">: {{ productStore.currentProduct.productType?.name || '---' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Nhãn hiệu</span>
                <span class="value">: {{ productStore.currentProduct.brand?.name || '---' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Tags</span>
                <span class="value">: {{ productStore.currentProduct.tags?.join(', ') || '---' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Ngày tạo</span>
                <span class="value">: {{ formatDateTime(productStore.currentProduct.createdAt) }}</span>
              </div>
              <div class="info-row">
                <span class="label">Ngày cập nhật cuối</span>
                <span class="value">: {{ formatDateTime(productStore.currentProduct.updatedAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- Row: Giá sản phẩm + Thông tin thêm -->
      <el-row :gutter="16">
        <el-col :span="12">
          <el-card class="section-card">
            <template #header>
              <span>Giá sản phẩm</span>
            </template>
            <div class="price-list">
              <div class="price-row">
                <span class="label">Giá bán lẻ</span>
                <span class="value">: {{ formatPrice(productStore.currentProduct.retailPrice) }}</span>
              </div>
              <div class="price-row">
                <span class="label">Giá bán buôn</span>
                <span class="value">: {{ formatPrice(productStore.currentProduct.wholesalePrice || 0) }}</span>
              </div>
              <div class="price-row">
                <span class="label">Giá nhập</span>
                <span class="value">: {{ formatPrice(productStore.currentProduct.importPrice || 0) }}</span>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card class="section-card">
            <template #header>
              <span>Thông tin thêm</span>
            </template>
            <div class="additional-info">
              <div class="info-row">
                <span class="label">Trạng thái</span>
                <span class="value">: {{ productStore.currentProduct.allowSale ? 'Đang bán' : 'Ngừng bán' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Áp dụng thuế</span>
                <span class="value">: {{ productStore.currentProduct.applyTax ? 'Có' : 'Không' }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- Tồn kho -->
      <el-card class="section-card inventory-card">
        <template #header>
          <div class="inventory-header">
            <div class="header-left">
              <span>Tồn kho</span>
              <el-switch v-model="showInventory" />
            </div>
            <span class="header-note">
              Ghi nhận số lượng Tồn kho ban đầu và Giá vốn của sản phẩm tại các Chi nhánh
            </span>
          </div>
        </template>

        <div v-if="showInventory">
          <el-tabs v-model="inventoryTab">
            <el-tab-pane label="Tồn kho" name="stock" />
            <el-tab-pane label="Lịch sử kho" name="history" />
          </el-tabs>

          <!-- Tồn kho Table -->
          <div v-if="inventoryTab === 'stock'">
            <el-table :data="inventoryData" v-loading="inventoryLoading" style="width: 100%" border>
              <el-table-column prop="branch" label="Chi nhánh" min-width="200" />
              <el-table-column label="Tồn kho ban đầu" width="150" align="center">
                <template #default="{ row }">{{ row.initialStock || 0 }}</template>
              </el-table-column>
              <el-table-column label="Giá vốn" width="150" align="right">
                <template #default="{ row }">{{ formatPrice(row.costPrice || 0) }}</template>
              </el-table-column>
            </el-table>
          </div>

          <!-- Lịch sử kho Table -->
          <div v-else>
            <el-select v-model="historyBranch" style="width: 200px; margin-bottom: 16px" size="small">
              <el-option label="Chi nhánh mặc định" value="1" />
            </el-select>

            <el-table :data="historyData" v-loading="historyLoading" style="width: 100%">
              <el-table-column label="Ngày ghi nhận" width="150">
                <template #default="{ row }">{{ formatDateTime(row.date) }}</template>
              </el-table-column>
              <el-table-column label="Nhân viên" prop="staff" width="150" />
              <el-table-column label="Thao tác" prop="action" min-width="200" />
              <el-table-column label="Số lượng thay đổi" width="150" align="right">
                <template #default="{ row }">
                  <span :class="row.quantityChange > 0 ? 'text-success' : (row.quantityChange < 0 ? 'text-danger' : '')">
                    {{ row.quantityChange > 0 ? '+' : '' }}{{ row.quantityChange }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="Tồn kho" width="100" align="center">
                <template #default="{ row }">{{ row.stock }}</template>
              </el-table-column>
              <el-table-column label="Mã chứng từ" width="130">
                <template #default="{ row }">
                  <el-link v-if="row.documentCode" type="primary">{{ row.documentCode }}</el-link>
                  <span v-else>---</span>
                </template>
              </el-table-column>
              <el-table-column label="Chi nhánh" prop="branch" width="150" />
            </el-table>

            <div class="pagination-wrapper">
              <span class="page-info">Hiển thị {{ pageSize }} kết quả - Từ 1 đến {{ Math.min(historyData.length, pageSize) }} trên tổng {{ historyTotal }}</span>
              <el-pagination
                v-model:current-page="historyPage"
                :page-size="pageSize"
                :total="historyTotal"
                layout="prev, pager, next"
                background
              />
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Loading, CopyDocument, Picture } from '@element-plus/icons-vue'
import { useProductStore } from '@/stores/product.store'
import { inventoryService } from '@/services/inventory.service'
import { useDevice } from '@/composables/useDevice'
import MobileProductDetail from '@/components/mobile/MobileProductDetail.vue'

const { isMobile } = useDevice()
const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

const productId = computed(() => Number(route.params.id))
const showInventory = ref(true)
const inventoryTab = ref('stock')
const historyBranch = ref('1')
const historyPage = ref(1)
const pageSize = ref(20)
const historyTotal = ref(3)

// Inventory data
const inventoryData = ref<any[]>([])
const inventoryLoading = ref(false)

// History data  
const historyData = ref<any[]>([])
const historyLoading = ref(false)

// Load inventory data from API
async function loadInventoryData() {
  if (!productId.value) return
  
  inventoryLoading.value = true
  try {
    const res = await inventoryService.getProductInventory(productId.value)
    if (res.success && res.data?.branches) {
      inventoryData.value = res.data.branches.map((inv: any) => ({
        branch: inv.branchName || 'Chi nhánh mặc định',
        initialStock: inv.quantity || 0,
        costPrice: inv.costPrice || 0,
      }))
    } else {
      // Default if no data
      inventoryData.value = [
        { branch: 'Chi nhánh mặc định', initialStock: 0, costPrice: 0 },
      ]
    }
  } catch (e) {
    console.error('Load inventory error:', e)
    inventoryData.value = [
      { branch: 'Chi nhánh mặc định', initialStock: 0, costPrice: 0 },
    ]
  } finally {
    inventoryLoading.value = false
  }
}

// Load history data from API
async function loadHistoryData() {
  if (!productId.value) return
  
  historyLoading.value = true
  try {
    const res = await inventoryService.getProductInventoryHistory(productId.value)
    if (res.success && res.data) {
      historyData.value = res.data
      historyTotal.value = res.data.length
    }
  } catch (e) {
    console.error('Load history error:', e)
    historyData.value = []
  } finally {
    historyLoading.value = false
  }
}

// Watch inventory tab change to load data
watch(inventoryTab, (newTab) => {
  if (newTab === 'stock' && inventoryData.value.length === 0) {
    loadInventoryData()
  } else if (newTab === 'history' && historyData.value.length === 0) {
    loadHistoryData()
  }
})

// Watch showInventory toggle
watch(showInventory, (show) => {
  if (show && inventoryTab.value === 'stock' && inventoryData.value.length === 0) {
    loadInventoryData()
  } else if (show && inventoryTab.value === 'history' && historyData.value.length === 0) {
    loadHistoryData()
  }
})

function getImageUrl(url: string) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return url
}

async function handleDelete() {
  try {
    await ElMessageBox.confirm(
      'Bạn có chắc chắn muốn xóa sản phẩm này?',
      'Xác nhận xóa',
      {
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy',
        type: 'warning',
      }
    )
    
    await productStore.deleteProduct(productId.value)
    ElMessage.success('Xóa sản phẩm thành công')
    router.push('/products')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('Xóa sản phẩm thất bại')
    }
  }
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN').format(price || 0)
}

function formatDateTime(dateStr: string) {
  if (!dateStr) return '---'
  const date = new Date(dateStr)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(async () => {
  await productStore.fetchProductById(productId.value)
  // Load inventory data if showInventory is true by default
  if (showInventory.value) {
    loadInventoryData()
  }
})
</script>

<style scoped lang="scss">
.product-detail-page {
  background: #f5f7fa;
  min-height: 100%;
  padding: 20px;

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .back-link {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #409eff;
      font-size: 14px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .loading-container {
    text-align: center;
    padding: 100px 20px;
    color: #909399;
  }

  .detail-content {
    .product-title-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h1 {
        font-size: 24px;
        font-weight: 600;
        margin: 0;
      }
    }
  }

  .info-card {
    margin-bottom: 16px;
    border-radius: 8px;

    .card-header-tabs {
      display: flex;
      gap: 20px;
      padding: 12px 20px;
      border-bottom: 1px solid #ebeef5;

      .tab-item {
        font-size: 14px;
        font-weight: 500;
        color: #606266;
        cursor: pointer;
        padding-bottom: 8px;

        &.active {
          color: #409eff;
          border-bottom: 2px solid #409eff;
        }
      }
    }

    .info-content {
      padding: 20px;
    }

    .product-images {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;

      .product-image {
        width: 100px;
        height: 100px;
        border-radius: 8px;
        border: 1px solid #ebeef5;
      }

      .image-placeholder {
        width: 100px;
        height: 100px;
        background: #f5f7fa;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #c0c4cc;
      }
    }

    .no-images {
      text-align: center;
      padding: 40px 0;
      color: #c0c4cc;
      margin-bottom: 20px;

      p {
        margin-top: 12px;
      }
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;

      .info-column {
        .info-row {
          display: flex;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;

          .label {
            width: 150px;
            color: #606266;
          }

          .value {
            flex: 1;
            color: #303133;
          }
        }
      }
    }
  }

  .section-card {
    margin-bottom: 16px;
    border-radius: 8px;

    .price-list,
    .additional-info {
      .price-row,
      .info-row {
        display: flex;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .label {
          width: 150px;
          color: #606266;
        }

        .value {
          flex: 1;
          color: #303133;
          font-weight: 500;
        }
      }
    }
  }

  .inventory-card {
    .inventory-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .header-note {
        font-size: 13px;
        color: #909399;
      }
    }

    :deep(.el-tabs__header) {
      margin-bottom: 16px;
    }

    .text-success {
      color: #67c23a;
    }

    .text-danger {
      color: #f56c6c;
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 0;

    .page-info {
      font-size: 14px;
      color: #606266;
    }
  }
}
</style>
