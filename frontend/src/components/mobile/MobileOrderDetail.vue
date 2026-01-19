<template>
  <div class="mobile-order-detail" v-loading="loading">
    <!-- Header -->
    <div class="mobile-header">
      <div class="header-left" @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="page-title">{{ order?.orderCode }}</div>
      <div class="header-right">
        <el-icon @click="handlePrint"><Printer /></el-icon>
        <el-icon @click="showMoreMenu = true"><Share /></el-icon>
      </div>
    </div>

    <div class="mobile-content" v-if="order">
      <!-- Timeline -->
      <div class="timeline-section">
        <div class="timeline-track">
          <div class="timeline-item active">
            <div class="timeline-dot"><el-icon><Check /></el-icon></div>
            <div class="timeline-label">Đặt hàng</div>
            <div class="timeline-time">{{ formatTime(order.createdAt) }}</div>
          </div>
          <div class="timeline-line" :class="{ active: order.status === 'confirmed' || order.status === 'delivered' }"></div>
          <div class="timeline-item" :class="{ active: order.status === 'confirmed' || order.status === 'delivered' }">
            <div class="timeline-dot"><el-icon v-if="order.status === 'confirmed' || order.status === 'delivered'"><Check /></el-icon></div>
            <div class="timeline-label">Duyệt</div>
            <div class="timeline-time">{{ formatTime(order.confirmedAt) }}</div>
          </div>
          <div class="timeline-line" :class="{ active: order.packagingCode && order.packagingStatus === 'packed' }"></div>
          <div class="timeline-item" :class="{ active: order.packagingCode && order.packagingStatus === 'packed' }">
            <div class="timeline-dot"><el-icon v-if="order.packagingCode && order.packagingStatus === 'packed'"><Check /></el-icon></div>
            <div class="timeline-label">Đóng gói</div>
            <div class="timeline-time">{{ order.packagingCode || '' }}</div>
          </div>
          <div class="timeline-line" :class="{ active: order.status === 'shipped' || order.status === 'delivered' }"></div>
          <div class="timeline-item" :class="{ active: order.status === 'shipped' || order.status === 'delivered' }">
            <div class="timeline-dot"><el-icon v-if="order.status === 'shipped' || order.status === 'delivered'"><Check /></el-icon></div>
            <div class="timeline-label">Xuất kho</div>
            <div class="timeline-time">{{ formatTime(order.shippedAt || order.deliveredAt) }}</div>
          </div>
          <div class="timeline-line" :class="{ active: order.status === 'delivered' }"></div>
          <div class="timeline-item" :class="{ active: order.status === 'delivered' }">
            <div class="timeline-dot"><el-icon v-if="order.status === 'delivered'"><Check /></el-icon></div>
            <div class="timeline-label">Hoàn thành</div>
            <div class="timeline-time">{{ formatTime(order.deliveredAt) }}</div>
          </div>
        </div>
      </div>

      <!-- Order Info Card -->
      <div class="order-info-card">
        <div class="total-row">
          <span class="total-amount">{{ formatCurrency(order.total) }}</span>
          <el-button type="primary" @click="sendInvoice">Gửi hoá đơn</el-button>
        </div>
        <div class="info-text">Bán bởi {{ order.staffName || 'Lê Nguyễn Thuỳ Linh' }}</div>
        <div class="info-text">Chi nhánh {{ order.branchName || 'Chi nhánh mặc định' }}</div>
        <div class="info-text">Nguồn {{ order.source || 'Web' }}</div>
        <div class="status-badges">
          <div class="badge">
            <span class="dot" :class="order.paymentStatus === 'paid' ? 'success' : 'warning'"></span>
            <span>{{ getPaymentStatusLabel(order.paymentStatus) }}</span>
          </div>
          <div class="badge" v-if="order.status === 'delivered'">
            <span class="dot success"></span>
            <span>Đã giao hàng</span>
          </div>
        </div>
      </div>

      <!-- Customer -->
      <div class="section-card">
        <div class="customer-row">
          <el-icon><User /></el-icon>
          <span>{{ order.customerName || 'Khách lẻ' }}</span>
          <a class="phone" v-if="order.customerPhone" :href="'tel:' + order.customerPhone">- {{ order.customerPhone }}</a>
        </div>
      </div>

      <!-- Shipping Address -->
      <div class="section-card" v-if="order.customerAddress">
        <div class="section-title">ĐỊA CHỈ GIAO HÀNG</div>
        <div class="address-info">
          <div>{{ order.receiverName || order.customerName }} - <a :href="'tel:' + (order.receiverPhone || order.customerPhone)">{{ order.receiverPhone || order.customerPhone }}</a></div>
          <div>{{ order.customerAddress }}</div>
        </div>
      </div>

      <!-- Products -->
      <div class="section-card">
        <div class="section-title">Sản phẩm ({{ order.items?.length || 0 }})</div>
        <div class="product-item" v-for="item in order.items" :key="item.id">
          <div class="product-image-wrap">
            <img :src="item.imageUrl || '/placeholder-product.png'" class="product-image" />
            <span class="quantity-badge">{{ item.quantity }}</span>
          </div>
          <div class="product-info">
            <div class="product-name">{{ item.productName }}</div>
            <div class="product-sku">SKU: {{ item.sku || 'N/A' }}</div>
            <div class="product-price">{{ formatCurrency(item.unitPrice || item.price) }}</div>
          </div>
          <div class="product-total">{{ formatCurrency((item.unitPrice || item.price) * item.quantity) }}</div>
        </div>
      </div>

      <!-- Summary -->
      <div class="section-card summary-card">
        <div class="summary-row">
          <span>Tổng tiền hàng</span>
          <span>{{ formatCurrency(order.subtotal || calculateSubtotal()) }}</span>
        </div>
        <div class="summary-row">
          <span>Thuế</span>
          <span>{{ formatCurrency(order.tax || 0) }}</span>
        </div>
        <div class="summary-row">
          <span>Chiết khấu</span>
          <span>{{ formatCurrency(order.discount || 0) }}</span>
        </div>
        <div class="summary-row">
          <span>Phí giao hàng</span>
          <span>{{ formatCurrency(order.shippingFee || 0) }}</span>
        </div>
        <div class="summary-row total">
          <span>Khách hàng phải trả</span>
          <span class="total-value">{{ formatCurrency(order.total) }}</span>
        </div>
      </div>

      <!-- Payment Status Section -->
      <div class="section-card" v-if="order.paymentStatus === 'paid'">
        <div class="status-row">
          <el-icon class="check-icon"><CircleCheck /></el-icon>
          <span>Thanh toán toàn bộ</span>
        </div>
        <div class="payment-detail">
          <div class="method">{{ getPaymentMethodLabel(order.paymentMethod) }}</div>
          <div class="payment-info">
            <span>{{ formatDateTime(order.paidAt || order.updatedAt) }}</span>
            <span class="amount">{{ formatCurrency(order.paidAmount || order.total) }}</span>
          </div>
        </div>
      </div>

      <!-- Delivery Status Section (when shipped/delivered) -->
      <div class="section-card" v-if="order.status === 'shipped' || order.status === 'delivered'">
        <div class="status-row">
          <el-icon class="check-icon"><CircleCheck /></el-icon>
          <span>{{ order.status === 'delivered' ? 'Đã giao hàng toàn bộ' : 'Đang giao hàng' }}</span>
        </div>
        <div class="delivery-detail">
          <div class="delivery-row">
            <span class="code">{{ order.trackingCode || generateTrackingCode() }}</span>
            <el-link type="primary">{{ order.status === 'delivered' ? 'Đã giao hàng' : 'Chờ lấy hàng' }} ›</el-link>
          </div>
          <div class="delivery-method">{{ getShippingMethodLabel(order.shippingMethod) }}</div>
        </div>
      </div>

      <!-- Notes -->
      <div class="section-card action-card">
        <span class="action-text">Thêm ghi chú</span>
        <el-icon><Edit /></el-icon>
      </div>

      <!-- Tags -->
      <div class="section-card action-card">
        <span>Tag ({{ order.tags?.length || 0 }})</span>
        <el-link type="primary">Sửa</el-link>
      </div>

      <!-- Bottom spacer for actions -->
      <div style="height: 100px;"></div>
    </div>

    <!-- Dynamic Bottom Actions based on status (same logic as desktop) -->
    <div class="bottom-actions">
      <!-- Pending: Need approval -->
      <template v-if="order?.status === 'pending'">
        <el-button type="primary" class="main-btn" @click="handleApprove">Duyệt đơn</el-button>
        <el-button class="more-btn" @click="showMoreMenu = true"><el-icon><More /></el-icon></el-button>
      </template>

      <!-- Confirmed: Need payment -->
      <template v-else-if="order?.status === 'confirmed' && order?.paymentStatus !== 'paid'">
        <el-button type="primary" class="main-btn" @click="openPaymentDialog">Thanh toán</el-button>
        <el-button class="more-btn" @click="showMoreMenu = true"><el-icon><More /></el-icon></el-button>
      </template>

      <!-- Confirmed + Paid + Has packagingCode: Show Xuất kho -->
      <template v-else-if="order?.status === 'confirmed' && order?.paymentStatus === 'paid' && order?.packagingCode && order?.packagingStatus === 'packed'">
        <el-button type="primary" class="main-btn" @click="handleExportStock">Xuất kho</el-button>
        <el-button class="more-btn" @click="showMoreMenu = true"><el-icon><More /></el-icon></el-button>
      </template>

      <!-- Confirmed + Paid but no packing: Need shipping method -->
      <template v-else-if="order?.status === 'confirmed' && order?.paymentStatus === 'paid'">
        <el-button type="primary" class="main-btn" @click="showShippingPicker = true">Đóng gói và giao hàng</el-button>
        <el-button class="more-btn" @click="showMoreMenu = true"><el-icon><More /></el-icon></el-button>
      </template>

      <!-- Delivered: Complete - Only show Copy button (cannot cancel after export) -->
      <template v-else-if="order?.status === 'delivered'">
        <el-button class="copy-btn full-width" @click="handleCopy">
          <el-icon><CopyDocument /></el-icon>
          Sao chép đơn hàng
        </el-button>
      </template>

      <!-- Default: Show more button -->
      <template v-else>
        <el-button class="more-btn full-width" @click="showMoreMenu = true"><el-icon><More /></el-icon></el-button>
      </template>
    </div>

    <!-- Payment Dialog -->
    <el-dialog v-model="showPaymentDialog" title="Thanh toán" width="90%" :close-on-click-modal="false">
      <div class="payment-dialog">
        <div class="payment-row">
          <span>Còn phải trả</span>
          <span class="amount-highlight">{{ formatCurrency(order?.remainingAmount || order?.total) }}</span>
        </div>
        <div class="payment-input-row">
          <span>Số tiền</span>
          <div class="amount-input">
            <el-button @click="paymentAmount = Math.max(0, paymentAmount - 10000)">-</el-button>
            <el-input-number v-model="paymentAmount" :min="0" :max="order?.remainingAmount || order?.total" :controls="false" />
            <el-button @click="paymentAmount = Math.min(order?.remainingAmount || order?.total, paymentAmount + 10000)">+</el-button>
          </div>
        </div>
        <div class="payment-method-row">
          <span>Phương thức</span>
          <el-select v-model="selectedPaymentMethod" style="width: 180px;">
            <el-option v-for="m in paymentMethods" :key="m.value" :label="m.name" :value="m.value" />
          </el-select>
        </div>
      </div>
      <template #footer>
        <el-button @click="showPaymentDialog = false">Hủy</el-button>
        <el-button type="primary" @click="confirmPayment" :loading="paymentLoading">Xác nhận</el-button>
      </template>
    </el-dialog>

    <!-- Shipping Method Picker -->
    <el-drawer v-model="showShippingPicker" direction="btt" size="auto" :show-close="false">
      <template #header>
        <span style="font-weight: 600;">Chọn phương thức giao hàng</span>
      </template>
      <div class="picker-list">
        <div class="picker-item" @click="handleShipping('carrier')">Đẩy đơn qua hãng vận chuyển</div>
        <div class="picker-item" @click="handleShipping('self')">Tự gọi shipper</div>
        <div class="picker-item" @click="handleShipping('pickup')">Nhận tại cửa hàng</div>
      </div>
    </el-drawer>

    <!-- More Menu -->
    <el-drawer v-model="showMoreMenu" direction="btt" size="auto" :show-close="false">
      <div class="menu-list">
        <div class="menu-item" v-if="order?.status !== 'delivered'" @click="handlePackAndShip">
          <el-icon><Van /></el-icon>
          <span>Đóng gói và giao hàng</span>
        </div>
        <div class="menu-item" @click="handleEdit">
          <el-icon><Edit /></el-icon>
          <span>Sửa đơn hàng</span>
        </div>
        <div class="menu-item" @click="handleGetQR">
          <el-icon><Document /></el-icon>
          <span>Lấy mã QR</span>
        </div>
        <div class="menu-item danger" v-if="order?.status !== 'delivered'" @click="handleCancel">
          <el-icon><CircleClose /></el-icon>
          <span>Huỷ đơn hàng</span>
        </div>
        <div class="menu-item" @click="handlePrint">
          <el-icon><Printer /></el-icon>
          <span>In đơn hàng</span>
        </div>
        <div class="menu-item" @click="handleCopy">
          <el-icon><CopyDocument /></el-icon>
          <span>Sao chép</span>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  ArrowLeft, Printer, Check, User, CircleCheck, Edit, CopyDocument, Van, Document, CircleClose
} from '@element-plus/icons-vue'
import { orderService } from '@/services/order.service'

const Share = { template: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/></svg>` }
const More = { template: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>` }

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const order = ref<any>(null)
const showMoreMenu = ref(false)
const showPaymentDialog = ref(false)
const showShippingPicker = ref(false)
const paymentAmount = ref(0)
const paymentLoading = ref(false)
const selectedPaymentMethod = ref('cash')

// Status flow (same as desktop): pending → confirmed → delivered
// Timeline uses direct checks in template (same as desktop)
const paymentMethods = [
  { name: 'Tiền mặt', value: 'cash' },
  { name: 'Chuyển khoản', value: 'bank' },
  { name: 'Ví Shopee', value: 'shopee' },
  { name: 'Quẹt thẻ', value: 'card' }
]

function generateTrackingCode(): string {
  return 'FUN' + String(order.value?.id || 0).padStart(5, '0')
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value || 0)
}

function formatTime(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}\n${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}

function formatDateTime(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getDate()}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}, ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function getPaymentStatusLabel(status: string) {
  const labels: Record<string, string> = {
    unpaid: 'Chưa thanh toán',
    partial: 'Thanh toán một phần',
    paid: 'Thanh toán toàn bộ'
  }
  return labels[status] || status
}

function getPaymentMethodLabel(method: string) {
  const labels: Record<string, string> = {
    cash: 'Tiền mặt',
    bank: 'Chuyển khoản',
    card: 'Quẹt thẻ',
    shopee: 'Ví Shopee'
  }
  return labels[method] || 'Tiền mặt'
}

function getShippingMethodLabel(method: string) {
  const labels: Record<string, string> = {
    carrier: 'Hãng vận chuyển',
    self: 'Tự gọi shipper',
    pickup: 'Nhận tại cửa hàng'
  }
  return labels[method] || 'Nhận tại cửa hàng'
}

function calculateSubtotal() {
  if (!order.value?.items) return 0
  return order.value.items.reduce((sum: number, item: any) => 
    sum + (item.unitPrice || item.price) * item.quantity, 0
  )
}

async function loadOrder() {
  loading.value = true
  try {
    const id = Number(route.params.id)
    // Use same method as desktop: getOrderById with cache bypass
    const res = await orderService.getOrderById(id, { _t: Date.now() })
    if (res.success) {
      order.value = res.data
      console.log('Order loaded:', order.value?.status, order.value?.packagingCode, order.value?.packagingStatus)
    } else {
      ElMessage.error('Không tìm thấy đơn hàng')
    }
  } catch (e: any) {
    console.error('Load order error:', e)
    ElMessage.error('Lỗi tải đơn hàng')
  } finally {
    loading.value = false
  }
}

// ========== ORDER ACTIONS ==========

async function handleApprove() {
  try {
    await orderService.updateOrderStatus(Number(route.params.id), 'confirmed')
    ElMessage.success('Đã duyệt đơn hàng')
    loadOrder()
  } catch (e: any) {
    ElMessage.error(e.message || 'Lỗi duyệt đơn')
  }
}

function openPaymentDialog() {
  // Set default payment amount to remaining amount
  const remaining = parseFloat(String(order.value?.remainingAmount)) || parseFloat(String(order.value?.total)) || 0
  paymentAmount.value = remaining
  selectedPaymentMethod.value = 'cash'
  showPaymentDialog.value = true
}

async function confirmPayment() {
  if (paymentAmount.value <= 0) {
    ElMessage.warning('Vui lòng nhập số tiền thanh toán')
    return
  }
  
  paymentLoading.value = true
  try {
    const now = new Date().toISOString()
    // Same logic as desktop
    const res = await orderService.addPayment(Number(route.params.id), paymentAmount.value)
    if (res.success) {
      ElMessage.success('Thanh toán thành công')
      showPaymentDialog.value = false
      
      // Update order: confirmed + create packaging code after payment (same as desktop)
      await orderService.updateOrder(Number(route.params.id), {
        status: 'confirmed',
        confirmedAt: now,
        packagingStatus: 'packed',
        packagingCode: `FUN${String(Date.now()).slice(-5)}`,
        paymentStatus: 'paid',
        paymentMethod: selectedPaymentMethod.value,
        paidAt: now,
        paidAmount: order.value.total,
        remainingAmount: 0,
      })
      
      loadOrder()
    }
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || e.message || 'Lỗi thanh toán')
  } finally {
    paymentLoading.value = false
  }
}

async function handleShipping(method: string) {
  showShippingPicker.value = false
  try {
    // Same as desktop: generate packaging code and update shipping method
    const packagingCode = `FUN${String(Date.now()).slice(-4)}${Math.floor(Math.random() * 10)}`
    
    const res = await orderService.updateOrder(Number(route.params.id), {
      shippingMethod: method,
      packagingCode,
      packagingStatus: 'packed',
    })
    
    if (res.success) {
      ElMessage.success('Đã tạo đơn giao hàng thành công')
      loadOrder()
    }
  } catch (e: any) {
    ElMessage.error(e.message || 'Tạo đơn giao hàng thất bại')
  }
}

async function handleExportStock() {
  try {
    await ElMessageBox.confirm('Xác nhận xuất kho và hoàn thành đơn hàng?', 'Xuất kho', {
      confirmButtonText: 'Xuất kho',
      cancelButtonText: 'Hủy',
      type: 'warning'
    })
    
    loading.value = true
    // Use same logic as desktop: updateOrder with status + timestamps
    const now = new Date().toISOString()
    const res = await orderService.updateOrder(Number(route.params.id), {
      status: 'delivered',
      shippedAt: now,
      deliveredAt: now,
    })
    
    if (res.success) {
      ElMessage.success('Đã xuất kho thành công')
      await loadOrder()
    } else {
      ElMessage.error(res.message || 'Xuất kho thất bại')
    }
  } catch (e: any) {
    if (e !== 'cancel') {
      console.error('Export error:', e)
      ElMessage.error(e.response?.data?.message || e.message || 'Xuất kho thất bại')
    }
  } finally {
    loading.value = false
  }
}

function handlePackAndShip() {
  showMoreMenu.value = false
  showShippingPicker.value = true
}

function handlePrint() {
  showMoreMenu.value = false
  ElMessage.info('In đơn hàng...')
}

function sendInvoice() {
  ElMessage.info('Gửi hoá đơn...')
}

function handleEdit() {
  showMoreMenu.value = false
  router.push(`/orders/${route.params.id}/edit`)
}

function handleGetQR() {
  showMoreMenu.value = false
  ElMessage.info('Lấy mã QR...')
}

async function handleCancel() {
  showMoreMenu.value = false
  try {
    await ElMessageBox.confirm('Bạn có chắc muốn hủy đơn hàng này?', 'Xác nhận', {
      confirmButtonText: 'Hủy đơn',
      cancelButtonText: 'Không',
      type: 'warning'
    })
    await orderService.cancelOrder(Number(route.params.id))
    ElMessage.success('Đã hủy đơn hàng')
    router.back()
  } catch {
    // Cancelled
  }
}

function handleCopy() {
  showMoreMenu.value = false
  router.push(`/orders/create?copy=${route.params.id}`)
}

onMounted(() => {
  loadOrder()
})
</script>

<style scoped lang="scss">
.mobile-order-detail {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.mobile-header {
  background: #fff;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e4e7ed;

  .header-left .el-icon { font-size: 24px; cursor: pointer; color: #303133; }
  .page-title { flex: 1; text-align: center; font-size: 17px; font-weight: 600; }
  .header-right { 
    display: flex; 
    gap: 16px;
    .el-icon { font-size: 20px; cursor: pointer; color: #606266; }
  }
}

.mobile-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.timeline-section {
  background: #fff;
  padding: 12px 8px;
  margin-bottom: 8px;
  overflow-x: auto;

  .timeline-track {
    display: flex;
    align-items: flex-start;
    min-width: 360px;
  }

  .timeline-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 60px;
    flex: 1;

    .timeline-dot {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 2px solid #e4e7ed;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 4px;

      .el-icon { font-size: 11px; color: #e4e7ed; }
    }

    &.active .timeline-dot {
      background: #409eff;
      border-color: #409eff;
      .el-icon { color: #fff; }
    }

    .timeline-label { font-size: 10px; color: #909399; margin-bottom: 2px; }
    &.active .timeline-label { color: #409eff; font-weight: 500; }
    .timeline-time { font-size: 9px; color: #c0c4cc; text-align: center; white-space: pre-line; line-height: 1.2; }
  }

  .timeline-line {
    flex: 1;
    height: 2px;
    background: #e4e7ed;
    margin: 10px 2px;
    min-width: 20px;
    &.active { background: #409eff; }
  }
}

.order-info-card {
  background: #fff;
  padding: 20px 16px;
  margin-bottom: 8px;

  .total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    .total-amount { font-size: 28px; font-weight: 700; color: #303133; }
  }

  .info-text { font-size: 13px; color: #909399; margin-bottom: 4px; }

  .status-badges {
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .badge {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #606266;

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        &.success { background: #67c23a; }
        &.warning { background: #e6a23c; }
        &.danger { background: #f56c6c; }
      }
    }
  }
}

.section-card {
  background: #fff;
  padding: 16px;
  margin-bottom: 8px;

  .section-title { font-size: 15px; font-weight: 600; margin-bottom: 16px; }
  .customer-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 500;
    .el-icon { color: #606266; }
    .phone { color: #409eff; font-weight: normal; text-decoration: none; }
  }
  
  .address-info {
    font-size: 14px;
    color: #303133;
    line-height: 1.6;
    a { color: #409eff; text-decoration: none; }
  }
}

.product-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
  &:last-child { border-bottom: none; }

  .product-image-wrap {
    position: relative;
    .product-image { width: 60px; height: 60px; border-radius: 6px; object-fit: cover; background: #f5f7fa; }
    .quantity-badge {
      position: absolute;
      top: -6px;
      right: -6px;
      background: #409eff;
      color: #fff;
      font-size: 11px;
      padding: 2px 6px;
      border-radius: 10px;
    }
  }

  .product-info {
    flex: 1;
    .product-name { font-size: 14px; font-weight: 500; margin-bottom: 4px; }
    .product-sku { font-size: 12px; color: #909399; margin-bottom: 4px; }
    .product-price { font-size: 13px; color: #606266; }
  }
  .product-total { font-size: 14px; font-weight: 600; color: #303133; }
}

.summary-card .summary-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  font-size: 14px;
  border-bottom: 1px solid #f5f5f5;
  &:last-child { border-bottom: none; }
  &.total {
    padding-top: 12px;
    font-weight: 600;
    .total-value { font-size: 16px; color: #f56c6c; }
  }
}

.status-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  .check-icon { color: #67c23a; font-size: 20px; }
  .delivery-icon { color: #409eff; font-size: 20px; }
  span { font-size: 14px; font-weight: 500; }
}

.payment-detail, .delivery-detail {
  padding-left: 28px;
  .method { font-size: 14px; margin-bottom: 4px; }
  .payment-info, .delivery-row {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: #909399;
    .amount { font-weight: 500; color: #303133; }
    .code { font-size: 14px; color: #303133; }
  }
  .delivery-method { font-size: 13px; color: #909399; margin-top: 4px; }
}

.action-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .action-text { color: #409eff; font-size: 14px; }
  .el-icon { color: #409eff; }
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 0));
  border-top: 1px solid #e4e7ed;
  display: flex;
  gap: 12px;

  .main-btn { flex: 1; height: 48px; font-size: 16px; border-radius: 8px; }
  .cancel-btn, .copy-btn { flex: 1; height: 44px; font-size: 15px; border-radius: 8px; }
  .cancel-btn { color: #f56c6c; border-color: #f56c6c; background: #fff; }
  .copy-btn { 
    border-color: #dcdfe6; 
    background: #fff; 
    .el-icon { margin-right: 4px; }
    &.full-width { width: 100%; }
  }
  .more-btn { 
    width: 48px; 
    height: 48px; 
    padding: 0; 
    border-radius: 8px; 
    flex-shrink: 0; 
    &.full-width { flex: 1; width: auto; }
  }
}

.picker-list, .menu-list {
  .picker-item, .menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 18px 20px;
    font-size: 15px;
    color: #303133;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    &:active { background: #f5f7fa; }
    &.danger { color: #f56c6c; }
    .el-icon { font-size: 20px; color: #606266; }
    &.danger .el-icon { color: #f56c6c; }
  }
}

.payment-dialog {
  .payment-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    
    .amount-highlight {
      font-size: 18px;
      font-weight: 600;
      color: #f56c6c;
    }
  }
  
  .payment-input-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid #f0f0f0;
    
    .amount-input {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .el-input-number {
        width: 120px;
        
        :deep(.el-input__inner) {
          text-align: center;
        }
      }
      
      .el-button {
        padding: 8px 12px;
      }
    }
  }
  
  .payment-method-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
  }
}
</style>
