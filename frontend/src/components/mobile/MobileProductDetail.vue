<template>
  <div class="mobile-product-detail" v-loading="loading">
    <!-- Header -->
    <div class="mobile-header">
      <div class="header-left" @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="page-title">Chi tiết sản phẩm</div>
      <div class="header-right">
        <el-icon @click="handleEdit"><Edit /></el-icon>
        <el-icon @click="showMoreMenu = true"><More /></el-icon>
      </div>
    </div>

    <div class="mobile-content" v-if="product">
      <!-- Images Section -->
      <div class="images-section" v-if="product.images && product.images.length > 0">
        <div class="images-grid">
          <div 
            class="image-item" 
            v-for="(img, idx) in product.images" 
            :key="idx"
            @click="openImagePreview(idx)"
          >
            <img :src="img.url" alt="Product image" />
          </div>
        </div>
      </div>
      <div class="images-section empty" v-else>
        <div class="no-image">
          <el-icon><Picture /></el-icon>
          <span>Chưa có hình ảnh</span>
        </div>
      </div>

      <!-- Image Preview Dialog -->
      <el-dialog 
        v-model="showImagePreview" 
        :show-close="false"
        fullscreen
        class="image-preview-dialog"
      >
        <div class="preview-header">
          <span>{{ currentImageIndex + 1 }}/{{ product.images?.length || 0 }}</span>
          <el-icon @click="showImagePreview = false"><Close /></el-icon>
        </div>
        <div class="preview-content">
          <img 
            v-if="product.images && product.images[currentImageIndex]" 
            :src="product.images[currentImageIndex].url" 
            alt="Preview"
          />
        </div>
        <div class="preview-actions" v-if="product.images && product.images.length > 1">
          <el-button 
            circle 
            @click="prevImage" 
            :disabled="currentImageIndex === 0"
          >
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
          <el-button 
            circle 
            @click="nextImage"
            :disabled="currentImageIndex === product.images.length - 1"
          >
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </el-dialog>

      <!-- Basic Info -->
      <div class="info-card">
        <h2 class="product-name">{{ product.name }}</h2>
        <div class="info-row">
          <span class="label">SKU</span>
          <span class="value">: {{ product.sku || '---' }}</span>
        </div>
        <div class="info-row">
          <span class="label">Barcode</span>
          <span class="value">: {{ product.barcode || '---' }}</span>
        </div>
        <div class="info-row">
          <span class="label">Khối lượng</span>
          <span class="value">: {{ product.weight || 0 }}g</span>
        </div>
        <div class="info-row">
          <span class="label">Đơn vị tính</span>
          <span class="value">: {{ product.unit || '---' }}</span>
        </div>
      </div>

      <!-- Price Section -->
      <div class="price-card">
        <div class="card-header">
          <el-icon><PriceTag /></el-icon>
          <span>Giá sản phẩm</span>
          <span class="tax-note">Giá chưa bao gồm thuế</span>
        </div>
        
        <div class="price-grid">
          <div class="price-item">
            <span class="label">Thuế đầu ra</span>
            <span class="value">{{ product.taxOut || 0 }}%</span>
          </div>
          <div class="price-item">
            <span class="label">Thuế đầu vào</span>
            <span class="value">{{ product.taxIn || 0 }}%</span>
          </div>
        </div>

        <div class="price-grid">
          <div class="price-item">
            <span class="label">Giá bán lẻ</span>
            <span class="value">{{ formatCurrency(product.retailPrice) }}</span>
          </div>
          <div class="price-item">
            <span class="label">Giá bán buôn</span>
            <span class="value">{{ formatCurrency(product.wholesalePrice || 0) }}</span>
          </div>
        </div>

        <div class="price-item full-width">
          <span class="label">Giá nhập</span>
          <span class="value">{{ formatCurrency(product.costPrice) }}</span>
        </div>

        <div class="collapse-btn" @click="showPriceDetails = !showPriceDetails">
          <el-icon :class="{ rotated: showPriceDetails }"><ArrowUp /></el-icon>
        </div>
      </div>

      <!-- Inventory Section -->
      <div class="inventory-card">
        <div class="card-header">
          <el-icon><Box /></el-icon>
          <span>Kho hàng</span>
          <el-button 
            v-if="!editingInventory" 
            text 
            type="primary" 
            size="small"
            @click="editingInventory = true"
          >
            Chỉnh sửa
          </el-button>
          <el-button 
            v-else 
            text 
            type="success" 
            size="small"
            @click="saveInventory"
            :loading="savingInventory"
          >
            Lưu
          </el-button>
        </div>

        <div class="branch-row">
          <div class="branch-info">
            <span class="branch-name">Chi nhánh mặc định</span>
            <span class="location">Vị trí lưu kho: ---</span>
          </div>
          <div class="stock-info">
            <div class="stock-row">
              <span>Tồn kho:</span>
              <el-input-number
                v-if="editingInventory"
                v-model="inventoryEdit.quantity"
                :min="0"
                size="small"
                style="width: 100px"
              />
              <span v-else class="stock-value">{{ product.stockQuantity || 0 }}</span>
            </div>
            <div class="stock-row">
              <span>Có thể bán:</span>
              <span class="stock-value available">{{ product.availableQuantity || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Additional Info Section -->
      <div class="additional-card">
        <div class="card-header clickable" @click="showAdditionalInfo = !showAdditionalInfo">
          <span>Thông tin thêm</span>
          <div class="sub-text">Mô tả, phân loại sản phẩm</div>
          <el-icon :class="{ rotated: showAdditionalInfo }"><ArrowUp /></el-icon>
        </div>

        <div class="additional-content" v-if="showAdditionalInfo">
          <div class="info-row">
            <span class="label">Loại sản phẩm</span>
            <span class="value">{{ product.productTypeName || '---' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Nhãn hiệu</span>
            <span class="value">{{ product.brandName || '---' }}</span>
          </div>
          <div class="info-row clickable" @click="showDescription">
            <span class="label">Mô tả</span>
            <span class="value">{{ product.description || '---' }}</span>
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>

        <div class="status-row">
          <el-icon class="check-icon"><CircleCheck /></el-icon>
          <span>Cho phép bán</span>
        </div>
      </div>

      <!-- Transaction Status -->
      <div class="status-card">
        <div class="status-indicator active"></div>
        <span>Đang giao dịch</span>
      </div>
    </div>

    <!-- Bottom Actions -->
    <div class="bottom-actions">
      <el-button class="delete-btn" @click="handleDelete">Xóa sản phẩm</el-button>
    </div>

    <!-- More Menu -->
    <el-drawer v-model="showMoreMenu" direction="btt" size="auto" :show-close="false">
      <div class="action-sheet">
        <div class="action-item" @click="handleEdit">
          <el-icon><Edit /></el-icon>
          <span>Sửa sản phẩm</span>
        </div>
        <div class="action-item" @click="handleDuplicate">
          <el-icon><CopyDocument /></el-icon>
          <span>Nhân bản</span>
        </div>
        <div class="action-item" @click="handlePrintBarcode">
          <el-icon><Printer /></el-icon>
          <span>In mã vạch</span>
        </div>
        <div class="action-item cancel" @click="showMoreMenu = false">
          <span>Đóng</span>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  ArrowLeft, Edit, More, Picture, ArrowUp, ArrowRight, 
  Box, InfoFilled, CircleCheck, CopyDocument, Printer, Close 
} from '@element-plus/icons-vue'
import productService from '@/services/product.service'
import { inventoryService } from '@/services/inventory.service'

const PriceTag = { template: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58s1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41s-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/></svg>` }

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const product = ref<any>(null)
const showMoreMenu = ref(false)
const showPriceDetails = ref(true)
const showAdditionalInfo = ref(true)
const editingInventory = ref(false)
const savingInventory = ref(false)
const inventoryEdit = reactive({
  quantity: 0,
  costPrice: 0
})
const showImagePreview = ref(false)
const currentImageIndex = ref(0)

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value || 0)
}

async function loadProduct() {
  loading.value = true
  try {
    const result = await productService.getProductById(Number(route.params.id))
    product.value = result
    
    // Load inventory data using desktop logic
    if (result.id) {
      try {
        const invRes = await inventoryService.getProductInventory(result.id)
        const invData = invRes?.success ? invRes.data : invRes
        
        if (invData) {
          product.value.stockQuantity = invData.totalQuantity || product.value.stockQuantity || 0
          product.value.availableQuantity = invData.totalAvailable || product.value.availableQuantity || 0
          
          // Set edit values
          inventoryEdit.quantity = invData.totalQuantity || 0
          
          // Get cost price from branch
          if (invData.branches && invData.branches.length > 0) {
            product.value.costPrice = invData.branches[0]?.costPrice || product.value.importPrice || 0
            inventoryEdit.costPrice = invData.branches[0]?.costPrice || 0
          }
        }
      } catch (invErr) {
        console.warn('Load inventory error:', invErr)
      }
    }
  } catch (e: any) {
    console.error('Load product error:', e)
    ElMessage.error('Lỗi tải thông tin sản phẩm')
  } finally {
    loading.value = false
  }
}

function handleEdit() {
  showMoreMenu.value = false
  router.push(`/products/${route.params.id}/edit`)
}

function handleDuplicate() {
  showMoreMenu.value = false
  router.push(`/products/create?copy=${route.params.id}`)
}

function handlePrintBarcode() {
  showMoreMenu.value = false
  ElMessage.info('In mã vạch...')
}

async function handleDelete() {
  try {
    await ElMessageBox.confirm('Bạn có chắc muốn xóa sản phẩm này?', 'Xác nhận', {
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      type: 'warning'
    })
    await productService.deleteProduct(Number(route.params.id))
    ElMessage.success('Đã xóa sản phẩm')
    router.back()
  } catch {
    // Cancelled
  }
}

function openImagePreview(index: number) {
  currentImageIndex.value = index
  showImagePreview.value = true
}

function nextImage() {
  if (currentImageIndex.value < (product.value.images?.length || 0) - 1) {
    currentImageIndex.value++
  }
}

function prevImage() {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

function showDescription() {
  // Show description dialog
}

async function saveInventory() {
  savingInventory.value = true
  try {
    await inventoryService.updateInventory(product.value.id, {
      branchId: 1,
      quantity: inventoryEdit.quantity,
      available: inventoryEdit.quantity,
      costPrice: inventoryEdit.costPrice
    })
    
    product.value.stockQuantity = inventoryEdit.quantity
    product.value.availableQuantity = inventoryEdit.quantity
    editingInventory.value = false
    
    ElMessage.success('Đã cập nhật kho hàng')
  } catch (e) {
    console.error('Update inventory error:', e)
    ElMessage.error('Lỗi cập nhật kho hàng')
  } finally {
    savingInventory.value = false
  }
}

onMounted(() => {
  loadProduct()
})
</script>

<style scoped lang="scss">
.mobile-product-detail {
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
  .header-right { 
    display: flex; 
    gap: 16px;
    .el-icon { font-size: 20px; cursor: pointer; color: #606266; }
  }
}

.mobile-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 16px;
  padding-bottom: 100px;
}

.images-section {
  margin-bottom: 16px;

  .images-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;

    .image-item {
      aspect-ratio: 1;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      background: #f5f7fa;
      border: 1px solid #e4e7ed;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  &.empty {
    .no-image {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      background: #fff;
      border-radius: 12px;
      color: #c0c4cc;

      .el-icon { font-size: 48px; margin-bottom: 8px; }
      span { font-size: 14px; }
    }
  }
}

// Image Preview Dialog
:deep(.image-preview-dialog) {
  .el-dialog__header {
    display: none;
  }

  .el-dialog__body {
    padding: 0;
    height: 100vh;
    background: #000;
    display: flex;
    flex-direction: column;
  }
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  color: #fff;
  background: rgba(0, 0, 0, 0.5);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;

  span { font-size: 14px; }
  .el-icon { 
    font-size: 24px; 
    cursor: pointer; 
  }
}

.preview-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 16px;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
}

.preview-actions {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 16px;
  z-index: 1;

  .el-button {
    background: rgba(255, 255, 255, 0.9);
    border: none;
    width: 44px;
    height: 44px;

    &:disabled {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}

.info-card, .price-card, .inventory-card, .additional-card, .status-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
}

.info-card {
  .product-name {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 16px 0;
    color: #303133;
  }

  .info-row {
    display: flex;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child { border-bottom: none; }

    .label {
      width: 100px;
      color: #909399;
      font-size: 14px;
    }

    .value {
      flex: 1;
      color: #303133;
      font-size: 14px;
    }
  }
}

.price-card {
  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;

    .el-icon { font-size: 20px; color: #606266; }
    span { font-size: 15px; font-weight: 500; }
    .tax-note { 
      margin-left: auto; 
      font-size: 12px; 
      color: #909399;
      font-weight: normal;
    }
  }

  .price-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 12px;
  }

  .price-item {
    .label {
      display: block;
      font-size: 13px;
      color: #909399;
      margin-bottom: 4px;
    }

    .value {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }

    &.full-width {
      border-top: 1px solid #f0f0f0;
      padding-top: 12px;
    }
  }

  .collapse-btn {
    text-align: center;
    padding-top: 8px;

    .el-icon {
      font-size: 20px;
      color: #409eff;
      transition: transform 0.3s;

      &.rotated { transform: rotate(180deg); }
    }
  }
}

.inventory-card {
  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;

    .el-icon { font-size: 20px; color: #606266; }
    span { font-size: 15px; font-weight: 500; }
    .info-icon { color: #409eff; margin-left: auto; }
  }

  .branch-row {
    display: flex;
    justify-content: space-between;

    .branch-info {
      .branch-name {
        display: block;
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 4px;
      }
      .location {
        font-size: 12px;
        color: #909399;
      }
    }

    .stock-info {
      text-align: right;

      .stock-row {
        font-size: 13px;
        margin-bottom: 4px;

        .stock-value {
          font-weight: 500;
          margin-left: 4px;

          &.available { color: #409eff; }
        }
      }
    }
  }
}

.additional-card {
  .card-header {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;

    &.clickable { cursor: pointer; }

    span { font-size: 15px; font-weight: 500; }
    .sub-text { 
      width: 100%;
      font-size: 12px; 
      color: #909399;
      font-weight: normal;
    }
    .el-icon {
      margin-left: auto;
      transition: transform 0.3s;
      &.rotated { transform: rotate(180deg); }
    }
  }

  .additional-content {
    padding-top: 12px;

    .info-row {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;

      &.clickable { cursor: pointer; }

      .label {
        width: 100px;
        color: #909399;
        font-size: 14px;
      }

      .value {
        flex: 1;
        color: #303133;
        font-size: 14px;
      }

      .el-icon { color: #c0c4cc; }
    }
  }

  .status-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-top: 12px;

    .check-icon { color: #67c23a; font-size: 18px; }
    span { font-size: 14px; color: #303133; }
  }
}

.status-card {
  display: flex;
  align-items: center;
  gap: 8px;

  .status-indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #67c23a;

    &.active { background: #67c23a; }
    &.inactive { background: #909399; }
  }

  span { font-size: 14px; color: #303133; }
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 0));
  border-top: 1px solid #e4e7ed;

  .delete-btn {
    width: 100%;
    height: 44px;
    font-size: 15px;
    color: #f56c6c;
    border-color: #f56c6c;
    background: #fff;
  }
}

.action-sheet {
  .action-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;

    &:active { background: #f5f7fa; }

    .el-icon { font-size: 20px; color: #606266; }
    span { font-size: 15px; }

    &.cancel {
      justify-content: center;
      color: #909399;
      border-bottom: none;
    }
  }
}
</style>
