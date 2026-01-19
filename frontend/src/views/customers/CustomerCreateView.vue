<template>
  <div class="customer-create">
    <!-- Header -->
    <div class="page-header-bar">
      <div class="header-left">
        <el-button text @click="$router.push('/customers')">
          <el-icon><ArrowLeft /></el-icon>
          Quay lại danh sách khách hàng
        </el-button>
      </div>
      <div class="header-right">
        <el-button @click="$router.push('/customers')">Hủy</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">Lưu</el-button>
      </div>
    </div>

    <div class="customer-content">
      <el-row :gutter="20">
        <!-- Left Column - Main Info -->
        <el-col :span="16">
          <!-- Thông tin chung -->
          <el-card class="section-card">
            <template #header>
              <span>Thông tin chung</span>
            </template>
            
            <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
              <el-form-item label="Tên khách hàng" prop="name" required>
                <el-input v-model="form.name" placeholder="Nhập tên khách hàng" />
              </el-form-item>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="Mã khách hàng">
                    <el-input v-model="form.customerCode" placeholder="Nhập mã khách hàng" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Nhóm khách hàng">
                    <el-select v-model="form.customerGroup" placeholder="Chọn nhóm khách hàng" style="width: 100%">
                      <el-option label="Bán lẻ" value="retail" />
                      <el-option label="Bán buôn" value="wholesale" />
                      <el-option label="VIP" value="vip" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="Số điện thoại">
                    <el-input v-model="form.phone" placeholder="Nhập số điện thoại" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Email">
                    <el-input v-model="form.email" placeholder="Nhập địa chỉ email" />
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- Địa chỉ mới -->
              <div class="address-toggle-section">
                <el-switch v-model="useNewAddress" />
                <span>Địa chỉ mới</span>
                <el-tooltip content="Sử dụng định dạng địa chỉ mới">
                  <el-icon><InfoFilled /></el-icon>
                </el-tooltip>
              </div>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="Khu vực" :required="useNewAddress">
                    <el-select v-model="form.province" placeholder="Chọn Tỉnh/Thành phố - Quận/Huyện" style="width: 100%">
                      <el-option label="Hà Nội" value="Hà Nội" />
                      <el-option label="TP. Hồ Chí Minh" value="TP. Hồ Chí Minh" />
                      <el-option label="Đà Nẵng" value="Đà Nẵng" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Phường xã" :required="useNewAddress">
                    <el-select v-model="form.ward" placeholder="Chọn Phường/Xã" style="width: 100%">
                      <el-option label="Phường 1" value="Phường 1" />
                      <el-option label="Phường 2" value="Phường 2" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="Địa chỉ cụ thể" :required="useNewAddress">
                <el-input v-model="form.address" placeholder="Nhập số nhà, tên đường, tên khu vực" />
              </el-form-item>
            </el-form>
          </el-card>

          <!-- Thông tin bổ sung -->
          <el-card class="section-card">
            <template #header>
              <span>Thông tin bổ sung</span>
            </template>
            
            <el-form :model="form" label-position="top">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="Ngày sinh">
                    <el-date-picker
                      v-model="form.birthday"
                      type="date"
                      placeholder="Chọn ngày sinh"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Giới tính">
                    <el-select v-model="form.gender" placeholder="Chọn giới tính" style="width: 100%">
                      <el-option label="Nam" value="male" />
                      <el-option label="Nữ" value="female" />
                      <el-option label="Khác" value="other" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="Số fax">
                    <el-input v-model="form.fax" placeholder="Nhập số fax" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Mã số thuế">
                    <el-input v-model="form.taxCode" placeholder="Nhập mã số thuế" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="Website">
                    <el-input v-model="form.website" placeholder="Nhập tên miền website" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Công nợ">
                    <el-input-number
                      v-model="form.debt"
                      :min="0"
                      placeholder="Nhập công nợ khách hàng"
                      style="width: 100%"
                      :controls="false"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="Tổng chi tiêu">
                <el-input-number
                  v-model="form.totalSpent"
                  :min="0"
                  placeholder="Nhập tổng chi tiêu khách hàng"
                  style="width: 100%"
                  :controls="false"
                  disabled
                />
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>

        <!-- Right Column -->
        <el-col :span="8">
          <!-- Thông tin khác -->
          <el-card class="section-card">
            <template #header>
              <span>Thông tin khác</span>
            </template>
            
            <el-form :model="form" label-position="top">
              <el-form-item label="Nhân viên phụ trách">
                <el-select v-model="form.staffId" placeholder="Chọn nhân viên" style="width: 100%">
                  <el-option label="Lê Nguyễn Thùy Linh" :value="1" />
                </el-select>
              </el-form-item>

              <el-form-item label="Mô tả">
                <el-input
                  v-model="form.note"
                  type="textarea"
                  :rows="3"
                  placeholder="Nhập mô tả"
                />
              </el-form-item>

              <el-form-item label="Tags">
                <el-tooltip content="Thêm tag để phân loại khách hàng">
                  <el-icon><InfoFilled /></el-icon>
                </el-tooltip>
                <el-select
                  v-model="form.tags"
                  multiple
                  filterable
                  allow-create
                  placeholder="Nhập tags"
                  style="width: 100%"
                />
              </el-form-item>
            </el-form>
          </el-card>

          <!-- Cài đặt nâng cao -->
          <el-card class="section-card">
            <template #header>
              <div class="section-header">
                <span>Cài đặt nâng cao</span>
                <el-tooltip content="Cài đặt ưu đãi cho khách hàng">
                  <el-icon><InfoFilled /></el-icon>
                </el-tooltip>
              </div>
            </template>
            
            <div class="advanced-settings">
              <p class="setting-label">Áp dụng ưu đãi</p>
              <el-radio-group v-model="form.discountType">
                <el-radio value="group">Theo nhóm khách hàng</el-radio>
                <el-radio value="customer">Theo khách hàng</el-radio>
              </el-radio-group>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { ArrowLeft, InfoFilled } from '@element-plus/icons-vue'
import { customerService } from '@/services/customer.service'

const route = useRoute()
const router = useRouter()

const formRef = ref<FormInstance>()
const submitting = ref(false)
const isEditMode = ref(false)
const useNewAddress = ref(false)

const form = reactive({
  name: '',
  customerCode: '',
  customerGroup: 'retail',
  phone: '',
  email: '',
  province: '',
  district: '',
  ward: '',
  address: '',
  birthday: null as Date | null,
  gender: '',
  fax: '',
  taxCode: '',
  website: '',
  debt: 0,
  totalSpent: 0,
  staffId: 1,
  note: '',
  tags: [] as string[],
  discountType: 'group',
})

const rules: FormRules = {
  name: [{ required: true, message: 'Vui lòng nhập tên khách hàng', trigger: 'blur' }],
}

async function loadCustomer(id: number) {
  try {
    const res = await customerService.getCustomerById(id)
    if (res.success && res.data) {
      Object.assign(form, res.data)
      isEditMode.value = true
    }
  } catch (e) {
    console.error('Load customer error:', e)
    ElMessage.error('Không thể tải thông tin khách hàng')
  }
}

async function handleSubmit() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      const data = { ...form }
      
      let res
      if (isEditMode.value) {
        const id = Number(route.params.id)
        res = await customerService.updateCustomer(id, data)
      } else {
        res = await customerService.createCustomer(data)
      }

      if (res.success) {
        ElMessage.success(isEditMode.value ? 'Cập nhật thành công' : 'Thêm khách hàng thành công')
        if (isEditMode.value) {
          // Redirect back to customer detail page after update
          router.push(`/customers/${route.params.id}`)
        } else {
          // After creating, go to customer detail page
          router.push(`/customers/${res.data.id}`)
        }
      } else {
        ElMessage.error(res.message || 'Có lỗi xảy ra')
      }
    } catch (e: any) {
      ElMessage.error(e.response?.data?.message || 'Có lỗi xảy ra')
    } finally {
      submitting.value = false
    }
  })
}

onMounted(() => {
  const id = route.params.id
  if (id && id !== 'create') {
    loadCustomer(Number(id))
  }
})
</script>

<style scoped lang="scss">
.customer-create {
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
      .el-button {
        font-size: 14px;
      }
    }

    .header-right {
      display: flex;
      gap: 12px;
    }
  }

  .customer-content {
    padding: 20px;
  }

  .section-card {
    margin-bottom: 16px;
    border-radius: 8px;

    :deep(.el-card__header) {
      padding: 12px 16px;
      font-weight: 500;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .address-toggle-section {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 6px;

    span {
      font-size: 14px;
    }
  }

  .advanced-settings {
    .setting-label {
      font-size: 14px;
      color: #606266;
      margin-bottom: 12px;
    }

    .el-radio-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  }
}
</style>


