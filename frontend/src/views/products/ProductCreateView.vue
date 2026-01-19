<template>
  <!-- Mobile View -->
  <MobileProductCreate v-if="isMobile" />
  
  <!-- Desktop View -->
  <div v-else class="product-create-page">
    <!-- Full-width Header Bar -->
    <div class="page-header-bar">
      <div class="header-left">
        <el-link @click="goBack" :underline="false" class="back-link">
          <el-icon><ArrowLeft /></el-icon> 
          {{ isEditMode ? 'Quay lại chi tiết sản phẩm' : 'Quay lại danh sách sản phẩm' }}
        </el-link>
      </div>
      <div class="header-right">
        <el-button @click="goBack">Huỷ</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="productStore.loading">
          {{ isEditMode ? 'Lưu' : 'Lưu' }}
        </el-button>
      </div>
    </div>

    <!-- Product Name & Type (when editing) -->
    <div v-if="isEditMode && form.name" class="product-title-bar">
      <h1 class="product-name">{{ form.name }}</h1>
      <p class="product-type">{{ form.managementType === 'batch' ? 'Sản phẩm lô - HSD' : 'Sản phẩm thường' }}</p>
    </div>

    <!-- Loading state when fetching product data in edit mode -->
    <div v-if="isEditMode && productStore.loading && !productStore.currentProduct" 
         style="text-align: center; padding: 60px 20px;">
      <el-icon class="is-loading" :size="50" style="color: #409eff;"><Loading /></el-icon>
      <p style="margin-top: 20px; color: #606266; font-size: 16px;">Đang tải thông tin sản phẩm...</p>
    </div>

    <!-- Form content - only show when not loading or when product is loaded -->
    <template v-else>
    <el-row :gutter="20">
      <!-- Left Column -->
      <el-col :span="16">
        <!-- Hình thức quản lý -->
        <el-card class="section-card">
          <template #header>
            <div class="section-header">
              <span>Hình thức quản lý</span>
              <el-icon class="info-icon"><InfoFilled /></el-icon>
            </div>
          </template>
          <el-radio-group v-model="form.managementType">
            <el-radio label="normal">Sản phẩm thường</el-radio>
            <el-radio label="batch">Sản phẩm lô - HSD</el-radio>
          </el-radio-group>
          <el-link type="primary" class="settings-link" @click="$router.push('/settings/products')">Thiết lập</el-link>
        </el-card>

        <!-- Thông tin chung -->
        <el-card class="section-card">
          <template #header>
            <div class="section-header">
              <span>Thông tin chung</span>
            </div>
          </template>
          <el-form :model="form" :rules="rules" ref="formRef" label-width="150px">
            <el-form-item label="Tên sản phẩm" prop="name" required>
              <el-input
                v-model="form.name"
                placeholder="Nhập tên sản phẩm"
                clearable
              >
                <template #suffix>
                  <el-icon class="info-icon"><InfoFilled /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="Mã sản phẩm/SKU" prop="sku">
              <el-input v-model="form.sku" placeholder="Nhập mã SKU" clearable>
                <template #suffix>
                  <el-icon class="info-icon"><InfoFilled /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="Khối lượng" prop="weight">
              <el-input-number
                v-model="form.weight"
                :min="0"
                :precision="2"
                style="width: 200px"
              />
              <el-select v-model="form.weightUnit" style="width: 100px; margin-left: 10px">
                <el-option label="g" value="g" />
                <el-option label="kg" value="kg" />
              </el-select>
            </el-form-item>

            <el-form-item label="Mã vạch/Barcode" prop="barcode">
              <el-input
                v-model="form.barcode"
                placeholder="Nhập tay hoặc sử dụng máy để quét mã vạch. (3-15 ký tự)"
                :maxlength="15"
                clearable
              >
                <template #suffix>
                  <el-icon class="info-icon"><InfoFilled /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="Đơn vị tính" prop="unit">
              <el-input v-model="form.unit" placeholder="Nhập đơn vị tính" clearable />
            </el-form-item>

            <el-form-item label="Mô tả sản phẩm">
              <el-link type="primary" @click="showDescriptionDialog = true">
                Xem mô tả
              </el-link>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- Giá sản phẩm -->
        <el-card class="section-card">
          <template #header>
            <div class="section-header">
              <span>Giá sản phẩm</span>
              <el-link type="primary" @click="showPricePolicyDialog = true">
                + Thêm chính sách giá
              </el-link>
            </div>
          </template>
          <el-form :model="form" label-width="150px">
            <el-form-item label="Giá bán lẻ" prop="retailPrice" required>
              <el-input-number
                v-model="form.retailPrice"
                :min="0"
                :precision="0"
                style="width: 100%"
              >
                <template #suffix>
                  <el-icon class="info-icon"><InfoFilled /></el-icon>
                </template>
              </el-input-number>
            </el-form-item>

            <el-form-item label="Giá bán buôn" prop="wholesalePrice">
              <el-input-number
                v-model="form.wholesalePrice"
                :min="0"
                :precision="0"
                style="width: 100%"
              >
                <template #suffix>
                  <el-icon class="info-icon"><InfoFilled /></el-icon>
                </template>
              </el-input-number>
            </el-form-item>

            <el-form-item label="Giá nhập" prop="importPrice">
              <el-input-number
                v-model="form.importPrice"
                :min="0"
                :precision="0"
                style="width: 100%"
              >
                <template #suffix>
                  <el-icon class="info-icon"><InfoFilled /></el-icon>
                </template>
              </el-input-number>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- Ảnh sản phẩm -->
        <el-card class="section-card">
          <template #header>
            <span>Ảnh sản phẩm</span>
          </template>
          <el-upload
            v-model:file-list="imageList"
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :on-preview="handlePictureCardPreview"
            :on-remove="handleRemove"
            :limit="10"
          >
            <el-icon><Plus /></el-icon>
            <div class="upload-text">Kéo thả hoặc tải ảnh lên từ thiết bị</div>
          </el-upload>
        </el-card>

        <!-- Khởi tạo kho hàng -->
        <el-card class="section-card">
          <template #header>
            <div class="section-header">
              <span>Khởi tạo kho hàng</span>
              <el-switch v-model="form.initializeInventory" />
            </div>
          </template>
          <p class="section-description">
            Ghi nhận số lượng Tồn kho ban đầu và Giá vốn của sản phẩm tại các Chi nhánh
          </p>
          <!-- Inline form when ON -->
          <div v-if="form.initializeInventory" class="inline-form-section">
            <el-table :data="inventoryInit" style="width: 100%">
              <el-table-column prop="branchName" label="Chi nhánh" min-width="180">
                <template #default="{ row }">
                  {{ row.branchName }}
                </template>
              </el-table-column>
              <el-table-column label="Tồn kho ban đầu" width="150">
                <template #default="{ row }">
                  <el-input-number v-model="row.quantity" :min="0" size="small" style="width: 100%" />
                </template>
              </el-table-column>
              <el-table-column width="150">
                <template #header>
                  <span>Giá vốn</span>
                  <el-tooltip content="Giá vốn trung bình của sản phẩm">
                    <el-icon class="info-icon"><InfoFilled /></el-icon>
                  </el-tooltip>
                </template>
                <template #default="{ row }">
                  <el-input-number v-model="row.costPrice" :min="0" size="small" style="width: 100%" />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>

        <!-- Thuộc tính -->
        <el-card class="section-card">
          <template #header>
            <div class="section-header">
              <span>Thuộc tính</span>
              <el-tooltip content="Tạo các thuộc tính để phân biệt các phiên bản khác nhau của sản phẩm. Ví dụ: Kích thước, Màu sắc, Chất liệu,...">
                <el-icon class="info-icon"><InfoFilled /></el-icon>
              </el-tooltip>
              <el-switch v-model="form.hasAttributes" />
            </div>
          </template>
          <p class="section-description">
            Thêm mới thuộc tính giúp sản phẩm có nhiều lựa chọn, như kích cỡ hay màu sắc
          </p>
          <!-- Inline form when ON -->
          <div v-if="form.hasAttributes" class="inline-form-section">
            <div class="attribute-row-header">
              <span class="col-name">Tên thuộc tính</span>
              <span class="col-values">Giá trị</span>
              <span class="col-action"></span>
            </div>
            <div v-for="(attr, index) in attributes" :key="index" class="attribute-row">
              <el-input 
                v-model="attr.name" 
                placeholder="VD: Kích thước" 
                class="col-name"
              />
              <el-select
                v-model="attr.values"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="Gõ ký tự và ấn Enter để thêm thuộc tính"
                class="col-values"
              />
              <el-button 
                type="danger" 
                :icon="Delete" 
                circle 
                size="small"
                class="col-action"
                @click="removeAttribute(index)"
              />
            </div>
            <el-button type="primary" text @click="addAttribute" class="add-btn">
              <el-icon><Plus /></el-icon> Thêm thuộc tính
            </el-button>
          </div>
        </el-card>

        <!-- Thêm đơn vị quy đổi -->
        <el-card class="section-card">
          <template #header>
            <div class="section-header">
              <span>Thêm đơn vị quy đổi</span>
              <el-tooltip content="Tạo thêm các đơn vị để quản lý sản phẩm. Ví dụ: 1 thùng = 10 chai">
                <el-icon class="info-icon"><InfoFilled /></el-icon>
              </el-tooltip>
              <el-switch v-model="form.hasConversionUnit" />
            </div>
          </template>
          <p class="section-description">
            Tạo và quy đổi các đơn vị tính khác nhau
          </p>
          <!-- Inline form when ON -->
          <div v-if="form.hasConversionUnit" class="inline-form-section">
            <div class="unit-row-header">
              <span class="col-variant">Phiên bản sản phẩm</span>
              <span class="col-unit">Đơn vị quy đổi</span>
              <span class="col-qty">Số lượng</span>
              <span class="col-action"></span>
            </div>
            <div v-for="(unit, index) in conversionUnits" :key="index" class="unit-row">
              <el-select 
                v-model="unit.variantId" 
                placeholder="Tất cả"
                class="col-variant"
              >
                <el-option label="Tất cả" :value="null" />
              </el-select>
              <el-input 
                v-model="unit.unitName" 
                placeholder="Nhập tên đơn vị"
                class="col-unit"
              />
              <el-input-number 
                v-model="unit.quantity" 
                :min="0"
                placeholder="Quy đổi tương ứng"
                class="col-qty"
              />
              <el-button 
                type="danger" 
                :icon="Delete" 
                circle 
                size="small"
                class="col-action"
                @click="removeConversionUnit(index)"
              />
            </div>
            <el-button type="primary" text @click="addConversionUnit" class="add-btn">
              <el-icon><Plus /></el-icon> Thêm đơn vị khác
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- Right Column -->
      <el-col :span="8">
        <!-- Thông tin bổ sung -->
        <el-card class="section-card">
          <template #header>
            <span>Thông tin bổ sung</span>
          </template>
          <el-form :model="form" label-width="120px">
            <el-form-item label="Loại sản phẩm">
              <el-select
                v-model="form.productTypeId"
                placeholder="Chọn loại sản phẩm"
                filterable
                allow-create
                style="width: 100%"
                @visible-change="handleProductTypeVisible"
              >
                <el-option
                  v-for="type in productTypes"
                  :key="type.id"
                  :label="type.name"
                  :value="type.id"
                />
                <template #footer>
                  <el-button type="primary" text @click="showProductTypeDialog = true">
                    + Thêm mới loại sản phẩm
                  </el-button>
                </template>
              </el-select>
            </el-form-item>

            <el-form-item label="Nhãn hiệu">
              <el-select
                v-model="form.brandId"
                placeholder="Chọn nhãn hiệu"
                filterable
                style="width: 100%"
              >
                <template #header>
                  <div class="select-search-header">
                    <el-input
                      v-model="brandSearch"
                      placeholder="Tìm kiếm hoặc nhập mới"
                      size="small"
                      clearable
                    >
                      <template #prefix>
                        <el-icon><Search /></el-icon>
                      </template>
                    </el-input>
                  </div>
                </template>
                <el-option
                  v-for="brand in filteredBrands"
                  :key="brand.id"
                  :label="brand.name"
                  :value="brand.id"
                />
                <template #footer>
                  <el-button type="primary" text @click="showBrandDialog = true">
                    <el-icon><Plus /></el-icon> Thêm mới nhãn hiệu
                  </el-button>
                </template>
              </el-select>
            </el-form-item>

            <el-form-item label="Tags">
              <el-icon class="info-icon"><InfoFilled /></el-icon>
              <el-select
                v-model="form.tags"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="Nhập tags"
                style="width: 100%"
                @visible-change="handleTagsVisible"
              >
                <el-option
                  v-for="tag in suggestedTags"
                  :key="tag"
                  :label="tag"
                  :value="tag"
                />
              </el-select>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- Trạng thái -->
        <el-card class="section-card">
          <template #header>
            <div class="section-header">
              <span>Trạng thái</span>
              <el-icon class="info-icon"><InfoFilled /></el-icon>
            </div>
          </template>
          <div class="toggle-item">
            <span>Cho phép bán</span>
            <el-switch v-model="form.allowSale" />
          </div>
        </el-card>

        <!-- Thuế -->
        <el-card class="section-card">
          <template #header>
            <div class="section-header">
              <span>Thuế</span>
              <el-icon class="info-icon"><InfoFilled /></el-icon>
            </div>
          </template>
          <div class="toggle-item">
            <span>Áp dụng thuế</span>
            <el-switch v-model="form.applyTax" />
          </div>

          <template v-if="form.applyTax">
            <el-form-item label="Giá sản phẩm" style="margin-top: 20px">
              <el-select v-model="form.taxIncluded" style="width: 100%">
                <el-option :label="true" :value="true">Giá đã bao gồm thuế</el-option>
                <el-option :label="false" :value="false">Giá chưa bao gồm thuế</el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="Thuế đầu vào">
              <el-select v-model="form.inputTaxId" placeholder="Chọn thuế" style="width: 100%">
                <el-option
                  v-for="tax in taxes"
                  :key="tax.id"
                  :label="`${tax.name} - ${tax.rate}%`"
                  :value="tax.id"
                />
                <template #footer>
                  <el-button type="primary" text @click="showTaxDialog = true">
                    + Thêm thuế
                  </el-button>
                </template>
              </el-select>
            </el-form-item>

            <el-form-item label="Thuế đầu ra">
              <el-select v-model="form.outputTaxId" placeholder="Chọn thuế" style="width: 100%">
                <el-option
                  v-for="tax in taxes"
                  :key="tax.id"
                  :label="`${tax.name} - ${tax.rate}%`"
                  :value="tax.id"
                />
              </el-select>
            </el-form-item>
          </template>
        </el-card>

        <!-- Cảnh báo lô sắp hết hạn -->
        <el-card v-if="form.managementType === 'batch'" class="section-card">
          <template #header>
            <div class="section-header">
              <span>Cảnh báo lô sắp hết hạn</span>
              <el-icon class="info-icon"><InfoFilled /></el-icon>
            </div>
          </template>
          <div class="toggle-item">
            <span>Bật cảnh báo</span>
            <el-switch v-model="form.expiryWarningEnabled" />
          </div>
        </el-card>
      </el-col>
    </el-row>
    </template>

    <!-- Dialogs -->
    <ProductTypeDialog v-model="showProductTypeDialog" @created="loadProductTypes" />
    <BrandDialog v-model="showBrandDialog" @created="loadBrands" />
    <TaxDialog v-model="showTaxDialog" @created="loadTaxes" />
    <DescriptionDialog v-model="showDescriptionDialog" v-model:description="form.description" />
    <PricePolicyDialog v-model="showPricePolicyDialog" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProductStore } from '@/stores/product.store'
import { productService } from '@/services/product.service'
import { ElMessage } from 'element-plus'
import { ArrowLeft, InfoFilled, Plus, Loading, Delete, Search, Close, Check, Picture } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import ProductTypeDialog from '@/components/product/ProductTypeDialog.vue'
import BrandDialog from '@/components/product/BrandDialog.vue'
import TaxDialog from '@/components/product/TaxDialog.vue'
import DescriptionDialog from '@/components/product/DescriptionDialog.vue'
import PricePolicyDialog from '@/components/product/PricePolicyDialog.vue'
import { useDevice } from '@/composables/useDevice'
import MobileProductCreate from '@/components/mobile/MobileProductCreate.vue'

const { isMobile } = useDevice()

// Mobile helper
function triggerImageUpload() {
  // Trigger file input
}

const props = defineProps<{
  isEdit?: boolean
  productId?: number
}>()

const router = useRouter()
const route = useRoute()
const productStore = useProductStore()
const formRef = ref<FormInstance>()

// Detect edit mode from route
const isEditMode = computed(() => {
  // Check props first
  if (props.isEdit) return true
  
  // Check route name
  if (route.name === 'ProductEdit') return true
  
  // Check route path contains /edit
  if (route.path.includes('/edit')) return true
  
  // Check if we have an ID in params (for edit view)
  const routeId = route.params.id
  if (routeId && route.path.includes('/edit')) return true
  
  return false
})

// Get product ID from route or props
const currentProductId = computed(() => {
  // Priority 1: Props
  if (props.productId) return props.productId
  
  // Priority 2: Route params
  const routeId = route.params.id
  if (routeId) {
    const id = parseInt(String(routeId))
    if (!isNaN(id) && id > 0) return id
  }
  
  return 0
})

const form = reactive({
  name: '',
  sku: '',
  barcode: '',
  weight: null as number | null,
  weightUnit: 'g',
  unit: '',
  description: '',
  managementType: 'normal' as 'normal' | 'batch',
  retailPrice: 0,
  wholesalePrice: 0,
  importPrice: 0,
  allowSale: true,
  applyTax: false,
  taxIncluded: false,
  inputTaxId: null as number | null,
  outputTaxId: null as number | null,
  expiryWarningEnabled: false,
  productTypeId: null as number | null,
  brandId: null as number | null,
  tags: [] as string[],
  initializeInventory: false,
  hasAttributes: false,
  hasConversionUnit: false,
})

const imageList = ref<UploadFile[]>([])
const productTypes = ref<any[]>([])
const brands = ref<any[]>([])
const taxes = ref<any[]>([])
const suggestedTags = ref<string[]>([
  '#kênh_sàn_TMĐT',
  '#Shopee_UA9',
  '#Shopee',
  '#công_cụ_khởi_tạo_sản_phẩm',
])

const showProductTypeDialog = ref(false)
const showBrandDialog = ref(false)
const showTaxDialog = ref(false)
const showDescriptionDialog = ref(false)
const showPricePolicyDialog = ref(false)

// Search filters
const brandSearch = ref('')
const filteredBrands = computed(() => {
  if (!brandSearch.value) return brands.value
  const search = brandSearch.value.toLowerCase()
  return brands.value.filter((b: any) => b.name.toLowerCase().includes(search))
})

// Inventory initialization
const inventoryInit = ref([
  { branchId: 1, branchName: 'Chi nhánh mặc định', quantity: 0, costPrice: 0 }
])

// Attributes for product variants
const attributes = ref<Array<{ name: string; values: string[] }>>([
  { name: '', values: [] }
])

// Conversion units
const conversionUnits = ref<Array<{ variantId: number | null; unitName: string; quantity: number }>>([
  { variantId: null, unitName: '', quantity: 0 }
])

function addAttribute() {
  attributes.value.push({ name: '', values: [] })
}

function removeAttribute(index: number) {
  if (attributes.value.length > 1) {
    attributes.value.splice(index, 1)
  }
}

function addConversionUnit() {
  conversionUnits.value.push({ variantId: null, unitName: '', quantity: 0 })
}

function removeConversionUnit(index: number) {
  if (conversionUnits.value.length > 1) {
    conversionUnits.value.splice(index, 1)
  }
}

const rules: FormRules = {
  name: [{ required: true, message: 'Vui lòng nhập tên sản phẩm', trigger: 'blur' }],
  retailPrice: [{ required: true, message: 'Vui lòng nhập giá bán lẻ', trigger: 'blur' }],
  barcode: [
    { min: 3, max: 15, message: 'Mã vạch phải có từ 3-15 ký tự', trigger: 'blur' },
  ],
}

onMounted(async () => {
  // Load dropdown data first (await all)
  await Promise.all([
    loadProductTypes(),
    loadBrands(),
    loadTaxes()
  ])
  
  // Wait for route to be fully resolved
  await router.isReady()
  
  // Check if edit mode
  if (isEditMode.value && currentProductId.value > 0) {
    console.log('[ProductCreateView] Edit mode detected, product ID:', currentProductId.value)
    console.log('[ProductCreateView] Route:', route.name, route.path, route.params)
    await loadProductData()
  } else {
    console.log('[ProductCreateView] Create mode')
  }
})

async function loadProductData() {
  const productId = currentProductId.value
  
  if (!productId || productId === 0) {
    console.error('[loadProductData] Invalid product ID:', productId)
    ElMessage.error('Không tìm thấy ID sản phẩm')
    router.push('/products')
    return
  }
  
  console.log('[loadProductData] Loading product ID:', productId)
  
  try {
    productStore.loading = true
    
    // Fetch product from API
    await productStore.fetchProductById(productId)
    const product = productStore.currentProduct
    
    if (!product) {
      console.error('[loadProductData] Product not found')
      ElMessage.error('Không tìm thấy sản phẩm')
      router.push('/products')
      return
    }
    
    console.log('[loadProductData] Product loaded:', product)
    
    // Populate form with product data
    form.name = product.name || ''
    form.sku = product.sku || ''
    form.barcode = product.barcode || ''
    form.weight = product.weight || null
    form.weightUnit = product.weightUnit || 'g'
    form.unit = product.unit || ''
    form.description = product.description || ''
    form.managementType = (product.managementType as 'normal' | 'batch') || 'normal'
    form.retailPrice = product.retailPrice || 0
    form.wholesalePrice = product.wholesalePrice || 0
    form.importPrice = product.importPrice || 0
    form.allowSale = product.allowSale !== undefined ? product.allowSale : true
    form.applyTax = product.applyTax || false
    form.taxIncluded = product.taxIncluded || false
    form.inputTaxId = product.inputTaxId || null
    form.outputTaxId = product.outputTaxId || null
    form.expiryWarningEnabled = product.expiryWarningEnabled || false
    form.productTypeId = product.productTypeId || null
    form.brandId = product.brandId || null
    form.tags = product.tags || []
    
    console.log('[loadProductData] Form populated:', form)
    
    // Load images if available
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      imageList.value = product.images.map((img: any, index: number) => ({
        uid: img.id || `img-${index}-${Date.now()}`,
        name: img.url || `image-${index}`,
        url: img.url,
      }))
      console.log('[loadProductData] Images loaded:', imageList.value.length)
    } else {
      imageList.value = []
    }
    
    ElMessage.success('Đã tải thông tin sản phẩm')
  } catch (error: any) {
    console.error('[loadProductData] Error:', error)
    const errorMessage = error.response?.data?.error?.message || 
                        error.message || 
                        'Không thể tải thông tin sản phẩm'
    ElMessage.error(errorMessage)
    router.push('/products')
  } finally {
    productStore.loading = false
  }
}

async function loadProductTypes() {
  try {
    const response = await productService.getProductTypes()
    productTypes.value = response.data || []
  } catch (error: any) {
    console.error('Error loading product types:', error)
    ElMessage.error('Không thể tải danh sách loại sản phẩm')
    productTypes.value = []
  }
}

async function loadBrands() {
  try {
    const response = await productService.getBrands()
    brands.value = response.data || []
  } catch (error: any) {
    console.error('Error loading brands:', error)
    brands.value = []
  }
}

async function loadTaxes() {
  try {
    const response = await productService.getTaxes()
    taxes.value = response.data || []
  } catch (error: any) {
    console.error('Error loading taxes:', error)
    taxes.value = [
      { id: 1, name: 'Không áp dụng thuế', rate: 0 },
      { id: 2, name: 'VAT', rate: 10 },
    ]
  }
}

function handleProductTypeVisible(visible: boolean) {
  if (visible) {
    loadProductTypes()
  }
}

function handleTagsVisible(visible: boolean) {
  if (visible) {
    // Load suggested tags
  }
}

function handlePictureCardPreview(file: UploadFile) {
  // Preview image
}

function handleRemove(file: UploadFile) {
  const index = imageList.value.findIndex((item) => item.uid === file.uid)
  if (index > -1) {
    imageList.value.splice(index, 1)
  }
}

async function handleSubmit() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // Transform form data to match DTO format
        const productData: any = {
          name: form.name,
          managementType: form.managementType,
          retailPrice: form.retailPrice,
          sku: form.sku || undefined,
          barcode: form.barcode || undefined,
          weight: form.weight || undefined,
          weightUnit: form.weightUnit || undefined,
          unit: form.unit || undefined,
          description: form.description || undefined,
          wholesalePrice: form.wholesalePrice || undefined,
          importPrice: form.importPrice || undefined,
          allowSale: form.allowSale,
          applyTax: form.applyTax,
          productTypeId: form.productTypeId || undefined,
          brandId: form.brandId || undefined,
          tags: form.tags && form.tags.length > 0 ? form.tags : undefined,
        }

        // Handle images - upload files to server and get URLs
        if (imageList.value && imageList.value.length > 0) {
          // Upload new files and get URLs, or use existing URLs
          const imagePromises = imageList.value.map(async (file: UploadFile) => {
            try {
              // If file has URL (already uploaded), use it (skip blob and data URLs)
              if (file.url && !file.url.startsWith('blob:') && !file.url.startsWith('data:')) {
                // Validate URL format
                try {
                  new URL(file.url)
                  return {
                    url: file.url,
                    sortOrder: 0,
                  }
                } catch {
                  // Invalid URL, skip
                  return {
                    url: '',
                    sortOrder: 0,
                  }
                }
              }
              
              // If file is new (has raw File object), upload to server
              if (file.raw) {
                // Validate file size (5MB limit)
                const MAX_SIZE = 5 * 1024 * 1024 // 5MB
                if (file.raw.size > MAX_SIZE) {
                  ElMessage.warning(`File "${file.name}" quá lớn (>5MB), vui lòng chọn file nhỏ hơn`)
                  return {
                    url: '',
                    sortOrder: 0,
                  }
                }
                
                // Validate file type
                if (!file.raw.type.startsWith('image/')) {
                  ElMessage.warning(`File "${file.name}" không phải là hình ảnh`)
                  return {
                    url: '',
                    sortOrder: 0,
                  }
                }
                
                // Upload file to server
                try {
                  const { uploadService } = await import('@/services/upload.service')
                  const uploadResult = await uploadService.uploadImage(file.raw)
                  
                  if (uploadResult.success && uploadResult.data.url) {
                    const serverUrl = uploadResult.data.url
                    // Clean URL: remove any control characters and ensure valid URL format
                    // Use encodeURI to ensure URL is safe for DOM operations
                    let cleanUrl = String(serverUrl)
                      .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
                      .trim()
                    
                    // Ensure URL starts with / (relative path)
                    if (!cleanUrl.startsWith('/') && !cleanUrl.startsWith('http')) {
                      cleanUrl = '/' + cleanUrl
                    }
                    
                    // Validate URL format (should be a simple path like /uploads/images/file.jpg)
                    if (!/^\/[a-zA-Z0-9\/._-]+$/.test(cleanUrl)) {
                      console.warn('[Image Upload] Invalid URL format, cleaning:', cleanUrl)
                      // Extract only valid path characters
                      cleanUrl = cleanUrl.replace(/[^a-zA-Z0-9\/._-]/g, '')
                      if (!cleanUrl.startsWith('/')) {
                        cleanUrl = '/' + cleanUrl
                      }
                    }
                    
                    console.log(`[Image Upload] Successfully uploaded: ${file.name} -> ${cleanUrl}`)
                    
                    // DON'T update imageList.value here to avoid DOMException
                    // The URL will be used in productData.images and saved to DB
                    // After successful save, the page will reload and images will load from DB
                    
                    return {
                      url: cleanUrl, // Clean, validated server URL
                      sortOrder: 0,
                    }
                  } else {
                    throw new Error('Upload failed: No URL returned')
                  }
                } catch (uploadError: any) {
                  console.error('[Image Upload] Upload error:', uploadError)
                  ElMessage.error(`Không thể upload file "${file.name}": ${uploadError.response?.data?.error?.message || uploadError.message || 'Lỗi không xác định'}`)
                  
                  return {
                    url: '',
                    sortOrder: 0,
                  }
                }
              }
              
              // Fallback: use existing URL or empty
              return {
                url: file.url || '',
                sortOrder: 0,
              }
            } catch (error: any) {
              console.error('Error processing image:', error)
              ElMessage.warning(`Lỗi khi xử lý hình ảnh: ${file.name || 'unknown'}`)
              return {
                url: '',
                sortOrder: 0,
              }
            }
          })
          
          const images = await Promise.all(imagePromises)
          // Filter out empty URLs
          const validImages = images.filter((img: any) => img.url && img.url.length > 0)
          
          if (validImages.length > 0) {
            // Validate and clean image URLs before adding to productData
            const cleanedImages = validImages.map((img: any) => {
              // Ensure URL is a valid string
              let url = String(img.url || '').trim()
              
              // Remove control characters
              url = url.replace(/[\x00-\x1F\x7F-\x9F]/g, '')
              
              // Validate URL format (should be a simple path)
              if (!/^\/[a-zA-Z0-9\/._-]+$/.test(url)) {
                console.warn('[Image Upload] Invalid URL format, cleaning:', url)
                // Extract only valid path characters
                url = url.replace(/[^a-zA-Z0-9\/._-]/g, '')
                if (!url.startsWith('/')) {
                  url = '/' + url
                }
              }
              
              return {
                url: url,
                sortOrder: img.sortOrder || 0,
              }
            }).filter((img: any) => img.url && img.url.length > 0 && img.url.startsWith('/'))
            
            // Test JSON serialization before assigning
            try {
              const testSerialize = JSON.stringify({ images: cleanedImages })
              console.log(`[Image Upload] Successfully prepared ${cleanedImages.length} images, JSON size: ${testSerialize.length} bytes`)
              productData.images = cleanedImages
            } catch (serializeError: any) {
              console.error('[Image Upload] JSON serialization error:', serializeError)
              ElMessage.error('Không thể xử lý hình ảnh. Vui lòng thử lại.')
              return // Stop submission
            }
          } else {
            productData.images = []
          }
        } else {
          // If no images, set empty array to clear existing images
          productData.images = []
        }

        // Remove undefined/null/empty fields (but keep images array even if empty)
        Object.keys(productData).forEach(key => {
          // Keep images array even if empty (to clear existing images)
          if (key === 'images') {
            return
          }
          if (productData[key] === undefined || productData[key] === null || productData[key] === '') {
            delete productData[key]
          }
        })

        // Final validation: Test JSON serialization of entire productData
        try {
          const finalTest = JSON.stringify(productData)
          console.log(`[Product Submit] Final data size: ${finalTest.length} bytes`)
          console.log(`[Product Submit] Images count: ${productData.images?.length || 0}`)
          if (productData.images && productData.images.length > 0) {
            console.log(`[Product Submit] Image URLs:`, productData.images.map((img: any) => img.url))
          }
        } catch (finalError: any) {
          console.error('[Product Submit] Final JSON serialization error:', finalError)
          ElMessage.error('Dữ liệu sản phẩm không hợp lệ. Vui lòng kiểm tra lại.')
          return // Stop submission
        }

        // Submit product data
        // Wrap in try-catch to handle DOMException (may occur in Vue/Element Plus rendering)
        try {
          if (isEditMode.value) {
            console.log(`[Product Submit] Updating product ${currentProductId.value} with images:`, productData.images?.length || 0)
            
            // Call API directly to avoid DOM manipulation in store
            const { productService } = await import('@/services/product.service')
            const updatedProduct = await productService.updateProduct(currentProductId.value, productData)
            
            console.log('[Product Submit] Update successful, product:', updatedProduct)
            ElMessage.success('Cập nhật sản phẩm thành công')
            
            // Redirect after a short delay to allow request to complete
            setTimeout(() => {
              window.location.href = `/products/${currentProductId.value}?created=false&t=${Date.now()}`
            }, 500)
          } else {
            console.log(`[Product Submit] Creating product with images:`, productData.images?.length || 0)
            
            // Call API directly to avoid DOM manipulation in store
            const { productService } = await import('@/services/product.service')
            const newProduct = await productService.createProduct(productData)
            
            console.log('[Product Submit] Create successful, product:', newProduct)
            
            // Initialize inventory if enabled
            if (form.initializeInventory && inventoryInit.value.length > 0) {
              try {
                const { inventoryService } = await import('@/services/inventory.service')
                await inventoryService.initializeInventory(newProduct.id, {
                  branchId: inventoryInit.value[0].branchId,
                  branchName: inventoryInit.value[0].branchName,
                  quantity: inventoryInit.value[0].quantity,
                  costPrice: inventoryInit.value[0].costPrice || productData.importPrice || 0,
                })
                console.log('[Product Submit] Inventory initialized')
              } catch (invError) {
                console.error('[Product Submit] Inventory init failed:', invError)
                // Don't fail the whole process
              }
            }
            
            ElMessage.success('Tạo sản phẩm thành công')
            
            // Redirect after a short delay
            setTimeout(() => {
              window.location.href = '/products'
            }, 500)
          }
        } catch (submitError: any) {
          // Check if it's DOMException (non-critical, request may have succeeded)
          if (submitError.name === 'DOMException' && submitError.message.includes('invalid character')) {
            console.warn('[Product Submit] DOMException occurred (non-critical):', submitError)
            // Assume request succeeded and redirect anyway
            ElMessage.warning('Đã lưu sản phẩm, đang tải lại trang...')
            setTimeout(() => {
              if (isEditMode.value) {
                window.location.href = `/products/${currentProductId.value}?created=false&t=${Date.now()}`
              } else {
                window.location.href = '/products'
              }
            }, 1000)
          } else {
            // Real error - show to user
            console.error('[Product Submit] Error:', submitError)
            const errorMessage = submitError.response?.data?.error?.message || 
                               submitError.response?.data?.message || 
                               submitError.message || 
                               (isEditMode.value ? 'Cập nhật sản phẩm thất bại' : 'Tạo sản phẩm thất bại')
            ElMessage.error(errorMessage)
          }
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.error?.message || 
                           error.response?.data?.message || 
                           (Array.isArray(error.response?.data?.message) 
                             ? error.response.data.message.join(', ') 
                             : 'Lỗi không xác định')
        ElMessage.error(errorMessage || (isEditMode.value ? 'Cập nhật sản phẩm thất bại' : 'Tạo sản phẩm thất bại'))
        console.error('Product error:', error)
      }
    }
  })
}

function handleSaveAndPrint() {
  handleSubmit()
  // TODO: Print barcode after save
}

function goBack() {
  if (isEditMode.value && currentProductId.value > 0) {
    router.push(`/products/${currentProductId.value}`)
  } else {
    router.push('/products')
  }
}
</script>

<style scoped lang="scss">
.product-create {
  background: #f5f7fa;
  min-height: 100%;
  
  .page-header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 24px;
    background: #fff;
    border-bottom: 1px solid #e4e7ed;
    
    .header-left {
      .back-link {
        color: #606266;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 4px;
        
        &:hover {
          color: #409eff;
        }
        
        .el-icon {
          font-size: 16px;
        }
      }
    }
    
    .header-right {
      display: flex;
      gap: 12px;
    }
  }
  
  .product-title-bar {
    padding: 16px 24px;
    background: #fff;
    border-bottom: 1px solid #e4e7ed;
    
    .product-name {
      margin: 0 0 4px 0;
      font-size: 20px;
      font-weight: 600;
      color: #303133;
    }
    
    .product-type {
      margin: 0;
      font-size: 13px;
      color: #909399;
    }
  }

  // Form content wrapper
  :deep(.el-row) {
    padding: 20px 24px;
  }

  .section-card {
    margin-bottom: 16px;
    border-radius: 8px;

    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;

      .info-icon {
        color: #409eff;
        cursor: help;
      }
    }

    .settings-link {
      margin-left: 20px;
    }

    .section-description {
      color: #909399;
      font-size: 14px;
      margin: 10px 0 0 0;
    }

    .toggle-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .upload-text {
    margin-top: 8px;
    color: #909399;
    font-size: 12px;
  }

  // Inline form section
  .inline-form-section {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #ebeef5;

    // Attribute rows
    .attribute-row-header,
    .unit-row-header {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
      font-weight: 500;
      color: #606266;
      font-size: 14px;
    }

    .attribute-row,
    .unit-row {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
      align-items: center;
    }

    .col-name {
      flex: 0 0 200px;
    }

    .col-values {
      flex: 1;
    }

    .col-variant {
      flex: 0 0 180px;
    }

    .col-unit {
      flex: 1;
    }

    .col-qty {
      flex: 0 0 150px;
    }

    .col-action {
      flex: 0 0 40px;
      display: flex;
      justify-content: center;
    }

    .add-btn {
      margin-top: 8px;
    }
  }

  // Select search header
  .select-search-header {
    padding: 8px;
    border-bottom: 1px solid #ebeef5;
  }
}
</style>
