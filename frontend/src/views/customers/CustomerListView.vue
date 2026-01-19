<template>
  <!-- Mobile View -->
  <MobileCustomerList v-if="isMobile" />
  
  <!-- Desktop View -->
  <div v-else class="customer-list-page">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">Khách hàng</h1>
      <div class="header-actions">
        <el-button @click="exportCustomers">
          <el-icon><Download /></el-icon> Xuất file
        </el-button>
        <el-button @click="importCustomers">
          <el-icon><Upload /></el-icon> Nhập file
        </el-button>
        <el-button type="primary" @click="$router.push('/customers/create')">
          <el-icon><Plus /></el-icon> Thêm khách hàng
        </el-button>
      </div>
    </div>

    <!-- Tabs & Filters -->
    <el-card class="filter-card">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="Tất cả khách hàng" name="all" />
        <el-tab-pane label="Đang giao dịch" name="active" />
      </el-tabs>

      <div class="filter-row">
        <el-input
          v-model="searchQuery"
          placeholder="Tìm kiếm theo mã khách hàng, tên, SĐT khách hàng"
          clearable
          class="search-input"
          @keyup.enter="loadCustomers"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button @click="showFilterDrawer = true">
          Bộ lọc <el-icon><Filter /></el-icon>
        </el-button>
        <el-button>Lưu bộ lọc</el-button>
      </div>
    </el-card>

    <!-- Filter Drawer -->
    <el-drawer
      v-model="showFilterDrawer"
      title="Bộ lọc"
      direction="rtl"
      size="350px"
      :before-close="handleCloseFilter"
    >
      <div class="filter-content">
        <!-- Bộ lọc nâng cao link -->
        <el-link type="primary" @click="expandAdvancedFilters = !expandAdvancedFilters" class="filter-header">
          <el-icon><ArrowUp v-if="expandAdvancedFilters" /><ArrowDown v-else /></el-icon>
          Bộ lọc nâng cao
        </el-link>

        <!-- Nội bật Section -->
        <div class="filter-section">
          <div class="section-title">Nội bật</div>
          <div class="filter-group">
            <div class="filter-label">Nhóm khách hàng</div>
            <el-input placeholder="Tìm kiếm" size="small" class="filter-search" />
            <div class="checkbox-group">
              <el-checkbox v-model="filters.groups.vip">VIP</el-checkbox>
              <el-checkbox v-model="filters.groups.wholesale">Bán buôn</el-checkbox>
              <el-checkbox v-model="filters.groups.retail">Bán lẻ</el-checkbox>
            </div>
          </div>
        </div>

        <!-- Nhân viên -->
        <div class="filter-section">
          <div class="filter-group">
            <div class="filter-label">Nhân viên</div>
            <el-select v-model="filters.staffId" placeholder="Chọn nhân viên" size="small" style="width: 100%">
              <el-option label="Tất cả" :value="null" />
              <el-option label="Lê Nguyễn Thùy Linh" :value="1" />
            </el-select>
          </div>
        </div>

        <!-- Trạng thái -->
        <div class="filter-section">
          <div class="filter-group">
            <div class="filter-label">Trạng thái</div>
            <el-select v-model="filters.status" placeholder="Chọn trạng thái" size="small" style="width: 100%">
              <el-option label="Tất cả" value="" />
              <el-option label="Đang hoạt động" value="active" />
              <el-option label="Ngừng hoạt động" value="inactive" />
            </el-select>
          </div>
        </div>

        <!-- Tags -->
        <div class="filter-section">
          <div class="filter-group">
            <div class="filter-label">Tags</div>
            <el-select
              v-model="filters.tags"
              multiple
              placeholder="Chọn tags"
              size="small"
              style="width: 100%"
            >
              <el-option label="VIP" value="vip" />
              <el-option label="Thân thiết" value="loyal" />
            </el-select>
          </div>
        </div>

        <!-- Ngày tạo -->
        <div class="filter-section">
          <div class="filter-group">
            <div class="filter-label">Ngày tạo</div>
            <el-date-picker
              v-model="filters.createdDateRange"
              type="daterange"
              range-separator="~"
              start-placeholder="Từ ngày"
              end-placeholder="Đến ngày"
              size="small"
              style="width: 100%"
            />
          </div>
        </div>

        <!-- Khoảng ngày sinh -->
        <div class="filter-section">
          <div class="filter-group">
            <div class="filter-label">Khoảng ngày sinh</div>
            <el-date-picker
              v-model="filters.birthdayRange"
              type="daterange"
              range-separator="~"
              start-placeholder="Từ ngày"
              end-placeholder="Đến ngày"
              size="small"
              style="width: 100%"
            />
          </div>
        </div>

        <!-- Ngày sinh -->
        <div class="filter-section">
          <div class="filter-group">
            <div class="filter-label">Ngày sinh</div>
            <el-date-picker
              v-model="filters.birthday"
              type="date"
              placeholder="Chọn ngày"
              size="small"
              style="width: 100%"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="clearFilters">Xóa bộ lọc</el-button>
          <el-button type="primary" @click="applyFilters">Lọc</el-button>
        </div>
      </template>
    </el-drawer>

    <!-- Customer Table -->
    <el-card class="table-card">
      <el-table
        :data="customers"
        v-loading="loading"
        style="width: 100%"
        @row-click="handleRowClick"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="40" />
        <el-table-column label="" width="40">
          <template #default>
            <el-icon class="row-icon"><Setting /></el-icon>
          </template>
        </el-table-column>
        <el-table-column label="Mã khách hàng" width="140">
          <template #default="{ row }">
            <el-link type="primary" @click.stop="viewCustomer(row)">
              {{ row.customerCode || `KH${String(row.id).padStart(5, '0')}` }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="Tên khách hàng" prop="name" min-width="150">
          <template #default="{ row }">
            {{ row.name }}
          </template>
        </el-table-column>
        <el-table-column label="Số điện thoại" prop="phone" width="130" />
        <el-table-column label="Nhóm khách hàng" width="140">
          <template #default="{ row }">
            {{ row.customerGroup || row.type === 'retail' ? 'Bán lẻ' : 'Bán buôn' }}
          </template>
        </el-table-column>
        <el-table-column label="Công nợ hiện tại" width="140" align="right">
          <template #default="{ row }">
            <span :class="{ 'text-danger': row.debt > 0 }">
              {{ formatCurrency(row.debt || 0) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="Tổng chi tiêu" width="130" align="right">
          <template #default="{ row }">
            {{ formatCurrency(row.totalSpent || 0) }}
          </template>
        </el-table-column>
        <el-table-column label="Tổng SL đơn hàng" width="140" align="right">
          <template #default="{ row }">
            {{ row.totalOrders || 0 }}
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @size-change="loadCustomers"
          @current-change="loadCustomers"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Download, Upload, Search, Setting, Filter, ArrowUp, ArrowDown, ArrowLeft } from '@element-plus/icons-vue'
import { customerService } from '@/services/customer.service'
import { useDevice } from '@/composables/useDevice'
import MobileCustomerList from '@/components/mobile/MobileCustomerList.vue'

const { isMobile } = useDevice()

// Mobile state
const showMobileSearch = ref(false)
const mobileTab = ref('all')

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value || 0)
}

const router = useRouter()

// State
const loading = ref(false)
const customers = ref<any[]>([])
const selectedCustomers = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

// Filters
const searchQuery = ref('')
const activeTab = ref('all')
const showFilterDrawer = ref(false)
const expandAdvancedFilters = ref(true)

const filters = reactive({
  groups: {
    vip: false,
    wholesale: false,
    retail: false,
  },
  staffId: null as number | null,
  status: '',
  tags: [] as string[],
  createdDateRange: null as [Date, Date] | null,
  birthdayRange: null as [Date, Date] | null,
  birthday: null as Date | null,
})

// Methods
async function loadCustomers() {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
      search: searchQuery.value || undefined,
      _t: Date.now(), // Cache bust
    }

    const res = await customerService.getCustomers(params)
    if (res.success) {
      const customersData = res.data?.data || []
      
      // Load order stats for each customer
      const { orderService } = await import('@/services/order.service')
      
      // Fetch customer order stats
      for (const customer of customersData) {
        try {
          const ordersRes = await orderService.getOrders({ 
            customerId: customer.id, 
            pageSize: 1000,
            _t: Date.now()
          })
          const customerOrders = ordersRes.data?.data || ordersRes.data || []
          
          // Calculate stats if not already set
          if (!customer.totalOrders || customer.totalOrders === 0) {
            customer.totalOrders = customerOrders.length
          }
          if (!customer.totalSpent || customer.totalSpent === 0) {
            customer.totalSpent = customerOrders
              .filter((o: any) => o.status !== 'cancelled')
              .reduce((sum: number, o: any) => sum + (parseFloat(o.total) || 0), 0)
          }
          if (!customer.debt || customer.debt === 0) {
            customer.debt = customerOrders
              .filter((o: any) => o.status !== 'cancelled' && o.paymentStatus !== 'paid')
              .reduce((sum: number, o: any) => sum + (parseFloat(o.remainingAmount) || 0), 0)
          }
        } catch (err) {
          // Keep existing values
        }
      }
      
      customers.value = customersData
      total.value = res.data?.total || 0
    }
  } catch (e: any) {
    console.error('Load customers error:', e)
    customers.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function handleTabChange() {
  loadCustomers()
}

function handleRowClick(row: any) {
  router.push(`/customers/${row.id}`)
}

function handleSelectionChange(selection: any[]) {
  selectedCustomers.value = selection
}

function viewCustomer(customer: any) {
  router.push(`/customers/${customer.id}`)
}

function exportCustomers() {
  ElMessage.info('Tính năng xuất file đang được phát triển')
}

function importCustomers() {
  ElMessage.info('Tính năng nhập file đang được phát triển')
}

function handleCloseFilter(done: () => void) {
  done()
}

function clearFilters() {
  filters.groups.vip = false
  filters.groups.wholesale = false
  filters.groups.retail = false
  filters.staffId = null
  filters.status = ''
  filters.tags = []
  filters.createdDateRange = null
  filters.birthdayRange = null
  filters.birthday = null
  loadCustomers()
}

function applyFilters() {
  showFilterDrawer.value = false
  loadCustomers()
}

onMounted(() => {
  loadCustomers()
})
</script>

<style scoped lang="scss">
.customer-list {
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

  .filter-card {
    margin-bottom: 16px;
    border-radius: 8px;

    :deep(.el-tabs__header) {
      margin-bottom: 16px;
    }

    .filter-row {
      display: flex;
      gap: 12px;

      .search-input {
        flex: 1;
        max-width: 500px;
      }
    }
  }

  .table-card {
    border-radius: 8px;

    .row-icon {
      color: #c0c4cc;
      cursor: pointer;

      &:hover {
        color: #409eff;
      }
    }

    .text-danger {
      color: #f56c6c;
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    padding: 16px 0;
  }
}

// Filter Drawer Styles
.filter-content {
  padding: 0 20px 20px;

  .filter-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
    font-size: 14px;
  }

  .filter-section {
    margin-bottom: 20px;

    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 12px;
    }

    .filter-group {
      .filter-label {
        font-size: 13px;
        color: #606266;
        margin-bottom: 8px;
      }

      .filter-search {
        margin-bottom: 12px;
      }

      .checkbox-group {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .el-checkbox {
          margin: 0;
        }
      }
    }
  }
}

.drawer-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
</style>
