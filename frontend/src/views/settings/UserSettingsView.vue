<template>
  <div class="settings-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1>Quản lý nhân viên</h1>
      <el-button type="primary" @click="showUserDialog = true">
        + Thêm nhân viên
      </el-button>
    </div>

    <!-- User List -->
    <el-card>
      <el-table :data="users" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="Nhân viên" min-width="200">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="32" :style="{ background: getAvatarColor(row.fullName) }">
                {{ row.fullName?.charAt(0) }}
              </el-avatar>
              <div class="user-info">
                <span class="name">{{ row.fullName }}</span>
                <span class="email">{{ row.email }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="role" label="Vai trò" width="120">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.role)">
              {{ getRoleLabel(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="Điện thoại" width="120" />
        <el-table-column label="Trạng thái" width="120">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'">
              {{ row.isActive ? 'Hoạt động' : 'Ngừng' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Thao tác" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="editUser(row)">Sửa</el-button>
            <el-button size="small" type="danger" @click="deleteUser(row)">Xóa</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Dialog -->
    <el-dialog
      v-model="showUserDialog"
      :title="editingUser ? 'Sửa nhân viên' : 'Thêm nhân viên'"
      width="600px"
      @close="resetForm"
    >
      <el-form :model="userForm" label-width="120px">
        <el-form-item label="Họ tên" required>
          <el-input v-model="userForm.fullName" placeholder="Nhập họ tên" />
        </el-form-item>
        <el-form-item label="Email" required>
          <el-input v-model="userForm.email" placeholder="email@example.com" type="email" />
        </el-form-item>
        <el-form-item label="Mật khẩu" :required="!editingUser">
          <el-input
            v-model="userForm.password"
            type="password"
            :placeholder="editingUser ? 'Để trống nếu không đổi' : 'Nhập mật khẩu'"
            show-password
          />
        </el-form-item>
        <el-form-item label="Số điện thoại">
          <el-input v-model="userForm.phone" placeholder="VD: 0901234567" />
        </el-form-item>
        <el-form-item label="Vai trò">
          <el-select v-model="userForm.role" style="width: 100%">
            <el-option label="Quản trị viên" value="admin" />
            <el-option label="Quản lý" value="manager" />
            <el-option label="Nhân viên" value="staff" />
          </el-select>
        </el-form-item>
        <el-form-item label="Trạng thái">
          <el-switch v-model="userForm.isActive" active-text="Hoạt động" inactive-text="Ngừng" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showUserDialog = false">Hủy</el-button>
        <el-button type="primary" @click="saveUser" :loading="saving">Lưu</el-button>
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
const users = ref<any[]>([])

const showUserDialog = ref(false)
const editingUser = ref<any>(null)

const userForm = reactive({
  fullName: '',
  email: '',
  password: '',
  phone: '',
  role: 'staff',
  isActive: true,
})

function getAvatarColor(name: string) {
  const colors = ['#f56c6c', '#e6a23c', '#67c23a', '#409eff', '#909399']
  const index = (name?.charCodeAt(0) || 0) % colors.length
  return colors[index]
}

function getRoleType(role: string) {
  const map: Record<string, string> = {
    admin: 'danger',
    manager: 'warning',
    staff: '',
  }
  return map[role] || ''
}

function getRoleLabel(role: string) {
  const map: Record<string, string> = {
    admin: 'Quản trị viên',
    manager: 'Quản lý',
    staff: 'Nhân viên',
  }
  return map[role] || role
}

async function loadUsers() {
  loading.value = true
  try {
    const res = await apiClient.get('/auth/users')
    users.value = res.data.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  editingUser.value = null
  Object.assign(userForm, {
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'staff',
    isActive: true,
  })
}

function editUser(row: any) {
  editingUser.value = row
  Object.assign(userForm, {
    fullName: row.fullName,
    email: row.email,
    password: '',
    phone: row.phone || '',
    role: row.role,
    isActive: row.isActive,
  })
  showUserDialog.value = true
}

async function saveUser() {
  if (!userForm.fullName.trim() || !userForm.email.trim()) {
    ElMessage.warning('Vui lòng nhập đầy đủ thông tin')
    return
  }
  if (!editingUser.value && !userForm.password) {
    ElMessage.warning('Vui lòng nhập mật khẩu')
    return
  }
  saving.value = true
  try {
    const data = { ...userForm }
    if (!data.password) {
      delete (data as any).password
    }
    if (editingUser.value) {
      await apiClient.patch(`/auth/users/${editingUser.value.id}`, data)
      ElMessage.success('Cập nhật thành công')
    } else {
      await apiClient.post('/auth/register', data)
      ElMessage.success('Thêm mới thành công')
    }
    showUserDialog.value = false
    loadUsers()
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || 'Có lỗi xảy ra')
  } finally {
    saving.value = false
  }
}

async function deleteUser(row: any) {
  try {
    await ElMessageBox.confirm('Xóa nhân viên này?', 'Xác nhận', { type: 'warning' })
    await apiClient.delete(`/auth/users/${row.id}`)
    ElMessage.success('Đã xóa')
    loadUsers()
  } catch (e) {
    // User cancelled or error
  }
}

onMounted(() => {
  loadUsers()
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
  
  .user-cell {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .user-info {
      display: flex;
      flex-direction: column;
      
      .name {
        font-weight: 500;
        color: #333;
      }
      
      .email {
        font-size: 12px;
        color: #999;
      }
    }
  }
}
</style>





