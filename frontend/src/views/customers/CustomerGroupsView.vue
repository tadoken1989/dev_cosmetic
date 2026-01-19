<template>
  <div class="customer-groups">
    <!-- Header -->
    <div class="page-header-bar">
      <div class="header-left">
        <el-button text @click="$router.push('/customers')">
          <el-icon><ArrowLeft /></el-icon>
          Quay lại danh sách nhóm khách hàng
        </el-button>
      </div>
      <div class="header-right">
        <el-button @click="$router.push('/customers/groups')">Hủy</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">Lưu</el-button>
      </div>
    </div>

    <div class="groups-content">
      <el-row :gutter="20">
        <!-- Left Column -->
        <el-col :span="16">
          <!-- Thông tin chung -->
          <el-card class="section-card">
            <template #header>
              <span>Thông tin chung</span>
            </template>
            
            <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
              <el-form-item label="Tên nhóm" prop="name" required>
                <el-input v-model="form.name" placeholder="Nhập tên nhóm khách hàng" />
              </el-form-item>

              <el-form-item label="Mã nhóm">
                <el-input v-model="form.code" placeholder="Nhập mã nhóm khách hàng" />
              </el-form-item>

              <el-form-item label="Mô tả">
                <el-input
                  v-model="form.description"
                  type="textarea"
                  :rows="4"
                  placeholder="Nhập mô tả"
                />
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>

        <!-- Right Column -->
        <el-col :span="8">
          <!-- Cài đặt nâng cao -->
          <el-card class="section-card">
            <template #header>
              <div class="section-header">
                <span>Cài đặt nâng cao</span>
                <el-tooltip content="Cài đặt giá và ưu đãi cho nhóm khách hàng">
                  <el-icon><InfoFilled /></el-icon>
                </el-tooltip>
              </div>
            </template>
            
            <el-form :model="form" label-position="top">
              <el-form-item label="Giá mặc định">
                <el-select v-model="form.defaultPriceType" placeholder="Chọn giá mặc định" style="width: 100%">
                  <el-option label="Chọn giá mặc định" value="" />
                  <el-option label="Giá bán lẻ" value="retail" />
                  <el-option label="Giá bán buôn" value="wholesale" />
                  <el-option label="Giá VIP" value="vip" />
                </el-select>
              </el-form-item>

              <el-form-item label="Chiết khấu (%)">
                <el-input-number
                  v-model="form.discountPercent"
                  :min="0"
                  :max="100"
                  :precision="2"
                  style="width: 100%"
                  placeholder="0"
                />
              </el-form-item>

              <el-form-item label="Hình thức thanh toán">
                <el-select
                  v-model="form.paymentMethods"
                  multiple
                  placeholder="Chọn hình thức thanh toán"
                  style="width: 100%"
                >
                  <el-option label="Chọn hình thức thanh toán" value="" disabled />
                  <el-option label="Quẹt thẻ" value="card" />
                  <el-option label="Thanh toán bằng điểm" value="points" />
                  <el-option label="COD" value="cod" />
                  <el-option label="Chuyển khoản" value="transfer" />
                  <el-option label="Tiền mặt" value="cash" />
                  <el-option label="Ví Shopee" value="shopee" />
                </el-select>
              </el-form-item>
            </el-form>
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

const route = useRoute()
const router = useRouter()

const formRef = ref<FormInstance>()
const submitting = ref(false)
const isEditMode = ref(false)

const form = reactive({
  name: '',
  code: '',
  description: '',
  defaultPriceType: 'retail',
  discountPercent: 0,
  paymentMethods: [] as string[],
})

const rules: FormRules = {
  name: [{ required: true, message: 'Vui lòng nhập tên nhóm', trigger: 'blur' }],
}

async function handleSubmit() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      // Load existing groups from localStorage
      const savedGroups = localStorage.getItem('customerGroups')
      let groups = savedGroups ? JSON.parse(savedGroups) : []
      
      if (isEditMode.value) {
        // Update existing group
        const groupId = route.params.id
        const index = groups.findIndex((g: any) => g.id === Number(groupId))
        if (index > -1) {
          groups[index] = {
            ...groups[index],
            name: form.name,
            code: form.code,
            description: form.description,
            defaultPriceType: form.defaultPriceType,
            discountPercent: form.discountPercent,
            paymentMethods: form.paymentMethods,
          }
        }
      } else {
        // Add new group
        const newGroup = {
          id: groups.length > 0 ? Math.max(...groups.map((g: any) => g.id)) + 1 : 1,
          name: form.name,
          code: form.code || `GRP${Date.now()}`,
          type: 'Có định',
          description: form.description,
          customerCount: 0,
          defaultPriceType: form.defaultPriceType,
          discountPercent: form.discountPercent,
          paymentMethods: form.paymentMethods,
          createdAt: new Date().toISOString().split('T')[0],
        }
        groups.push(newGroup)
      }
      
      // Save to localStorage
      localStorage.setItem('customerGroups', JSON.stringify(groups))
      
      ElMessage.success(isEditMode.value ? 'Cập nhật nhóm thành công' : 'Thêm nhóm thành công')
      router.push('/customers/groups')
    } catch (e: any) {
      ElMessage.error(e.message || 'Có lỗi xảy ra')
    } finally {
      submitting.value = false
    }
  })
}

onMounted(() => {
  const id = route.params.id
  if (id && id !== 'create') {
    isEditMode.value = true
    // Load group data from localStorage
    try {
      const savedGroups = localStorage.getItem('customerGroups')
      if (savedGroups) {
        const groups = JSON.parse(savedGroups)
        const group = groups.find((g: any) => g.id === Number(id))
        if (group) {
          form.name = group.name
          form.code = group.code
          form.description = group.description || ''
          form.defaultPriceType = group.defaultPriceType || 'retail'
          form.discountPercent = group.discountPercent || 0
          form.paymentMethods = group.paymentMethods || []
        }
      }
    } catch (e) {
      console.error('Load group error:', e)
    }
  }
})
</script>

<style scoped lang="scss">
.customer-groups {
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

  .groups-content {
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
}
</style>




