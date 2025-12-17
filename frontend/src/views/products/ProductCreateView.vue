<template>
  <div class="product-create">
    <!-- Header -->
    <div class="page-header">
      <div class="breadcrumb">
        <el-link @click="$router.push('/products')" :underline="false">
          <el-icon><ArrowLeft /></el-icon> Quay lại danh sách sản phẩm
        </el-link>
      </div>
      <div class="actions">
        <el-button @click="$router.push('/products')">Thoát</el-button>
        <el-button type="primary" @click="handleSaveAndPrint">Lưu và in mã vạch</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="productStore.loading">Lưu</el-button>
      </div>
    </div>

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
          <el-link type="primary" class="settings-link">Thiết lập</el-link>
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
        </el-card>

        <!-- Thuộc tính -->
        <el-card class="section-card">
          <template #header>
            <div class="section-header">
              <span>Thuộc tính</span>
              <el-icon class="info-icon"><InfoFilled /></el-icon>
              <el-switch v-model="form.hasAttributes" />
            </div>
          </template>
          <p class="section-description">
            Thêm mới thuộc tính giúp sản phẩm có nhiều lựa chọn, như kích cỡ hay màu sắc
          </p>
        </el-card>

        <!-- Thêm đơn vị quy đổi -->
        <el-card class="section-card">
          <template #header>
            <div class="section-header">
              <span>Thêm đơn vị quy đổi</span>
              <el-icon class="info-icon"><InfoFilled /></el-icon>
              <el-switch v-model="form.hasConversionUnit" />
            </div>
          </template>
          <p class="section-description">
            Tạo và quy đổi các đơn vị tính khác nhau
          </p>
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
                allow-create
                style="width: 100%"
              >
                <el-option
                  v-for="brand in brands"
                  :key="brand.id"
                  :label="brand.name"
                  :value="brand.id"
                />
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

    <!-- Dialogs -->
    <ProductTypeDialog v-model="showProductTypeDialog" @created="loadProductTypes" />
    <TaxDialog v-model="showTaxDialog" @created="loadTaxes" />
    <DescriptionDialog v-model="showDescriptionDialog" v-model:description="form.description" />
    <PricePolicyDialog v-model="showPricePolicyDialog" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProductStore } from '@/stores/product.store'
import { ElMessage } from 'element-plus'
import { ArrowLeft, InfoFilled, Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import ProductTypeDialog from '@/components/product/ProductTypeDialog.vue'
import TaxDialog from '@/components/product/TaxDialog.vue'
import DescriptionDialog from '@/components/product/DescriptionDialog.vue'
import PricePolicyDialog from '@/components/product/PricePolicyDialog.vue'

const props = defineProps<{
  isEdit?: boolean
  productId?: number
}>()

const router = useRouter()
const route = useRoute()
const productStore = useProductStore()
const formRef = ref<FormInstance>()

const isEditMode = computed(() => props.isEdit || !!route.params.id)
const currentProductId = computed(() => props.productId || parseInt(route.params.id as string))

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
const showTaxDialog = ref(false)
const showDescriptionDialog = ref(false)
const showPricePolicyDialog = ref(false)

const rules: FormRules = {
  name: [{ required: true, message: 'Vui lòng nhập tên sản phẩm', trigger: 'blur' }],
  retailPrice: [{ required: true, message: 'Vui lòng nhập giá bán lẻ', trigger: 'blur' }],
  barcode: [
    { min: 3, max: 15, message: 'Mã vạch phải có từ 3-15 ký tự', trigger: 'blur' },
  ],
}

onMounted(async () => {
  loadProductTypes()
  loadBrands()
  loadTaxes()
  
  if (isEditMode.value) {
    await loadProductData()
  }
})

async function loadProductData() {
  try {
    await productStore.fetchProductById(currentProductId.value)
    const product = productStore.currentProduct
    if (product) {
      Object.assign(form, {
        name: product.name,
        sku: product.sku || '',
        barcode: product.barcode || '',
        weight: product.weight,
        weightUnit: product.weightUnit || 'g',
        unit: product.unit || '',
        description: product.description || '',
        managementType: product.managementType,
        retailPrice: product.retailPrice,
        wholesalePrice: product.wholesalePrice || 0,
        importPrice: product.importPrice || 0,
        allowSale: product.allowSale,
        applyTax: product.applyTax,
        taxIncluded: product.taxIncluded || false,
        inputTaxId: product.inputTaxId,
        outputTaxId: product.outputTaxId,
        expiryWarningEnabled: product.expiryWarningEnabled,
        productTypeId: product.productTypeId,
        brandId: product.brandId,
        tags: product.tags || [],
      })
      
      if (product.images) {
        imageList.value = product.images.map((img: any) => ({
          uid: img.id,
          name: img.url,
          url: img.url,
        }))
      }
    }
  } catch (error) {
    ElMessage.error('Không thể tải thông tin sản phẩm')
  }
}

function loadProductTypes() {
  // TODO: Load from API
  productTypes.value = [
    { id: 1, name: 'Gọng kính' },
    { id: 2, name: 'Hỗ trợ sức khỏe' },
    { id: 3, name: 'Kem dưỡng mắt' },
    { id: 4, name: 'Bút kẻ mắt' },
    { id: 5, name: 'Tẩy trang' },
  ]
}

function loadBrands() {
  // TODO: Load from API
  brands.value = []
}

function loadTaxes() {
  // TODO: Load from API
  taxes.value = [
    { id: 1, name: 'Không áp dụng thuế', rate: 0 },
    { id: 2, name: 'VAT', rate: 10 },
  ]
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
        if (isEditMode.value) {
          await productStore.updateProduct(currentProductId.value, form)
          ElMessage.success('Cập nhật sản phẩm thành công')
          router.push(`/products/${currentProductId.value}?created=false`)
        } else {
          await productStore.createProduct(form)
          ElMessage.success('Tạo sản phẩm thành công')
          router.push('/products')
        }
      } catch (error: any) {
        ElMessage.error(isEditMode.value ? 'Cập nhật sản phẩm thất bại' : 'Tạo sản phẩm thất bại')
      }
    }
  })
}

function handleSaveAndPrint() {
  handleSubmit()
  // TODO: Print barcode after save
}
</script>

<style scoped lang="scss">
.product-create {
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

  .section-card {
    margin-bottom: 20px;

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
}
</style>
