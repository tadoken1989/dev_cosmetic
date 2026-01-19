<template>
  <div class="customer-detail" v-loading="loading">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="customer-name">{{ customer?.name || 'Khách hàng' }}</h1>
      </div>
      <div class="header-right">
        <el-button type="danger" @click="handleDelete">Xóa khách hàng</el-button>
        <el-dropdown split-button type="primary" @click="handleEdit">
          Cập nhật
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="showCreateReceipt = true">Tạo phiếu thu/chi</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <div class="customer-content" v-if="customer">
      <!-- Thông tin cá nhân -->
      <el-card class="section-card">
        <template #header>
          <div class="card-header">
            <span>Thông tin cá nhân</span>
            <div class="header-actions">
              <el-tabs v-model="activeTab" class="info-tabs">
                <el-tab-pane label="Đang giao dịch" name="active" />
              </el-tabs>
              <el-link type="primary" @click="handleEdit">Cập nhật</el-link>
            </div>
          </div>
        </template>
        
        <div class="info-grid">
          <div class="info-row">
            <span class="label">Ngày sinh</span>
            <span class="value">{{ formatDate(customer.birthday) || '---' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Nhóm khách hàng</span>
            <span class="value">
              <el-link type="primary">{{ customer.customerGroup || 'Bán lẻ' }}</el-link>
            </span>
          </div>
          <div class="info-row">
            <span class="label">Giới tính</span>
            <span class="value">{{ getGender(customer.gender) }}</span>
          </div>
          <div class="info-row">
            <span class="label">Mã khách hàng</span>
            <span class="value">{{ customer.customerCode || `CUZN00${String(customer.id).padStart(3, '0')}` }}</span>
          </div>
          <div class="info-row">
            <span class="label">Số điện thoại</span>
            <span class="value">{{ customer.phone || '---' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Mã số thuế</span>
            <span class="value">---</span>
          </div>
          <div class="info-row">
            <span class="label">Email</span>
            <span class="value">{{ customer.email || '---' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Website</span>
            <span class="value">---</span>
          </div>
          <div class="info-row">
            <span class="label">Nhân viên phụ trách</span>
            <span class="value">{{ customer.staffName || 'Lê Nguyễn Thùy Linh' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Mô tả</span>
            <span class="value">---</span>
          </div>
          <div class="info-row full-width">
            <span class="label">Tags</span>
            <span class="value">---</span>
          </div>
        </div>
      </el-card>

      <!-- Thông tin gợi ý khách hàng -->
      <el-card class="section-card">
        <template #header>
          <div class="card-header">
            <span>Thông tin gợi ý khách hàng</span>
            <el-link type="primary" @click="handleEdit">Cập nhật</el-link>
          </div>
        </template>
        
        <div class="info-grid">
          <div class="info-row">
            <span class="label">Chính sách giá mặc định</span>
            <span class="value">: ---</span>
          </div>
          <div class="info-row">
            <span class="label">Chiết khấu khách hàng</span>
            <span class="value">: ---</span>
          </div>
          <div class="info-row full-width">
            <span class="label">Hình thức thanh toán mặc định</span>
            <span class="value">: ---</span>
          </div>
        </div>
      </el-card>

      <!-- Thông tin mua hàng -->
      <el-card class="section-card">
        <template #header>
          <div class="card-header">
            <span>Thông tin mua hàng</span>
            <el-link type="primary">Chi tiết ▼</el-link>
          </div>
        </template>
        
        <div class="purchase-stats">
          <div class="stat-item">
            <div class="stat-label">Tổng chi tiêu</div>
            <div class="stat-value">: {{ formatCurrency(customer.totalSpent || 0) }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Tổng SL sản phẩm đã mua</div>
            <div class="stat-value">: 0</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Tổng SL đơn hàng</div>
            <div class="stat-value">: {{ customer.totalOrders || 0 }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Tổng SL sản phẩm hoàn trả</div>
            <div class="stat-value">: 0</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Ngày cuối cùng mua hàng</div>
            <div class="stat-value">: {{ formatDate(customer.lastOrderAt) || '---' }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Công nợ hiện tại</div>
            <div class="stat-value text-danger">: {{ formatCurrency(customer.debt || 0) }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Giá trị đơn trung bình</div>
            <div class="stat-value">: 0</div>
          </div>
        </div>
      </el-card>

      <!-- Lịch sử mua hàng - FULL WIDTH -->
      <el-card class="section-card history-card">
        <template #header>
          <el-tabs v-model="historyTab" class="history-tabs">
            <el-tab-pane label="Lịch sử mua hàng" name="orders" />
            <el-tab-pane label="Công nợ" name="debt" />
            <el-tab-pane label="Liên hệ" name="contact" />
            <el-tab-pane label="Địa chỉ" name="address" />
            <el-tab-pane label="Ghi chú" name="note" />
            <el-tab-pane label="Nhóm khách hàng" name="groups" />
          </el-tabs>
        </template>

        <!-- Order History Table -->
        <div v-if="historyTab === 'orders'" class="history-content">
          <el-table :data="orders" style="width: 100%" v-loading="ordersLoading">
            <el-table-column label="Mã đơn hàng" width="140">
              <template #default="{ row }">
                <el-link type="primary" @click="viewOrder(row.id)">{{ row.orderCode }}</el-link>
              </template>
            </el-table-column>
            <el-table-column label="Trạng thái" width="140">
              <template #default="{ row }">
                <el-tag :type="getOrderStatusType(row.status)" size="small">
                  {{ getOrderStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="Thanh toán" width="100" align="center">
              <template #default="{ row }">
                <el-icon v-if="row.paymentStatus === 'paid'" color="#67c23a"><CircleCheckFilled /></el-icon>
                <el-icon v-else color="#909399"><CircleCloseFilled /></el-icon>
              </template>
            </el-table-column>
            <el-table-column label="Giá trị" width="120" align="right">
              <template #default="{ row }">
                {{ formatCurrency(row.total) }}
              </template>
            </el-table-column>
            <el-table-column label="Chi nhánh" prop="branchName" width="150" />
            <el-table-column label="Nguồn đơn" prop="source" width="100" />
            <el-table-column label="Nhân viên xử lý đơn" prop="staffName" min-width="150" />
            <el-table-column label="Ngày ghi nhận" width="150">
              <template #default="{ row }">
                {{ formatDateTime(row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>

          <div v-if="!ordersLoading && orders.length === 0" class="empty-state">
            <el-icon :size="48" color="#c0c4cc"><Box /></el-icon>
            <p>Chưa có đơn hàng nào</p>
          </div>

          <!-- Pagination -->
          <div v-if="orders.length > 0" class="pagination-wrapper">
            <span class="page-info">Hiển thị {{ pageSize }} kết quả - Từ 1 đến {{ orders.length }} trên tổng {{ orderTotal }}</span>
            <el-pagination
              v-model:current-page="orderPage"
              :page-size="pageSize"
              :total="orderTotal"
              layout="prev, pager, next"
              @current-change="loadOrders"
              background
            />
          </div>
        </div>

        <div v-else class="history-content empty-state">
          <p>Nội dung tab {{ historyTab }}</p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Box, CircleCheckFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import { customerService } from '@/services/customer.service'
import { orderService } from '@/services/order.service'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const ordersLoading = ref(false)
const customer = ref<any>(null)
const orders = ref<any[]>([])
const orderPage = ref(1)
const pageSize = ref(20)
const orderTotal = ref(0)
const activeTab = ref('active')
const historyTab = ref('orders')
const showCreateReceipt = ref(false)

async function loadCustomer() {
  loading.value = true
  try {
    const id = Number(route.params.id)
    const res = await customerService.getCustomerById(id)
    if (res.success) {
      customer.value = res.data
    }
  } catch (e) {
    console.error('Load customer error:', e)
    ElMessage.error('Không thể tải thông tin khách hàng')
  } finally {
    loading.value = false
  }
}

async function loadOrders() {
  ordersLoading.value = true
  try {
    const customerId = Number(route.params.id)
    const res = await orderService.getOrders({ 
      customerId, 
      page: orderPage.value,
      pageSize: pageSize.value,
    })
    if (res.success) {
      orders.value = res.data?.data || []
      orderTotal.value = res.data?.total || 0
    }
  } catch (e: any) {
    console.error('Load orders error:', e)
    // Don't show error, just empty list
    orders.value = []
    orderTotal.value = 0
  } finally {
    ordersLoading.value = false
  }
}

function handleEdit() {
  router.push(`/customers/${customer.value.id}/edit`)
}

async function handleDelete() {
  try {
    await ElMessageBox.confirm(
      'Bạn có chắc chắn muốn xóa khách hàng này?',
      'Xác nhận xóa',
      { type: 'warning' }
    )
    await customerService.deleteCustomer(customer.value.id)
    ElMessage.success('Đã xóa khách hàng')
    router.push('/customers')
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error(e.response?.data?.message || 'Xóa khách hàng thất bại')
    }
  }
}

function viewOrder(orderId: number) {
  router.push(`/orders/${orderId}`)
}

function formatDate(dateStr: string | Date) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatDateTime(dateStr: string | Date) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value || 0)
}

function getGender(gender: string) {
  const labels: Record<string, string> = {
    male: 'Nam',
    female: 'Nữ',
    other: 'Khác',
  }
  return labels[gender] || 'Khác'
}

function getOrderStatusType(status: string): 'success' | 'warning' | 'danger' | 'info' | '' {
  switch (status) {
    case 'delivered':
      return 'success'
    case 'shipping':
    case 'confirmed':
      return 'warning'
    case 'pending':
      return 'info'
    case 'cancelled':
      return 'danger'
    default:
      return ''
  }
}

function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Chờ duyệt',
    confirmed: 'Đang giao dịch',
    shipping: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
  }
  return labels[status] || status
}

onMounted(() => {
  loadCustomer()
  loadOrders()
})
</script>

<style scoped lang="scss">
.customer-detail {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .customer-name {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }

    .header-right {
      display: flex;
      gap: 12px;
    }
  }

  .section-card {
    margin-bottom: 16px;
    border-radius: 8px;

    &.history-card {
      :deep(.el-card__body) {
        padding: 0;
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;

      .header-actions {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .info-tabs {
        :deep(.el-tabs__header) {
          margin: 0;
        }
        
        :deep(.el-tabs__nav-wrap::after) {
          display: none;
        }
      }
    }

    .history-tabs {
      :deep(.el-tabs__header) {
        margin: 0;
        padding: 0 20px;
      }
      
      :deep(.el-tabs__nav-wrap::after) {
        display: none;
      }
    }
  }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;

    .info-row {
      display: flex;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;

      &.full-width {
        grid-column: 1 / -1;
      }

      .label {
        color: #606266;
        font-size: 14px;
        width: 200px;
        flex-shrink: 0;
      }

      .value {
        color: #303133;
        flex: 1;
      }
    }
  }

  .purchase-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px 32px;
    padding: 4px 0;

    .stat-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 0;

      .stat-label {
        font-size: 14px;
        color: #606266;
      }

      .stat-value {
        font-size: 14px;
        color: #303133;

        &.text-danger {
          color: #f56c6c;
        }
      }
    }
  }

  .history-content {
    min-height: 200px;
    padding: 20px;

    .empty-state {
      text-align: center;
      padding: 60px 0;
      color: #909399;

      p {
        margin-top: 16px;
      }
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-top: 1px solid #ebeef5;

    .page-info {
      font-size: 14px;
      color: #606266;
    }
  }
}
</style>
