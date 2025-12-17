<template>
  <div class="product-detail">
    <!-- Header -->
    <div class="page-header">
      <div class="breadcrumb">
        <el-link @click="$router.push('/products')" :underline="false">
          <el-icon><ArrowLeft /></el-icon> Quay lại danh sách sản phẩm
        </el-link>
      </div>
      <div class="actions">
        <el-button @click="$router.push('/products')">Thoát</el-button>
        <el-button type="danger" @click="handleDelete">Xoá</el-button>
        <el-button type="primary" @click="$router.push(`/products/${productId}/edit`)">
          Sửa sản phẩm
        </el-button>
      </div>
    </div>

    <!-- Success Banner -->
    <el-alert
      v-if="showSuccessBanner"
      type="success"
      :closable="false"
      show-icon
      class="success-banner"
    >
      <template #title>
        <div class="banner-content">
          <div>
            <strong>✔ Sản phẩm {{ productStore.currentProduct?.name }} đã được tạo</strong>
            <p>Để tăng tồn kho cho sản phẩm, vui lòng nhập hàng tại đây</p>
          </div>
          <div class="banner-actions">
            <el-button type="primary" text @click="$router.push('/products/create')">
              Tạo sản phẩm khác
            </el-button>
            <el-button type="primary" text>In tem mã vạch</el-button>
          </div>
        </div>
      </template>
    </el-alert>

    <div v-loading="productStore.loading">
      <div v-if="productStore.currentProduct" class="product-content">
        <!-- Product Name -->
        <div class="product-name-section">
          <h1>{{ productStore.currentProduct.name }}</h1>
          <el-button type="primary" text>Sao chép</el-button>
        </div>

        <el-row :gutter="20">
          <!-- Left Column -->
          <el-col :span="16">
            <!-- Product Information Tabs -->
            <el-card>
              <el-tabs v-model="activeInfoTab">
                <el-tab-pane label="Thông tin sản phẩm" name="info">
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <div class="info-item">
                        <label>Mã SKU:</label>
                        <span>{{ productStore.currentProduct.sku || '---' }}</span>
                      </div>
                      <div class="info-item">
                        <label>Mã barcode:</label>
                        <span>{{ productStore.currentProduct.barcode || '---' }}</span>
                      </div>
                      <div class="info-item">
                        <label>Khối lượng:</label>
                        <span>
                          {{ productStore.currentProduct.weight || 0 }}
                          {{ productStore.currentProduct.weightUnit || 'g' }}
                        </span>
                      </div>
                      <div class="info-item">
                        <label>Đơn vị tính:</label>
                        <span>{{ productStore.currentProduct.unit || '---' }}</span>
                      </div>
                      <div class="info-item">
                        <label>Phân loại:</label>
                        <span>
                          {{
                            productStore.currentProduct.managementType === 'normal'
                              ? 'Sản phẩm thường'
                              : 'Sản phẩm lô - Hạn sử dụng'
                          }}
                        </span>
                      </div>
                      <div class="info-item">
                        <el-link type="primary" @click="showDescription = true">
                          Xem mô tả
                        </el-link>
                      </div>
                    </el-col>
                    <el-col :span="12">
                      <div class="info-item">
                        <label>Loại sản phẩm:</label>
                        <span>{{ productStore.currentProduct.productType?.name || '---' }}</span>
                      </div>
                      <div class="info-item">
                        <label>Nhãn hiệu:</label>
                        <span>{{ productStore.currentProduct.brand?.name || '---' }}</span>
                      </div>
                      <div class="info-item">
                        <label>Tags:</label>
                        <div class="tags">
                          <el-tag
                            v-for="tag in productStore.currentProduct.tags"
                            :key="tag"
                            style="margin-right: 8px"
                          >
                            {{ tag }}
                          </el-tag>
                          <span v-if="!productStore.currentProduct.tags?.length">---</span>
                        </div>
                      </div>
                      <div class="info-item">
                        <label>Ngày tạo:</label>
                        <span>{{ formatDate(productStore.currentProduct.createdAt) }}</span>
                      </div>
                      <div class="info-item">
                        <label>Ngày cập nhật cuối:</label>
                        <span>{{ formatDate(productStore.currentProduct.updatedAt) }}</span>
                      </div>
                    </el-col>
                  </el-row>
                </el-tab-pane>
                <el-tab-pane label="Đang giao dịch" name="transaction">
                  <p>Không có giao dịch nào</p>
                </el-tab-pane>
              </el-tabs>
            </el-card>

            <!-- Product Image -->
            <el-card class="image-card">
              <div v-if="!productStore.currentProduct.images?.length" class="no-image">
                <el-icon :size="60"><Picture /></el-icon>
                <p>Sản phẩm chưa có ảnh tải lên</p>
              </div>
              <div v-else class="image-gallery">
                <el-image
                  v-for="image in productStore.currentProduct.images"
                  :key="image.id"
                  :src="image.url"
                  :alt="image.altText"
                  fit="cover"
                  class="product-image"
                />
              </div>
            </el-card>

            <!-- Product Price -->
            <el-card>
              <h3>Giá sản phẩm</h3>
              <el-row :gutter="20">
                <el-col :span="8">
                  <div class="price-item">
                    <label>Giá bán lẻ:</label>
                    <span class="price">{{ formatPrice(productStore.currentProduct.retailPrice) }}</span>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="price-item">
                    <label>Giá nhập:</label>
                    <span class="price">{{ formatPrice(productStore.currentProduct.importPrice || 0) }}</span>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="price-item">
                    <label>Giá bán buôn:</label>
                    <span class="price">{{ formatPrice(productStore.currentProduct.wholesalePrice || 0) }}</span>
                  </div>
                </el-col>
              </el-row>
            </el-card>

            <!-- Additional Information -->
            <el-card>
              <h3>Thông tin thêm</h3>
              <div class="info-checkboxes">
                <el-checkbox :checked="productStore.currentProduct.allowSale" disabled>
                  Cho phép bán
                </el-checkbox>
                <el-checkbox :checked="productStore.currentProduct.applyTax" disabled>
                  Áp dụng thuế
                </el-checkbox>
              </div>
              <div v-if="productStore.currentProduct.applyTax" class="tax-info">
                <div class="info-item">
                  <label>Giá áp dụng thuế:</label>
                  <span>
                    {{ productStore.currentProduct.taxIncluded ? 'Giá đã bao gồm thuế' : 'Giá chưa bao gồm thuế' }}
                  </span>
                </div>
                <div class="info-item">
                  <label>Thuế đầu vào:</label>
                  <span>0%</span>
                </div>
                <div class="info-item">
                  <label>Thuế đầu ra:</label>
                  <span>10%</span>
                </div>
              </div>
              <div class="info-item">
                <el-checkbox :checked="productStore.currentProduct.expiryWarningEnabled" disabled>
                  Cảnh báo lô sắp hết hạn
                </el-checkbox>
              </div>
            </el-card>

            <!-- Inventory -->
            <el-card>
              <template #header>
                <div class="inventory-header">
                  <el-tabs v-model="activeInventoryTab">
                    <el-tab-pane label="Tồn kho" name="inventory" />
                    <el-tab-pane label="Lịch sử kho" name="history" />
                  </el-tabs>
                  <el-link type="primary" v-if="productStore.currentProduct.managementType === 'batch'">
                    Xem tất cả lô hàng
                  </el-link>
                </div>
              </template>

              <el-table :data="inventoryData" style="width: 100%">
                <el-table-column prop="branch" label="Chi nhánh" />
                <el-table-column prop="inventory" label="Tồn kho" />
                <el-table-column prop="costPrice" label="Giá vốn" />
                <el-table-column prop="available" label="Có thể bán" />
                <el-table-column prop="inTransaction" label="Đang giao dịch" />
                <el-table-column prop="incoming" label="Hàng đang về" />
                <el-table-column prop="outgoing" label="Hàng đang giao" />
                <el-table-column prop="minStock" label="Tồn tối thiểu" />
                <el-table-column prop="maxStock" label="Tồn tối đa" />
                <el-table-column prop="location" label="Điểm lưu kho" />
              </el-table>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- Description Dialog -->
    <el-dialog v-model="showDescription" title="Mô tả sản phẩm" width="700px">
      <p>{{ productStore.currentProduct?.description || 'Chưa có mô tả' }}</p>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product.store'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Picture } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

const productId = computed(() => parseInt(route.params.id as string))
const showSuccessBanner = ref(false)
const activeInfoTab = ref('info')
const activeInventoryTab = ref('inventory')
const showDescription = ref(false)

const inventoryData = ref([
  {
    branch: 'Chi nhánh mặc định',
    inventory: 0,
    costPrice: '---',
    available: 0,
    inTransaction: 0,
    incoming: 0,
    outgoing: 0,
    minStock: '---',
    maxStock: '---',
    location: '---',
  },
])

onMounted(async () => {
  await productStore.fetchProductById(productId.value)
  // Check if just created
  const created = route.query.created === 'true'
  if (created) {
    showSuccessBanner.value = true
    setTimeout(() => {
      showSuccessBanner.value = false
    }, 5000)
  }
})

function formatDate(date: string) {
  return dayjs(date).format('DD/MM/YYYY HH:mm')
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN').format(price)
}

async function handleDelete() {
  try {
    await ElMessageBox.confirm('Bạn có chắc muốn xóa sản phẩm này?', 'Xác nhận', {
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      type: 'warning',
    })
    await productStore.deleteProduct(productId.value)
    ElMessage.success('Xóa sản phẩm thành công')
    router.push('/products')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('Xóa sản phẩm thất bại')
    }
  }
}
</script>

<style scoped lang="scss">
.product-detail {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 10px 0;
    border-bottom: 1px solid #e5e7eb;

    .actions {
      display: flex;
      gap: 10px;
    }
  }

  .success-banner {
    margin-bottom: 20px;

    .banner-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;

      .banner-actions {
        display: flex;
        gap: 10px;
      }
    }
  }

  .product-name-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h1 {
      margin: 0;
    }
  }

  .info-item {
    margin-bottom: 15px;

    label {
      font-weight: 500;
      color: #606266;
      margin-right: 10px;
    }

    span {
      color: #303133;
    }
  }

  .tags {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .image-card {
    margin-top: 20px;

    .no-image {
      text-align: center;
      padding: 40px;
      color: #909399;

      p {
        margin-top: 10px;
      }
    }

    .image-gallery {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;

      .product-image {
        width: 150px;
        height: 150px;
        border-radius: 4px;
      }
    }
  }

  .price-item {
    .price {
      font-size: 18px;
      font-weight: 600;
      color: #409eff;
    }
  }

  .info-checkboxes {
    margin-bottom: 20px;
  }

  .tax-info {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid #e5e7eb;
  }

  .inventory-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
