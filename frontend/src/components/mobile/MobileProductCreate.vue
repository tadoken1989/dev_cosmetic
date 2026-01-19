<template>
  <div class="mobile-product-create">
    <!-- Header -->
    <div class="mobile-header">
      <div class="header-left" @click="goBack">
        <el-icon><Close /></el-icon>
      </div>
      <div class="page-title">{{ isEditMode ? 'Sửa sản phẩm' : 'Thêm sản phẩm' }}</div>
      <div class="header-right" @click="handleSubmit">
        <el-icon><Check /></el-icon>
      </div>
    </div>

    <!-- Content -->
    <div class="mobile-content">
      <!-- Image Upload Section -->
      <div class="image-section">
        <div class="images-grid">
          <!-- Existing images -->
          <div 
            v-for="(img, idx) in productImages" 
            :key="idx" 
            class="image-item"
          >
            <img :src="img.url" class="preview-img" />
            <el-icon class="delete-icon" @click.stop="removeImage(idx)"><Close /></el-icon>
          </div>
          <!-- Add button -->
          <div class="image-item add-btn" @click="triggerImageUpload">
            <el-icon :size="24"><Plus /></el-icon>
            <span>Thêm ảnh</span>
          </div>
        </div>
        <input type="file" ref="imageInput" accept="image/*" multiple @change="handleImageChange" style="display: none" />
      </div>

      <!-- Basic Info Card -->
      <div class="form-card">
        <div class="form-item">
          <el-input v-model="form.name" placeholder="Tên sản phẩm" class="form-input" />
        </div>
        <div class="form-item with-suffix">
          <el-input v-model="form.sku" placeholder="Mã sản phẩm / SKU" class="form-input">
            <template #suffix>
              <el-icon class="barcode-icon" @click="scanBarcode"><Scan /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="form-item with-suffix">
          <el-input v-model="form.barcode" placeholder="Barcode" class="form-input">
            <template #suffix>
              <el-icon class="barcode-icon" @click="scanBarcode"><Scan /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="form-item">
          <div class="item-label">Phân loại sản phẩm</div>
          <el-radio-group v-model="form.managementType" class="radio-group">
            <el-radio label="normal">Thường</el-radio>
            <el-radio label="batch">Lô - HSD</el-radio>
          </el-radio-group>
        </div>
        <div class="form-row">
          <div class="form-item half">
            <div class="item-label">Khối lượng (g)</div>
            <el-input v-model.number="form.weight" type="number" placeholder="0" />
          </div>
          <div class="form-item half">
            <div class="item-label">Đơn vị tính</div>
            <el-input v-model="form.unit" placeholder="Đơn vị tính" />
          </div>
        </div>
      </div>

      <!-- Price Card -->
      <div class="form-card collapsible" :class="{ collapsed: priceCollapsed }">
        <div class="card-header" @click="priceCollapsed = !priceCollapsed">
          <div class="header-left">
            <el-icon class="card-icon"><PriceTag /></el-icon>
            <span class="card-title">Giá sản phẩm</span>
          </div>
          <div class="header-right">
            <span class="tax-label">Áp dụng thuế</span>
            <el-switch v-model="form.applyTax" @click.stop />
          </div>
        </div>
        <div class="card-body">
          <div class="form-row">
            <div class="form-item half">
              <div class="item-label">Giá bán lẻ</div>
              <el-input v-model.number="form.retailPrice" type="number" placeholder="0" />
            </div>
            <div class="form-item half">
              <div class="item-label">Giá bán buôn</div>
              <el-input v-model.number="form.wholesalePrice" type="number" placeholder="0" />
            </div>
          </div>
          <div class="form-item">
            <div class="item-label">Giá nhập</div>
            <el-input v-model.number="form.importPrice" type="number" placeholder="0" />
          </div>
        </div>
        <div class="collapse-toggle" @click="priceCollapsed = !priceCollapsed">
          <el-icon :class="{ rotated: !priceCollapsed }"><ArrowUp /></el-icon>
        </div>
      </div>

      <!-- Inventory Card -->
      <div class="form-card">
        <div class="card-header">
          <div class="header-left">
            <el-icon class="card-icon"><House /></el-icon>
            <span class="card-title">Kho hàng</span>
            <el-icon class="info-icon" color="#409eff"><InfoFilled /></el-icon>
          </div>
        </div>
        <div class="card-body">
          <div class="branch-name">Chi nhánh mặc định</div>
          <div class="form-row">
            <div class="form-item half">
              <div class="item-label">Tồn kho ban đầu</div>
              <el-input v-model.number="inventoryInit.quantity" type="number" placeholder="0" />
            </div>
            <div class="form-item half">
              <div class="item-label">Giá vốn</div>
              <el-input v-model.number="inventoryInit.costPrice" type="number" placeholder="0" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-item half">
              <div class="item-label">Tồn kho tối đa</div>
              <el-input v-model.number="inventoryInit.maxStock" type="number" placeholder="" />
            </div>
            <div class="form-item half">
              <div class="item-label">Tồn kho tối thiểu</div>
              <el-input v-model.number="inventoryInit.minStock" type="number" placeholder="" />
            </div>
          </div>
        </div>
      </div>

      <!-- Attributes Section -->
      <div class="form-card section-card">
        <div class="section-row" @click="showAttributeDialog = true">
          <div class="section-left">
            <span class="section-title">Thuộc tính</span>
            <el-icon class="info-icon" color="#409eff"><InfoFilled /></el-icon>
          </div>
          <el-icon class="add-icon" color="#409eff"><CirclePlus /></el-icon>
        </div>
      </div>

      <!-- Conversion Unit Section -->
      <div class="form-card section-card">
        <div class="section-row" @click="showConversionDialog = true">
          <div class="section-left">
            <span class="section-title">Đơn vị quy đổi</span>
            <el-icon class="info-icon" color="#409eff"><InfoFilled /></el-icon>
          </div>
          <el-icon class="add-icon" color="#409eff"><CirclePlus /></el-icon>
        </div>
      </div>

      <!-- Additional Info Section -->
      <div class="form-card section-card expandable" :class="{ expanded: additionalExpanded }">
        <div class="section-row" @click="additionalExpanded = !additionalExpanded">
          <div class="section-left">
            <span class="section-title">Thông tin thêm</span>
            <span class="section-subtitle">Mô tả, phân loại sản phẩm</span>
          </div>
          <el-icon :class="{ rotated: additionalExpanded }"><ArrowDown /></el-icon>
        </div>
        
        <div class="expanded-content" v-show="additionalExpanded">
          <div class="nav-item" @click="showProductTypeSelector = true">
            <span>Loại sản phẩm</span>
            <div class="nav-right">
              <span class="selected-value">{{ getProductTypeName() }}</span>
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
          <div class="nav-item" @click="showBrandSelector = true">
            <span>Nhãn hiệu</span>
            <div class="nav-right">
              <span class="selected-value">{{ getBrandName() }}</span>
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
          <div class="nav-item" @click="showDescriptionDialog = true">
            <span>Mô tả</span>
            <div class="nav-right">
              <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
          <div class="toggle-item">
            <span>Cho phép bán</span>
            <el-switch v-model="form.allowSale" />
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Button -->
    <div class="bottom-actions">
      <el-button type="primary" class="save-btn" @click="handleSubmit" :loading="submitting">
        Lưu
      </el-button>
    </div>

    <!-- Attribute Dialog -->
    <el-dialog v-model="showAttributeDialog" title="Thêm thuộc tính" width="90%" center>
      <div class="dialog-form">
        <div class="form-item">
          <div class="item-label">Tên thuộc tính</div>
          <el-input v-model="newAttribute.name" placeholder="Kích thước" />
        </div>
        <div class="form-item">
          <div class="item-label">Giá trị thuộc tính</div>
          <el-input v-model="newAttribute.values" placeholder="Giá trị được cách nhau bằng dấu phẩy hoặc enter" />
          <div class="input-hint">Giá trị được cách nhau bằng dấu phẩy hoặc enter</div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showAttributeDialog = false">Thoát</el-button>
        <el-button type="primary" @click="addAttribute">Thêm</el-button>
      </template>
    </el-dialog>

    <!-- Conversion Unit Dialog -->
    <el-dialog v-model="showConversionDialog" title="Thêm đơn vị quy đổi" width="90%" center>
      <div class="dialog-form">
        <div class="form-item">
          <div class="item-label">Tên đơn vị quy đổi</div>
          <el-input v-model="newConversion.name" placeholder="Tên đơn vị quy đổi" />
        </div>
        <div class="form-item">
          <div class="item-label">Số lượng</div>
          <el-input v-model.number="newConversion.quantity" type="number" placeholder="Số lượng" />
        </div>
      </div>
      <template #footer>
        <el-button @click="showConversionDialog = false">Thoát</el-button>
        <el-button type="primary" @click="addConversion">Thêm</el-button>
      </template>
    </el-dialog>

    <!-- Description Dialog -->
    <el-dialog v-model="showDescriptionDialog" title="Mô tả sản phẩm" width="90%">
      <el-input 
        v-model="form.description" 
        type="textarea" 
        :rows="6" 
        placeholder="Nhập mô tả sản phẩm" 
      />
      <template #footer>
        <el-button type="primary" @click="showDescriptionDialog = false">Xong</el-button>
      </template>
    </el-dialog>

    <!-- Product Type Selector -->
    <div class="selector-page" v-if="showProductTypeSelector">
      <div class="selector-header">
        <el-icon @click="showProductTypeSelector = false"><ArrowLeft /></el-icon>
        <span>Loại sản phẩm</span>
        <el-icon @click="showAddProductType = true"><Plus /></el-icon>
        <el-icon @click="productTypeSearch = ''"><Search /></el-icon>
      </div>
      <div class="selector-search" v-if="productTypeSearch !== null">
        <el-input v-model="productTypeSearch" placeholder="Tìm kiếm" clearable />
      </div>
      <div class="selector-list">
        <div 
          class="selector-item" 
          v-for="type in filteredProductTypes" 
          :key="type.id"
          :class="{ active: form.productTypeId === type.id }"
          @click="selectProductType(type)"
        >
          {{ type.name }}
        </div>
      </div>

      <!-- Add Product Type Dialog -->
      <el-dialog v-model="showAddProductType" title="Thêm loại sản phẩm" width="90%" center>
        <el-input v-model="newProductTypeName" type="textarea" :rows="4" placeholder="Nhập tên loại sản phẩm" />
        <template #footer>
          <el-button @click="showAddProductType = false">Thoát</el-button>
          <el-button type="primary" @click="createProductType">Thêm</el-button>
        </template>
      </el-dialog>
    </div>

    <!-- Brand Selector -->
    <div class="selector-page" v-if="showBrandSelector">
      <div class="selector-header">
        <el-icon @click="showBrandSelector = false"><ArrowLeft /></el-icon>
        <span>Nhãn hiệu</span>
        <el-icon @click="showAddBrand = true"><Plus /></el-icon>
        <el-icon><Search /></el-icon>
      </div>
      <div class="selector-list">
        <div 
          class="selector-item" 
          v-for="brand in brands" 
          :key="brand.id"
          :class="{ active: form.brandId === brand.id }"
          @click="selectBrand(brand)"
        >
          {{ brand.name }}
        </div>
      </div>

      <!-- Add Brand Dialog -->
      <el-dialog v-model="showAddBrand" title="Thêm nhãn hiệu" width="90%" center>
        <el-input v-model="newBrandName" placeholder="Nhập tên nhãn hiệu" />
        <template #footer>
          <el-button @click="showAddBrand = false">Thoát</el-button>
          <el-button type="primary" @click="createBrand">Thêm</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Close, Check, Plus, ArrowLeft, ArrowRight, ArrowDown, ArrowUp, Search,
  InfoFilled, CirclePlus, House
} from '@element-plus/icons-vue'
import { productService } from '@/services/product.service'
import { uploadService } from '@/services/upload.service'
import { inventoryService } from '@/services/inventory.service'

// Custom icons
const PictureFilled = { template: `<svg viewBox="0 0 1024 1024" fill="currentColor"><path d="M928 160H96c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h832c17.7 0 32-14.3 32-32V192c0-17.7-14.3-32-32-32zm-40 632H136v-39.9l138.5-164.3 150.1 178L658.1 489 888 761.6V792zm0-129.8L664.2 396.8c-3.2-3.8-9-3.8-12.2 0L424.6 666.4l-144-170.7c-3.2-3.8-9-3.8-12.2 0L136 652.7V232h752v430.2z"/><path d="M304 456a88 88 0 1 0 0-176 88 88 0 0 0 0 176z"/></svg>` }
const PriceTag = { template: `<svg viewBox="0 0 1024 1024" fill="currentColor"><path d="M938.2 468.2L575.8 105.8A63.9 63.9 0 0 0 530.3 86H144c-17.7 0-32 14.3-32 32v386.3c0 17-.6 33.3 11.8 45.3l362.4 362.4a64 64 0 0 0 90.5 0l361.5-361.5a64 64 0 0 0 0-90.5zM484.4 880.5L126.1 522V150h372v.1L860.3 512l-375.9 368.5zM304 352a88 88 0 1 0 0-176 88 88 0 0 0 0 176z"/></svg>` }
const Scan = { template: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h2v12H4zm3 0h1v12H7zm2 0h3v12H9zm4 0h1v12h-1zm3 0h2v12h-2zm3 0h1v12h-1z"/></svg>` }

const router = useRouter()
const route = useRoute()

const imageInput = ref<HTMLInputElement>()
const submitting = ref(false)
const productTypes = ref<any[]>([])
const brands = ref<any[]>([])

const isEditMode = computed(() => !!route.params.id)

// Collapse states
const priceCollapsed = ref(false)
const additionalExpanded = ref(false)

// Dialog states
const showAttributeDialog = ref(false)
const showConversionDialog = ref(false)
const showDescriptionDialog = ref(false)
const showProductTypeSelector = ref(false)
const showBrandSelector = ref(false)
const showAddProductType = ref(false)
const showAddBrand = ref(false)

// Search
const productTypeSearch = ref('')

// New item forms
const newAttribute = reactive({ name: '', values: '' })
const newConversion = reactive({ name: '', quantity: 0 })
const newProductTypeName = ref('')
const newBrandName = ref('')

// Added attributes and conversions
const attributes = ref<Array<{ name: string; values: string[] }>>([])
const conversions = ref<Array<{ name: string; quantity: number }>>([])

// Images array for multiple image support
const productImages = ref<Array<{ url: string; sortOrder?: number }>>([])
const uploadingImage = ref(false)

// Form data
const form = reactive({
  name: '',
  sku: '',
  barcode: '',
  productTypeId: null as number | null,
  brandId: null as number | null,
  managementType: 'normal' as 'normal' | 'batch',
  retailPrice: 0,
  wholesalePrice: 0,
  importPrice: 0,
  weight: null as number | null,
  unit: '',
  description: '',
  imageUrl: '',
  allowSale: true,
  applyTax: false
})

// Inventory initialization
const inventoryInit = reactive({
  branchId: 1,
  branchName: 'Chi nhánh mặc định',
  quantity: 0,
  costPrice: 0,
  maxStock: null as number | null,
  minStock: null as number | null
})

// Computed
const filteredProductTypes = computed(() => {
  if (!productTypeSearch.value) return productTypes.value
  const search = productTypeSearch.value.toLowerCase()
  return productTypes.value.filter(t => t.name.toLowerCase().includes(search))
})

function getProductTypeName() {
  if (!form.productTypeId) return ''
  const type = productTypes.value.find(t => t.id === form.productTypeId)
  return type?.name || ''
}

function getBrandName() {
  if (!form.brandId) return ''
  const brand = brands.value.find(b => b.id === form.brandId)
  return brand?.name || ''
}

function goBack() {
  router.back()
}

function triggerImageUpload() {
  imageInput.value?.click()
}

function scanBarcode() {
  ElMessage.info('Quét mã vạch...')
}

async function handleImageChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files || files.length === 0) return

  uploadingImage.value = true
  try {
    for (const file of Array.from(files)) {
      const result = await uploadService.uploadImage(file)
      if (result.success && result.data?.url) {
        productImages.value.push({
          url: result.data.url,
          sortOrder: productImages.value.length
        })
        // Also set first image as main
        if (!form.imageUrl) {
          form.imageUrl = result.data.url
        }
      }
    }
    ElMessage.success(`Đã upload ${files.length} ảnh`)
  } catch (error) {
    console.error('Upload error:', error)
    ElMessage.error('Lỗi upload ảnh')
  } finally {
    uploadingImage.value = false
    // Reset input
    if (imageInput.value) {
      imageInput.value.value = ''
    }
  }
}

function removeImage(index: number) {
  const removedUrl = productImages.value[index]?.url
  productImages.value.splice(index, 1)
  
  // Update main image if needed
  if (form.imageUrl === removedUrl) {
    form.imageUrl = productImages.value[0]?.url || ''
  }
}

function selectProductType(type: any) {
  form.productTypeId = type.id
  showProductTypeSelector.value = false
}

function selectBrand(brand: any) {
  form.brandId = brand.id
  showBrandSelector.value = false
}

function addAttribute() {
  if (newAttribute.name) {
    const values = newAttribute.values.split(/[,\n]/).map(v => v.trim()).filter(v => v)
    attributes.value.push({ name: newAttribute.name, values })
    newAttribute.name = ''
    newAttribute.values = ''
    showAttributeDialog.value = false
    ElMessage.success('Đã thêm thuộc tính')
  }
}

function addConversion() {
  if (newConversion.name && newConversion.quantity > 0) {
    conversions.value.push({ name: newConversion.name, quantity: newConversion.quantity })
    newConversion.name = ''
    newConversion.quantity = 0
    showConversionDialog.value = false
    ElMessage.success('Đã thêm đơn vị quy đổi')
  }
}

async function createProductType() {
  if (!newProductTypeName.value.trim()) return
  
  try {
    const result = await productService.createProductType({ name: newProductTypeName.value.trim() })
    if (result.success || result.data) {
      await loadProductTypes()
      newProductTypeName.value = ''
      showAddProductType.value = false
      ElMessage.success('Đã thêm loại sản phẩm')
    }
  } catch (e) {
    ElMessage.error('Không thể thêm loại sản phẩm')
  }
}

async function createBrand() {
  if (!newBrandName.value.trim()) return
  
  try {
    const result = await productService.createBrand({ name: newBrandName.value.trim() })
    if (result.success || result.data) {
      await loadBrands()
      newBrandName.value = ''
      showAddBrand.value = false
      ElMessage.success('Đã thêm nhãn hiệu')
    }
  } catch (e) {
    ElMessage.error('Không thể thêm nhãn hiệu')
  }
}

async function handleSubmit() {
  if (!form.name) {
    ElMessage.warning('Vui lòng nhập tên sản phẩm')
    return
  }

  submitting.value = true
  try {
    // Build product data matching desktop logic
    const data: any = {
      name: form.name,
      managementType: form.managementType,
      retailPrice: form.retailPrice || 0,
      sku: form.sku || undefined,
      barcode: form.barcode || undefined,
      productTypeId: form.productTypeId || undefined,
      brandId: form.brandId || undefined,
      wholesalePrice: form.wholesalePrice || undefined,
      importPrice: form.importPrice || undefined,
      weight: form.weight || undefined,
      unit: form.unit || undefined,
      description: form.description || undefined,
      allowSale: form.allowSale,
      applyTax: form.applyTax,
      // Include images
      images: productImages.value.length > 0 ? productImages.value : undefined,
    }

    // Handle inventory initialization - Backend only accepts stockQuantity
    if (inventoryInit.quantity > 0) {
      data.stockQuantity = inventoryInit.quantity
    }

    // Remove undefined fields
    Object.keys(data).forEach(key => {
      if (data[key] === undefined || data[key] === null || data[key] === '') {
        delete data[key]
      }
    })

    console.log('=== Creating product with data ===', JSON.stringify(data, null, 2))

    let result
    if (isEditMode.value) {
      result = await productService.updateProduct(Number(route.params.id), data)
      
      // Update inventory if quantity changed
      if (inventoryInit.quantity > 0 || inventoryInit.costPrice > 0) {
        try {
          await inventoryService.initializeInventory(Number(route.params.id), {
            branchId: 1,
            branchName: 'Chi nhánh mặc định',
            quantity: inventoryInit.quantity || 0,
            costPrice: inventoryInit.costPrice || 0,
          })
        } catch (invError) {
          console.warn('Inventory update warning:', invError)
        }
      }
    } else {
      result = await productService.createProduct(data)
      
      // Initialize inventory for new product (using logic from desktop)
      const newProductId = result?.id || result?.data?.id
      if (newProductId && (inventoryInit.quantity > 0 || inventoryInit.costPrice > 0)) {
        try {
          await inventoryService.initializeInventory(newProductId, {
            branchId: 1,
            branchName: 'Chi nhánh mặc định',
            quantity: inventoryInit.quantity || 0,
            costPrice: inventoryInit.costPrice || 0,
          })
          console.log('Inventory initialized for product:', newProductId)
        } catch (invError) {
          console.warn('Inventory initialization warning:', invError)
        }
      }
    }

    ElMessage.success(isEditMode.value ? 'Cập nhật thành công' : 'Tạo sản phẩm thành công')
    router.push('/products/list')
  } catch (error: any) {
    console.error('Create product error:', error)
    console.error('Error response:', error.response?.data)
    const errorMsg = error.response?.data?.message
    if (Array.isArray(errorMsg)) {
      ElMessage.error(errorMsg.join(', '))
    } else {
      ElMessage.error(errorMsg || error.message || 'Có lỗi xảy ra')
    }
  } finally {
    submitting.value = false
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

async function loadBrands() {
  try {
    const result = await productService.getBrands()
    brands.value = result?.data || result || []
  } catch (e) {
    console.error('Load brands error:', e)
  }
}

async function loadProduct() {
  if (!route.params.id) return
  
  try {
    const result = await productService.getProductById(Number(route.params.id))
    const p = result?.data || result
    if (p) {
      form.name = p.name || ''
      form.sku = p.sku || ''
      form.barcode = p.barcode || ''
      form.productTypeId = p.productTypeId || null
      form.brandId = p.brandId || null
      form.managementType = p.managementType || 'normal'
      form.retailPrice = p.retailPrice || 0
      form.wholesalePrice = p.wholesalePrice || 0
      form.importPrice = p.importPrice || 0
      form.weight = p.weight || null
      form.unit = p.unit || ''
      form.description = p.description || ''
      form.imageUrl = p.images?.[0]?.url || p.imageUrl || ''
      form.allowSale = p.allowSale !== undefined ? p.allowSale : true
      form.applyTax = p.applyTax || false
      
      // Load existing images
      if (p.images && p.images.length > 0) {
        productImages.value = p.images.map((img: any, idx: number) => ({
          url: img.url,
          sortOrder: img.sortOrder || idx
        }))
      }
      
      // Inventory
      inventoryInit.quantity = p.stockQuantity || p.initialStock || 0
      inventoryInit.costPrice = p.costPrice || 0
    }
  } catch (e) {
    console.error('Load product error:', e)
  }
}

onMounted(async () => {
  await Promise.all([loadProductTypes(), loadBrands()])
  if (isEditMode.value) {
    await loadProduct()
  }
})
</script>

<style scoped lang="scss">
.mobile-product-create {
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
  position: sticky;
  top: 0;
  z-index: 100;

  .header-left .el-icon { font-size: 24px; cursor: pointer; color: #606266; }
  .page-title { flex: 1; text-align: center; font-size: 17px; font-weight: 600; }
  .header-right .el-icon { font-size: 24px; cursor: pointer; color: #409eff; }
}

.mobile-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 100px;
}

.image-section {
  background: #fff;
  padding: 16px;

  .images-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;

    .image-item {
      aspect-ratio: 1;
      border-radius: 8px;
      overflow: hidden;
      position: relative;
      background: #f5f7fa;
      border: 1px solid #e4e7ed;

      .preview-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .delete-icon {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 20px;
        height: 20px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        cursor: pointer;

        &:active { background: rgba(0, 0, 0, 0.7); }
      }

      &.add-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border: 2px dashed #dcdfe6;
        background: #fafafa;
        cursor: pointer;

        &:active { border-color: #409eff; }

        .el-icon { color: #909399; margin-bottom: 4px; }
        span { font-size: 11px; color: #909399; }
      }
    }
  }
}

.form-card {
  background: #fff;
  margin: 12px 16px;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);

  &.collapsible {
    .card-body { 
      max-height: 500px; 
      overflow: hidden; 
      transition: max-height 0.3s ease;
    }
    &.collapsed .card-body { max-height: 0; padding: 0; }
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;
      .card-icon { font-size: 18px; color: #606266; }
      .card-title { font-size: 15px; font-weight: 600; color: #303133; }
      .info-icon { font-size: 16px; }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 10px;
      .tax-label { font-size: 13px; color: #909399; }
    }
  }

  .card-body {
    .branch-name {
      font-size: 15px;
      font-weight: 500;
      color: #303133;
      margin-bottom: 16px;
    }
  }

  .collapse-toggle {
    text-align: center;
    padding-top: 12px;
    color: #409eff;
    cursor: pointer;
    .el-icon { 
      transition: transform 0.3s;
      &.rotated { transform: rotate(180deg); }
    }
  }

  .form-item {
    margin-bottom: 16px;
    &:last-child { margin-bottom: 0; }

    .item-label {
      font-size: 13px;
      color: #909399;
      margin-bottom: 8px;
    }

    &.with-suffix {
      :deep(.el-input__wrapper) { padding-right: 8px; }
      .barcode-icon { 
        font-size: 20px; 
        color: #409eff; 
        cursor: pointer;
        padding-left: 8px;
        border-left: 1px solid #dcdfe6;
      }
    }

    &.half { flex: 1; }
  }

  .form-row {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
    &:last-child { margin-bottom: 0; }
  }

  .radio-group {
    display: flex;
    gap: 24px;
    :deep(.el-radio__label) { font-size: 14px; }
  }
}

.form-card.section-card {
  padding: 0;

  .section-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    cursor: pointer;

    .section-left {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .section-title { font-size: 15px; color: #303133; }
      .section-subtitle { font-size: 13px; color: #909399; margin-left: 8px; }
      .info-icon { font-size: 16px; }
    }

    .add-icon { font-size: 22px; }
    .el-icon { color: #c0c4cc; transition: transform 0.3s; }
  }

  &.expandable {
    .section-row .el-icon.rotated { transform: rotate(180deg); }
  }

  .expanded-content {
    border-top: 1px solid #f0f0f0;
    
    .nav-item, .toggle-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;
      font-size: 15px;
      color: #303133;
      cursor: pointer;

      &:last-child { border-bottom: none; }

      .nav-right {
        display: flex;
        align-items: center;
        gap: 8px;
        .selected-value { color: #909399; }
        .el-icon { color: #c0c4cc; }
      }
    }
  }
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
  z-index: 100;

  .save-btn {
    width: 100%;
    height: 48px;
    font-size: 16px;
    border-radius: 8px;
  }
}

// Dialog styles
.dialog-form {
  .form-item {
    margin-bottom: 20px;
    &:last-child { margin-bottom: 0; }

    .item-label {
      font-size: 14px;
      color: #606266;
      margin-bottom: 8px;
    }

    .input-hint {
      font-size: 12px;
      color: #909399;
      margin-top: 6px;
    }
  }
}

:deep(.el-dialog) {
  border-radius: 12px;
  .el-dialog__header { padding: 16px 20px; border-bottom: 1px solid #f0f0f0; }
  .el-dialog__body { padding: 20px; }
  .el-dialog__footer { 
    padding: 12px 20px;
    border-top: 1px solid #f0f0f0;
    display: flex;
    gap: 12px;
    .el-button { flex: 1; margin: 0; }
  }
}

// Selector Page (fullscreen)
.selector-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f5f7fa;
  z-index: 200;
  display: flex;
  flex-direction: column;

  .selector-header {
    background: #fff;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    border-bottom: 1px solid #e4e7ed;

    span { flex: 1; font-size: 17px; font-weight: 600; text-align: center; }
    .el-icon { font-size: 22px; color: #606266; cursor: pointer; }
  }

  .selector-search {
    background: #fff;
    padding: 12px 16px;
  }

  .selector-list {
    flex: 1;
    overflow-y: auto;
    background: #fff;

    .selector-item {
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;
      font-size: 15px;
      color: #303133;
      cursor: pointer;

      &:active { background: #f5f7fa; }
      &.active { color: #409eff; font-weight: 500; }
    }
  }
}

// Input styles
:deep(.el-input__wrapper) {
  box-shadow: none;
  border-bottom: 1px solid #dcdfe6;
  border-radius: 0;
  padding-left: 0;
  
  &:hover, &.is-focus { border-color: #409eff; }
}

:deep(.el-input__inner) {
  font-size: 15px;
}
</style>
