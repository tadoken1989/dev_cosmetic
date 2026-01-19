<template>
  <div class="customer-group-list">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">Nhóm khách hàng</h1>
      <div class="header-actions">
        <el-button type="primary" @click="$router.push('/customers/groups/create')">
          <el-icon><Plus /></el-icon> Thêm nhóm khách hàng
        </el-button>
      </div>
    </div>

    <!-- Groups Table -->
    <el-card class="table-card">
      <el-table
        :data="groups"
        v-loading="loading"
        style="width: 100%"
        @row-click="handleRowClick"
      >
        <el-table-column label="Tên nhóm" min-width="150">
          <template #default="{ row }">
            <el-link type="primary" @click.stop="viewGroup(row)">
              {{ row.name }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="Mã nhóm" prop="code" width="140" />
        <el-table-column label="Loại nhóm" width="140">
          <template #default="{ row }">
            {{ row.type || 'Có định' }}
          </template>
        </el-table-column>
        <el-table-column label="Mô tả" prop="description" min-width="200" />
        <el-table-column label="Số lượng khách hàng" width="180" align="right">
          <template #default="{ row }">
            {{ row.customerCount || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="Ngày tạo" width="150">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next, jumper"
          @current-change="loadGroups"
        />
        <span class="page-info">Từ 1 đến {{ groups.length }} trên tổng {{ total }}</span>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const router = useRouter()

// State
const loading = ref(false)
const groups = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

// Default groups
const defaultGroups = [
  {
    id: 1,
    name: 'Vip',
    code: 'VIP',
    type: 'Có định',
    description: '',
    customerCount: 0,
    createdAt: '2021-12-28',
  },
  {
    id: 2,
    name: 'Bán buôn',
    code: 'BANBUON',
    type: 'Có định',
    description: '',
    customerCount: 0,
    createdAt: '2021-12-28',
  },
  {
    id: 3,
    name: 'Bán lẻ',
    code: 'BANLE',
    type: 'Có định',
    description: '',
    customerCount: 454,
    createdAt: '2021-12-28',
  },
]

// Methods
function loadGroups() {
  loading.value = true
  try {
    // Load from localStorage or use defaults
    const savedGroups = localStorage.getItem('customerGroups')
    if (savedGroups) {
      groups.value = JSON.parse(savedGroups)
    } else {
      groups.value = [...defaultGroups]
      localStorage.setItem('customerGroups', JSON.stringify(defaultGroups))
    }
    total.value = groups.value.length
  } catch (e) {
    console.error('Load groups error:', e)
    groups.value = [...defaultGroups]
    total.value = defaultGroups.length
  } finally {
    loading.value = false
  }
}

function handleRowClick(row: any) {
  router.push(`/customers/groups/${row.id}`)
}

function viewGroup(group: any) {
  router.push(`/customers/groups/${group.id}`)
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

onMounted(() => {
  loadGroups()
})
</script>

<style scoped lang="scss">
.customer-group-list {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .page-title {
      font-size: 20px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .table-card {
    border-radius: 8px;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;

    .page-info {
      font-size: 14px;
      color: #606266;
    }
  }
}
</style>




