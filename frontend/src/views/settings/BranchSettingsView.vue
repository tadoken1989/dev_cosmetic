<template>
  <div class="settings-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1>Quản lý chi nhánh</h1>
      <el-button type="primary" @click="showBranchDialog = true">
        + Thêm chi nhánh
      </el-button>
    </div>

    <!-- Branch List -->
    <el-card>
      <el-table :data="branches" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="code" label="Mã CN" width="100" />
        <el-table-column prop="name" label="Tên chi nhánh" min-width="200" />
        <el-table-column prop="address" label="Địa chỉ" min-width="200" />
        <el-table-column prop="phone" label="Điện thoại" width="120" />
        <el-table-column label="Trạng thái" width="120">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'">
              {{ row.isActive ? 'Hoạt động' : 'Ngừng' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Mặc định" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.isDefault" type="warning">Mặc định</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Thao tác" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="editBranch(row)">Sửa</el-button>
            <el-button size="small" type="danger" @click="deleteBranch(row)" :disabled="row.isDefault">
              Xóa
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Dialog -->
    <el-dialog
      v-model="showBranchDialog"
      :title="editingBranch ? 'Sửa chi nhánh' : 'Thêm chi nhánh'"
      width="600px"
      @close="resetForm"
    >
      <el-form :model="branchForm" label-width="120px">
        <el-form-item label="Mã chi nhánh">
          <el-input v-model="branchForm.code" placeholder="VD: CN01" />
        </el-form-item>
        <el-form-item label="Tên chi nhánh" required>
          <el-input v-model="branchForm.name" placeholder="VD: Chi nhánh Quận 1" />
        </el-form-item>
        <el-form-item label="Địa chỉ">
          <el-input v-model="branchForm.address" placeholder="Địa chỉ chi nhánh" />
        </el-form-item>
        <el-form-item label="Số điện thoại">
          <el-input v-model="branchForm.phone" placeholder="VD: 0901234567" />
        </el-form-item>
        <el-form-item label="Email">
          <el-input v-model="branchForm.email" placeholder="VD: chinhanh@email.com" type="email" />
        </el-form-item>
        <el-form-item label="Mô tả">
          <el-input v-model="branchForm.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="Trạng thái">
          <el-switch v-model="branchForm.isActive" active-text="Hoạt động" inactive-text="Ngừng" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showBranchDialog = false">Hủy</el-button>
        <el-button type="primary" @click="saveBranch" :loading="saving">Lưu</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import apiClient from '@/services/api/client'

const loading = ref(false)
const saving = ref(false)
const branches = ref<any[]>([])

const showBranchDialog = ref(false)
const editingBranch = ref<any>(null)

const branchForm = reactive({
  code: '',
  name: '',
  address: '',
  phone: '',
  email: '',
  description: '',
  isActive: true,
})

async function loadBranches() {
  loading.value = true
  try {
    const res = await apiClient.get('/settings/branches')
    branches.value = res.data.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  editingBranch.value = null
  Object.assign(branchForm, {
    code: '',
    name: '',
    address: '',
    phone: '',
    email: '',
    description: '',
    isActive: true,
  })
}

function editBranch(row: any) {
  editingBranch.value = row
  Object.assign(branchForm, {
    code: row.code || '',
    name: row.name,
    address: row.address || '',
    phone: row.phone || '',
    email: row.email || '',
    description: row.description || '',
    isActive: row.isActive,
  })
  showBranchDialog.value = true
}

async function saveBranch() {
  if (!branchForm.name.trim()) {
    ElMessage.warning('Vui lòng nhập tên chi nhánh')
    return
  }
  saving.value = true
  try {
    if (editingBranch.value) {
      await apiClient.patch(`/settings/branches/${editingBranch.value.id}`, branchForm)
      ElMessage.success('Cập nhật thành công')
    } else {
      await apiClient.post('/settings/branches', branchForm)
      ElMessage.success('Thêm mới thành công')
    }
    showBranchDialog.value = false
    loadBranches()
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || 'Có lỗi xảy ra')
  } finally {
    saving.value = false
  }
}

async function deleteBranch(row: any) {
  try {
    await ElMessageBox.confirm('Xóa chi nhánh này?', 'Xác nhận', { type: 'warning' })
    await apiClient.delete(`/settings/branches/${row.id}`)
    ElMessage.success('Đã xóa')
    loadBranches()
  } catch (e) {
    // User cancelled or error
  }
}

onMounted(() => {
  loadBranches()
})
</script>

<style scoped lang="scss">
.settings-page {
  padding: 20px;
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }
  }
}
</style>





