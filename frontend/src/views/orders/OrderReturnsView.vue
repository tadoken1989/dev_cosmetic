<template>
  <div class="order-returns">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">Danh sách đơn trả hàng</h1>
      <div class="header-actions">
        <el-button @click="exportReturns">
          <el-icon><Download /></el-icon> Xuất file
        </el-button>
        <el-button type="primary" @click="showCreateReturnDialog = true">
          <el-icon><Plus /></el-icon> Tạo đơn trả hàng
        </el-button>
      </div>
    </div>

    <!-- Filters -->
    <el-card class="filter-card">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="Tất cả đơn trả" name="all" />
        <el-tab-pane label="Chưa nhận hàng" name="pending" />
        <el-tab-pane label="Chưa hoàn tiền" name="received" />
      </el-tabs>

      <div class="filter-row">
        <el-input
          v-model="searchQuery"
          placeholder="Tìm kiếm theo mã đơn trả hàng, đơn trả, tên, số điện thoại KH"
          clearable
          @keyup.enter="loadReturns"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-date-picker
          v-model="dateFilter"
          type="daterange"
          range-separator="~"
          start-placeholder="Ngày tạo"
          end-placeholder="đến"
        />
        <el-select v-model="staffFilter" placeholder="Nhân viên trả hàng" clearable>
          <el-option label="Tất cả" value="" />
        </el-select>
        <el-select v-model="reasonFilter" placeholder="Lý do trả hàng" clearable>
          <el-option label="Tất cả" value="" />
          <el-option label="Hàng lỗi" value="defect" />
          <el-option label="Không đúng mô tả" value="wrong_desc" />
          <el-option label="Đổi ý" value="change_mind" />
          <el-option label="Khác" value="other" />
        </el-select>
        <el-button>Bộ lọc khác</el-button>
      </div>
    </el-card>

    <!-- Returns Table -->
    <el-card class="table-card">
      <el-table
        :data="returns"
        v-loading="loading"
        style="width: 100%"
        @row-click="handleRowClick"
      >
        <el-table-column type="selection" width="40" />
        <el-table-column label="" width="40">
          <template #default>
            <el-icon class="row-icon"><Setting /></el-icon>
          </template>
        </el-table-column>
        <el-table-column label="Mã đơn trả hàng" width="140">
          <template #default="{ row }">
            <el-link type="primary" @click.stop="viewReturn(row)">{{ row.returnCode }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="Mã đơn hàng" width="120">
          <template #default="{ row }">
            <el-link type="primary" @click.stop="viewOrder(row.orderId)">{{ row.orderCode }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="Mã đơn đổi hàng" width="140">
          <template #default>
            ---
          </template>
        </el-table-column>
        <el-table-column label="Khách hàng" prop="customerName" min-width="150" />
        <el-table-column label="Trạng thái" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Hoàn tiền" width="80" align="center">
          <template #default="{ row }">
            <el-icon v-if="row.isRefunded"><CircleCheckFilled /></el-icon>
            <span v-else>---</span>
          </template>
        </el-table-column>
        <el-table-column label="Tổng tiền" width="120" align="right">
          <template #default="{ row }">
            {{ formatCurrency(row.totalAmount) }}
          </template>
        </el-table-column>
        <el-table-column label="Ngày nhận hàng" width="150">
          <template #default="{ row }">
            {{ formatDate(row.receivedAt) || '---' }}
          </template>
        </el-table-column>
        <el-table-column label="Lý do trả hàng" min-width="150">
          <template #default="{ row }">
            {{ row.reason || '---' }}
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
          @size-change="loadReturns"
          @current-change="loadReturns"
        />
      </div>
    </el-card>

    <!-- Create Return Dialog -->
    <el-dialog v-model="showCreateReturnDialog" title="Tạo đơn trả hàng" width="600px">
      <el-form :model="returnForm" label-width="120px">
        <el-form-item label="Mã đơn hàng" required>
          <el-input v-model="returnForm.orderCode" placeholder="Nhập mã đơn hàng cần trả" />
        </el-form-item>
        <el-form-item label="Lý do trả hàng">
          <el-input v-model="returnForm.reason" type="textarea" :rows="3" placeholder="Nhập lý do" />
        </el-form-item>
        <el-form-item label="Số tiền hoàn">
          <el-input-number v-model="returnForm.refundAmount" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="Ghi chú">
          <el-input v-model="returnForm.note" type="textarea" :rows="2" placeholder="Ghi chú thêm" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateReturnDialog = false">Hủy</el-button>
        <el-button type="primary" @click="createReturn" :loading="creating">Tạo đơn trả</el-button>
      </template>
    </el-dialog>

    <!-- Return Detail Dialog -->
    <el-dialog v-model="showDetailDialog" :title="`Chi tiết đơn trả ${selectedReturn?.returnCode}`" width="700px">
      <div v-if="selectedReturn" class="return-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="Mã đơn trả">{{ selectedReturn.returnCode }}</el-descriptions-item>
          <el-descriptions-item label="Mã đơn hàng">{{ selectedReturn.orderCode }}</el-descriptions-item>
          <el-descriptions-item label="Khách hàng">{{ selectedReturn.customerName }}</el-descriptions-item>
          <el-descriptions-item label="Trạng thái">
            <el-tag :type="getStatusType(selectedReturn.status)">
              {{ getStatusLabel(selectedReturn.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Tổng tiền">{{ formatCurrency(selectedReturn.totalAmount) }}</el-descriptions-item>
          <el-descriptions-item label="Hoàn tiền">{{ formatCurrency(selectedReturn.refundAmount) }}</el-descriptions-item>
          <el-descriptions-item label="Lý do" :span="2">{{ selectedReturn.reason || 'Không có' }}</el-descriptions-item>
          <el-descriptions-item label="Ghi chú" :span="2">{{ selectedReturn.note || 'Không có' }}</el-descriptions-item>
          <el-descriptions-item label="Ngày tạo">{{ formatDate(selectedReturn.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="Ngày nhận hàng">{{ formatDate(selectedReturn.receivedAt) || 'Chưa nhận' }}</el-descriptions-item>
        </el-descriptions>

        <h4 style="margin-top: 20px">Sản phẩm trả</h4>
        <el-table :data="selectedReturn.items" size="small" style="width: 100%">
          <el-table-column label="Sản phẩm" prop="productName" />
          <el-table-column label="SKU" prop="sku" width="100" />
          <el-table-column label="SL" prop="quantity" width="60" align="center" />
          <el-table-column label="Đơn giá" width="100" align="right">
            <template #default="{ row }">{{ formatCurrency(row.unitPrice) }}</template>
          </el-table-column>
          <el-table-column label="Thành tiền" width="100" align="right">
            <template #default="{ row }">{{ formatCurrency(row.total) }}</template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showDetailDialog = false">Đóng</el-button>
          <el-button
            v-if="selectedReturn?.status === 'pending'"
            type="success"
            @click="markAsReceived"
          >
            Đã nhận hàng
          </el-button>
          <el-button
            v-if="selectedReturn?.status === 'received' && !selectedReturn?.isRefunded"
            type="primary"
            @click="markAsRefunded"
          >
            Đã hoàn tiền
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Plus, Download, Search, Setting, CircleCheckFilled
} from '@element-plus/icons-vue'
import { orderService } from '@/services/order.service'

const router = useRouter()

// State
const loading = ref(false)
const returns = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

// Filters
const searchQuery = ref('')
const dateFilter = ref<[Date, Date] | null>(null)
const staffFilter = ref('')
const reasonFilter = ref('')
const activeTab = ref('all')

// Create dialog
const showCreateReturnDialog = ref(false)
const creating = ref(false)
const returnForm = reactive({
  orderCode: '',
  reason: '',
  refundAmount: 0,
  note: '',
})

// Detail dialog
const showDetailDialog = ref(false)
const selectedReturn = ref<any>(null)

// Methods
async function loadReturns() {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
      search: searchQuery.value || undefined,
    }

    if (activeTab.value === 'pending') {
      params.status = 'pending'
    } else if (activeTab.value === 'received') {
      params.status = 'received'
    }

    if (dateFilter.value) {
      params.startDate = dateFilter.value[0].toISOString()
      params.endDate = dateFilter.value[1].toISOString()
    }

    const res = await orderService.getReturns(params)
    if (res.success) {
      returns.value = res.data?.data || []
      total.value = res.data?.total || 0
    }
  } catch (e: any) {
    console.error('Load returns error:', e)
    // Don't show error for initial load
    returns.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function handleTabChange() {
  loadReturns()
}

function handleRowClick(row: any) {
  viewReturn(row)
}

function viewReturn(returnItem: any) {
  selectedReturn.value = returnItem
  showDetailDialog.value = true
}

function viewOrder(orderId: number) {
  router.push(`/orders/${orderId}`)
}

async function createReturn() {
  if (!returnForm.orderCode) {
    ElMessage.warning('Vui lòng nhập mã đơn hàng')
    return
  }

  creating.value = true
  try {
    // First find the order
    const orderRes = await orderService.getOrderByCode(returnForm.orderCode)
    if (!orderRes.success) {
      ElMessage.error('Không tìm thấy đơn hàng')
      return
    }

    const order = orderRes.data
    const returnData = {
      orderId: order.id,
      orderCode: order.orderCode,
      customerName: order.customerName,
      customerId: order.customerId,
      reason: returnForm.reason,
      refundAmount: returnForm.refundAmount,
      totalAmount: returnForm.refundAmount,
      note: returnForm.note,
      items: order.items?.map((item: any) => ({
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
        reason: returnForm.reason,
      })) || [],
    }

    const res = await orderService.createReturn(returnData)
    if (res.success) {
      ElMessage.success('Tạo đơn trả hàng thành công')
      showCreateReturnDialog.value = false
      returnForm.orderCode = ''
      returnForm.reason = ''
      returnForm.refundAmount = 0
      returnForm.note = ''
      loadReturns()
    }
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || 'Tạo đơn trả hàng thất bại')
  } finally {
    creating.value = false
  }
}

async function markAsReceived() {
  try {
    const res = await orderService.updateReturnStatus(selectedReturn.value.id, 'received')
    if (res.success) {
      ElMessage.success('Đã cập nhật trạng thái')
      selectedReturn.value = res.data
      loadReturns()
    }
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || 'Cập nhật thất bại')
  }
}

async function markAsRefunded() {
  try {
    const res = await orderService.updateReturnStatus(selectedReturn.value.id, 'refunded')
    if (res.success) {
      ElMessage.success('Đã cập nhật trạng thái hoàn tiền')
      selectedReturn.value = res.data
      loadReturns()
    }
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || 'Cập nhật thất bại')
  }
}

function exportReturns() {
  ElMessage.info('Tính năng xuất file đang được phát triển')
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value || 0)
}

function formatDate(dateStr: string) {
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

function getStatusType(status: string): 'success' | 'warning' | 'danger' | 'info' | '' {
  switch (status) {
    case 'refunded':
      return 'success'
    case 'received':
      return 'info'
    case 'pending':
      return 'warning'
    case 'cancelled':
      return 'danger'
    default:
      return ''
  }
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Chờ nhận',
    received: 'Đã nhận',
    refunded: 'Đã hoàn tiền',
    cancelled: 'Đã hủy',
  }
  return labels[status] || status
}

onMounted(() => {
  loadReturns()
})
</script>

<style scoped lang="scss">
.order-returns {
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
      flex-wrap: wrap;

      .el-input {
        flex: 1;
        min-width: 300px;
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
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    padding: 16px 0;
  }

  .return-detail {
    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
  }
}
</style>

