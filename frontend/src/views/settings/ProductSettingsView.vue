<template>
  <div class="settings-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1>Cấu hình sản phẩm & kho</h1>
    </div>

    <!-- Tabs -->
    <el-tabs v-model="activeTab" type="border-card">
      <!-- Tab: Product Types -->
      <el-tab-pane label="Loại sản phẩm" name="productTypes">
        <div class="tab-actions">
          <el-button type="primary" @click="showProductTypeDialog = true">
            + Thêm loại sản phẩm
          </el-button>
        </div>
        <el-table :data="productTypes" v-loading="loading.productTypes" style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="Tên loại" min-width="200" />
          <el-table-column prop="code" label="Mã" width="120" />
          <el-table-column prop="sortOrder" label="Thứ tự" width="100" />
          <el-table-column label="Thao tác" width="150" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="editProductType(row)">Sửa</el-button>
              <el-button size="small" type="danger" @click="deleteProductType(row)">Xóa</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- Tab: Brands -->
      <el-tab-pane label="Nhãn hiệu" name="brands">
        <div class="tab-actions">
          <el-button type="primary" @click="showBrandDialog = true">
            + Thêm nhãn hiệu
          </el-button>
        </div>
        <el-table :data="brands" v-loading="loading.brands" style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="Tên nhãn hiệu" min-width="200" />
          <el-table-column prop="country" label="Xuất xứ" width="150" />
          <el-table-column label="Thao tác" width="150" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="editBrand(row)">Sửa</el-button>
              <el-button size="small" type="danger" @click="deleteBrand(row)">Xóa</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- Tab: Units -->
      <el-tab-pane label="Đơn vị tính" name="units">
        <div class="tab-actions">
          <el-button type="primary" @click="showUnitDialog = true">
            + Thêm đơn vị
          </el-button>
        </div>
        <el-table :data="units" v-loading="loading.units" style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="Tên đơn vị" min-width="200" />
          <el-table-column prop="abbreviation" label="Viết tắt" width="120" />
          <el-table-column label="Thao tác" width="150" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="editUnit(row)">Sửa</el-button>
              <el-button size="small" type="danger" @click="deleteUnit(row)">Xóa</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- Tab: Attributes -->
      <el-tab-pane label="Thuộc tính" name="attributes">
        <div class="tab-actions">
          <el-button type="primary" @click="showAttributeDialog = true">
            + Thêm thuộc tính
          </el-button>
        </div>
        <el-table :data="attributes" v-loading="loading.attributes" style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="Tên thuộc tính" min-width="200" />
          <el-table-column prop="type" label="Loại" width="120">
            <template #default="{ row }">
              {{ getAttributeTypeLabel(row.type) }}
            </template>
          </el-table-column>
          <el-table-column label="Giá trị mặc định" min-width="200">
            <template #default="{ row }">
              <el-tag v-for="val in (row.defaultValues || []).slice(0, 5)" :key="val" size="small" class="mr-1">
                {{ val }}
              </el-tag>
              <span v-if="row.defaultValues?.length > 5">+{{ row.defaultValues.length - 5 }} more</span>
            </template>
          </el-table-column>
          <el-table-column label="Thao tác" width="150" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="editAttribute(row)">Sửa</el-button>
              <el-button size="small" type="danger" @click="deleteAttribute(row)">Xóa</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- Tab: Taxes -->
      <el-tab-pane label="Thuế" name="taxes">
        <div class="tab-actions">
          <el-button type="primary" @click="showTaxDialog = true">
            + Thêm thuế
          </el-button>
        </div>
        <el-table :data="taxes" v-loading="loading.taxes" style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="Tên thuế" min-width="200" />
          <el-table-column prop="code" label="Mã" width="120" />
          <el-table-column prop="rate" label="Thuế suất (%)" width="120">
            <template #default="{ row }">
              {{ row.rate }}%
            </template>
          </el-table-column>
          <el-table-column label="Thao tác" width="150" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="editTax(row)">Sửa</el-button>
              <el-button size="small" type="danger" @click="deleteTax(row)">Xóa</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- Dialog: Product Type -->
    <el-dialog
      v-model="showProductTypeDialog"
      :title="editingProductType ? 'Sửa loại sản phẩm' : 'Thêm loại sản phẩm'"
      width="500px"
      @close="resetProductTypeForm"
    >
      <el-form :model="productTypeForm" label-width="120px">
        <el-form-item label="Tên loại" required>
          <el-input v-model="productTypeForm.name" />
        </el-form-item>
        <el-form-item label="Mã">
          <el-input v-model="productTypeForm.code" />
        </el-form-item>
        <el-form-item label="Thứ tự">
          <el-input-number v-model="productTypeForm.sortOrder" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showProductTypeDialog = false">Hủy</el-button>
        <el-button type="primary" @click="saveProductType" :loading="saving">Lưu</el-button>
      </template>
    </el-dialog>

    <!-- Dialog: Brand -->
    <el-dialog
      v-model="showBrandDialog"
      :title="editingBrand ? 'Sửa nhãn hiệu' : 'Thêm nhãn hiệu'"
      width="500px"
      @close="resetBrandForm"
    >
      <el-form :model="brandForm" label-width="120px">
        <el-form-item label="Tên nhãn hiệu" required>
          <el-input v-model="brandForm.name" />
        </el-form-item>
        <el-form-item label="Xuất xứ">
          <el-input v-model="brandForm.country" />
        </el-form-item>
        <el-form-item label="Mô tả">
          <el-input v-model="brandForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showBrandDialog = false">Hủy</el-button>
        <el-button type="primary" @click="saveBrand" :loading="saving">Lưu</el-button>
      </template>
    </el-dialog>

    <!-- Dialog: Unit -->
    <el-dialog
      v-model="showUnitDialog"
      :title="editingUnit ? 'Sửa đơn vị' : 'Thêm đơn vị'"
      width="500px"
      @close="resetUnitForm"
    >
      <el-form :model="unitForm" label-width="120px">
        <el-form-item label="Tên đơn vị" required>
          <el-input v-model="unitForm.name" placeholder="VD: Cái, Hộp, Chai..." />
        </el-form-item>
        <el-form-item label="Viết tắt">
          <el-input v-model="unitForm.abbreviation" placeholder="VD: pcs, box..." />
        </el-form-item>
        <el-form-item label="Mô tả">
          <el-input v-model="unitForm.description" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showUnitDialog = false">Hủy</el-button>
        <el-button type="primary" @click="saveUnit" :loading="saving">Lưu</el-button>
      </template>
    </el-dialog>

    <!-- Dialog: Attribute -->
    <el-dialog
      v-model="showAttributeDialog"
      :title="editingAttribute ? 'Sửa thuộc tính' : 'Thêm thuộc tính'"
      width="600px"
      @close="resetAttributeForm"
    >
      <el-form :model="attributeForm" label-width="120px">
        <el-form-item label="Tên thuộc tính" required>
          <el-input v-model="attributeForm.name" placeholder="VD: Kích thước, Màu sắc..." />
        </el-form-item>
        <el-form-item label="Loại">
          <el-select v-model="attributeForm.type" style="width: 100%">
            <el-option label="Văn bản" value="text" />
            <el-option label="Danh sách chọn" value="select" />
            <el-option label="Số" value="number" />
            <el-option label="Màu sắc" value="color" />
          </el-select>
        </el-form-item>
        <el-form-item label="Giá trị mặc định">
          <el-select
            v-model="attributeForm.defaultValues"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="Nhập giá trị và nhấn Enter"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="Mô tả">
          <el-input v-model="attributeForm.description" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAttributeDialog = false">Hủy</el-button>
        <el-button type="primary" @click="saveAttribute" :loading="saving">Lưu</el-button>
      </template>
    </el-dialog>

    <!-- Dialog: Tax -->
    <el-dialog
      v-model="showTaxDialog"
      :title="editingTax ? 'Sửa thuế' : 'Thêm thuế'"
      width="500px"
      @close="resetTaxForm"
    >
      <el-form :model="taxForm" label-width="120px">
        <el-form-item label="Tên thuế" required>
          <el-input v-model="taxForm.name" placeholder="VD: VAT, GTGT..." />
        </el-form-item>
        <el-form-item label="Mã">
          <el-input v-model="taxForm.code" placeholder="VD: VAT10" />
        </el-form-item>
        <el-form-item label="Thuế suất (%)">
          <el-input-number v-model="taxForm.rate" :min="0" :max="100" :precision="2" />
        </el-form-item>
        <el-form-item label="Mô tả">
          <el-input v-model="taxForm.description" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showTaxDialog = false">Hủy</el-button>
        <el-button type="primary" @click="saveTax" :loading="saving">Lưu</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import apiClient from '@/services/api/client'

const activeTab = ref('productTypes')
const saving = ref(false)

const loading = reactive({
  productTypes: false,
  brands: false,
  units: false,
  attributes: false,
  taxes: false,
})

// Data
const productTypes = ref<any[]>([])
const brands = ref<any[]>([])
const units = ref<any[]>([])
const attributes = ref<any[]>([])
const taxes = ref<any[]>([])

// Dialog visibility
const showProductTypeDialog = ref(false)
const showBrandDialog = ref(false)
const showUnitDialog = ref(false)
const showAttributeDialog = ref(false)
const showTaxDialog = ref(false)

// Editing flags
const editingProductType = ref<any>(null)
const editingBrand = ref<any>(null)
const editingUnit = ref<any>(null)
const editingAttribute = ref<any>(null)
const editingTax = ref<any>(null)

// Forms
const productTypeForm = reactive({ name: '', code: '', sortOrder: 0 })
const brandForm = reactive({ name: '', country: '', description: '' })
const unitForm = reactive({ name: '', abbreviation: '', description: '' })
const attributeForm = reactive({ name: '', type: 'text', defaultValues: [] as string[], description: '' })
const taxForm = reactive({ name: '', code: '', rate: 0, description: '' })

// Load data
async function loadProductTypes() {
  loading.productTypes = true
  try {
    const res = await apiClient.get('/products/types/list')
    productTypes.value = res.data.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.productTypes = false
  }
}

async function loadBrands() {
  loading.brands = true
  try {
    const res = await apiClient.get('/products/brands/list')
    brands.value = res.data.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.brands = false
  }
}

async function loadUnits() {
  loading.units = true
  try {
    const res = await apiClient.get('/settings/units')
    units.value = res.data.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.units = false
  }
}

async function loadAttributes() {
  loading.attributes = true
  try {
    const res = await apiClient.get('/settings/attributes')
    attributes.value = res.data.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.attributes = false
  }
}

async function loadTaxes() {
  loading.taxes = true
  try {
    const res = await apiClient.get('/products/taxes/list')
    taxes.value = res.data.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.taxes = false
  }
}

// Helpers
function getAttributeTypeLabel(type: string) {
  const map: Record<string, string> = {
    text: 'Văn bản',
    select: 'Danh sách chọn',
    number: 'Số',
    color: 'Màu sắc',
  }
  return map[type] || type
}

// Reset forms
function resetProductTypeForm() {
  editingProductType.value = null
  Object.assign(productTypeForm, { name: '', code: '', sortOrder: 0 })
}

function resetBrandForm() {
  editingBrand.value = null
  Object.assign(brandForm, { name: '', country: '', description: '' })
}

function resetUnitForm() {
  editingUnit.value = null
  Object.assign(unitForm, { name: '', abbreviation: '', description: '' })
}

function resetAttributeForm() {
  editingAttribute.value = null
  Object.assign(attributeForm, { name: '', type: 'text', defaultValues: [], description: '' })
}

function resetTaxForm() {
  editingTax.value = null
  Object.assign(taxForm, { name: '', code: '', rate: 0, description: '' })
}

// Edit functions
function editProductType(row: any) {
  editingProductType.value = row
  Object.assign(productTypeForm, { name: row.name, code: row.code || '', sortOrder: row.sortOrder || 0 })
  showProductTypeDialog.value = true
}

function editBrand(row: any) {
  editingBrand.value = row
  Object.assign(brandForm, { name: row.name, country: row.country || '', description: row.description || '' })
  showBrandDialog.value = true
}

function editUnit(row: any) {
  editingUnit.value = row
  Object.assign(unitForm, { name: row.name, abbreviation: row.abbreviation || '', description: row.description || '' })
  showUnitDialog.value = true
}

function editAttribute(row: any) {
  editingAttribute.value = row
  Object.assign(attributeForm, {
    name: row.name,
    type: row.type || 'text',
    defaultValues: row.defaultValues || [],
    description: row.description || '',
  })
  showAttributeDialog.value = true
}

function editTax(row: any) {
  editingTax.value = row
  Object.assign(taxForm, { name: row.name, code: row.code || '', rate: row.rate || 0, description: row.description || '' })
  showTaxDialog.value = true
}

// Save functions
async function saveProductType() {
  if (!productTypeForm.name.trim()) {
    ElMessage.warning('Vui lòng nhập tên loại sản phẩm')
    return
  }
  saving.value = true
  try {
    if (editingProductType.value) {
      await apiClient.patch(`/products/types/${editingProductType.value.id}`, productTypeForm)
      ElMessage.success('Cập nhật thành công')
    } else {
      await apiClient.post('/products/types', productTypeForm)
      ElMessage.success('Thêm mới thành công')
    }
    showProductTypeDialog.value = false
    loadProductTypes()
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || 'Có lỗi xảy ra')
  } finally {
    saving.value = false
  }
}

async function saveBrand() {
  if (!brandForm.name.trim()) {
    ElMessage.warning('Vui lòng nhập tên nhãn hiệu')
    return
  }
  saving.value = true
  try {
    if (editingBrand.value) {
      await apiClient.patch(`/products/brands/${editingBrand.value.id}`, brandForm)
      ElMessage.success('Cập nhật thành công')
    } else {
      await apiClient.post('/products/brands', brandForm)
      ElMessage.success('Thêm mới thành công')
    }
    showBrandDialog.value = false
    loadBrands()
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || 'Có lỗi xảy ra')
  } finally {
    saving.value = false
  }
}

async function saveUnit() {
  if (!unitForm.name.trim()) {
    ElMessage.warning('Vui lòng nhập tên đơn vị')
    return
  }
  saving.value = true
  try {
    if (editingUnit.value) {
      await apiClient.patch(`/settings/units/${editingUnit.value.id}`, unitForm)
      ElMessage.success('Cập nhật thành công')
    } else {
      await apiClient.post('/settings/units', unitForm)
      ElMessage.success('Thêm mới thành công')
    }
    showUnitDialog.value = false
    loadUnits()
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || 'Có lỗi xảy ra')
  } finally {
    saving.value = false
  }
}

async function saveAttribute() {
  if (!attributeForm.name.trim()) {
    ElMessage.warning('Vui lòng nhập tên thuộc tính')
    return
  }
  saving.value = true
  try {
    if (editingAttribute.value) {
      await apiClient.patch(`/settings/attributes/${editingAttribute.value.id}`, attributeForm)
      ElMessage.success('Cập nhật thành công')
    } else {
      await apiClient.post('/settings/attributes', attributeForm)
      ElMessage.success('Thêm mới thành công')
    }
    showAttributeDialog.value = false
    loadAttributes()
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || 'Có lỗi xảy ra')
  } finally {
    saving.value = false
  }
}

async function saveTax() {
  if (!taxForm.name.trim()) {
    ElMessage.warning('Vui lòng nhập tên thuế')
    return
  }
  saving.value = true
  try {
    if (editingTax.value) {
      await apiClient.patch(`/products/taxes/${editingTax.value.id}`, taxForm)
      ElMessage.success('Cập nhật thành công')
    } else {
      await apiClient.post('/products/taxes', taxForm)
      ElMessage.success('Thêm mới thành công')
    }
    showTaxDialog.value = false
    loadTaxes()
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || 'Có lỗi xảy ra')
  } finally {
    saving.value = false
  }
}

// Delete functions
async function deleteProductType(row: any) {
  try {
    await ElMessageBox.confirm('Xóa loại sản phẩm này?', 'Xác nhận', { type: 'warning' })
    await apiClient.delete(`/products/types/${row.id}`)
    ElMessage.success('Đã xóa')
    loadProductTypes()
  } catch (e) {
    // User cancelled or error
  }
}

async function deleteBrand(row: any) {
  try {
    await ElMessageBox.confirm('Xóa nhãn hiệu này?', 'Xác nhận', { type: 'warning' })
    await apiClient.delete(`/products/brands/${row.id}`)
    ElMessage.success('Đã xóa')
    loadBrands()
  } catch (e) {
    // User cancelled or error
  }
}

async function deleteUnit(row: any) {
  try {
    await ElMessageBox.confirm('Xóa đơn vị này?', 'Xác nhận', { type: 'warning' })
    await apiClient.delete(`/settings/units/${row.id}`)
    ElMessage.success('Đã xóa')
    loadUnits()
  } catch (e) {
    // User cancelled or error
  }
}

async function deleteAttribute(row: any) {
  try {
    await ElMessageBox.confirm('Xóa thuộc tính này?', 'Xác nhận', { type: 'warning' })
    await apiClient.delete(`/settings/attributes/${row.id}`)
    ElMessage.success('Đã xóa')
    loadAttributes()
  } catch (e) {
    // User cancelled or error
  }
}

async function deleteTax(row: any) {
  try {
    await ElMessageBox.confirm('Xóa thuế này?', 'Xác nhận', { type: 'warning' })
    await apiClient.delete(`/products/taxes/${row.id}`)
    ElMessage.success('Đã xóa')
    loadTaxes()
  } catch (e) {
    // User cancelled or error
  }
}

onMounted(() => {
  loadProductTypes()
  loadBrands()
  loadUnits()
  loadAttributes()
  loadTaxes()
})
</script>

<style scoped lang="scss">
.settings-page {
  padding: 20px;
  
  .page-header {
    margin-bottom: 20px;
    
    h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }
  }
  
  .tab-actions {
    margin-bottom: 16px;
    display: flex;
    justify-content: flex-end;
  }
  
  .mr-1 {
    margin-right: 4px;
  }
}
</style>
