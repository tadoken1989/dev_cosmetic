<template>
  <!-- Mobile View -->
  <MobileOrderDetail v-if="isMobile" />
  
  <!-- Desktop View -->
  <div v-else class="order-detail" v-loading="loading">
    <!-- Header -->
    <div class="page-header-bar">
      <div class="header-left">
        <el-button :icon="ArrowLeft" @click="$router.push('/orders')">
          Quay lại danh sách đơn hàng
        </el-button>
      </div>
      <div class="header-right" v-if="order">
        <el-button v-if="order.status !== 'cancelled'" type="danger" @click="handleCancel">
          Hủy đơn hàng
        </el-button>
        <el-button @click="handleEdit">Sửa đơn hàng</el-button>
        <el-button type="primary" @click="handlePrint">Xuất kho</el-button>
      </div>
    </div>

    <div class="order-content" v-if="order">
      <!-- Order Code & Status -->
      <div class="order-header-row">
        <div class="order-code-section">
          <span class="order-code">{{ order.orderCode }}</span>
          <el-tag :type="getStatusType(order.status)" size="large">
            {{ getStatusLabel(order.status) }}
          </el-tag>
          <el-dropdown trigger="click">
            <el-button text>
              <el-icon><Printer /></el-icon> In đơn hàng
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="printInvoice">In hóa đơn</el-dropdown-item>
                <el-dropdown-item @click="printPackingSlip">In phiếu đóng gói</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button text @click="copyOrder">
            <el-icon><CopyDocument /></el-icon> Sao chép
          </el-button>
        </div>
        <div class="order-timeline">
          <div class="timeline-item" :class="{ active: true }">
            <el-icon><CircleCheckFilled /></el-icon>
            <div class="info">
              <span class="label">Đặt hàng</span>
              <span class="date">{{ formatDate(order.createdAt) }}</span>
            </div>
          </div>
          <div class="timeline-line" :class="{ active: order.confirmedAt }" />
          <div class="timeline-item" :class="{ active: order.confirmedAt }">
            <el-icon><CircleCheckFilled /></el-icon>
            <div class="info">
              <span class="label">Duyệt</span>
              <span class="date">{{ formatDate(order.confirmedAt) }}</span>
            </div>
          </div>
          <div class="timeline-line" :class="{ active: order.packagingCode && order.packagingStatus === 'packed' }" />
          <div class="timeline-item" :class="{ active: order.packagingCode && order.packagingStatus === 'packed' }">
            <el-icon><CircleCheckFilled /></el-icon>
            <div class="info">
              <span class="label">Đóng gói</span>
              <span class="date">{{ order.packagingCode }}</span>
            </div>
          </div>
          <div class="timeline-line" :class="{ active: order.status === 'shipped' || order.status === 'delivered' }" />
          <div class="timeline-item" :class="{ active: order.status === 'shipped' || order.status === 'delivered' }">
            <el-icon><CircleCheckFilled /></el-icon>
            <div class="info">
              <span class="label">Xuất kho</span>
              <span class="date">{{ formatDate(order.shippedAt) }}</span>
            </div>
          </div>
          <div class="timeline-line" :class="{ active: order.status === 'delivered' }" />
          <div class="timeline-item" :class="{ active: order.status === 'delivered' }">
            <el-icon><CircleCheckFilled /></el-icon>
            <div class="info">
              <span class="label">Hoàn thành</span>
              <span class="date">{{ formatDate(order.deliveredAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Success Alert -->
      <el-alert
        v-if="order.status === 'confirmed'"
        type="success"
        :title="`Đơn ${order.orderCode} đã được tạo thành công`"
        description="Phiếu giao hàng đã được tạo. Vui lòng kiểm tra thông tin chi tiết tại đây"
        show-icon
        :closable="false"
        class="success-alert"
      >
        <template #default>
          <el-link type="primary">+ Tạo đơn hàng khác</el-link>
        </template>
      </el-alert>

      <el-row :gutter="20">
        <!-- Left Column -->
        <el-col :span="16">
          <!-- Customer Info -->
          <el-card class="section-card">
            <template #header>
              <span>Thông tin khách hàng</span>
            </template>
            <div class="customer-info-grid">
              <div class="info-left">
                <el-link
                  type="primary"
                  class="customer-name"
                  @click="$router.push(`/customers/${order.customerId}`)"
                >
                  {{ order.customerName }}
                </el-link>
                <span> - {{ order.customerPhone }}</span>
                
                <div class="address-section">
                  <strong>ĐỊA CHỈ GIAO HÀNG</strong>
                  <p>{{ order.customerName }}</p>
                  <p>{{ order.customerAddress || 'Chưa có địa chỉ' }}</p>
                </div>

                <!-- Expanded customer info -->
                <div v-if="expandedCustomerInfo" class="expanded-info">
                  <div class="info-row">
                    <span class="label">ĐỊA CHỈ NHẬN HÓA ĐƠN</span>
                  </div>
                  <p>{{ order.customerName }}</p>
                  <p>{{ order.customerAddress || 'test, Phường Lê Đại Hành, Quận Hai Bà Trưng, Hà Nội' }}</p>
                  <div class="info-row" style="margin-top: 12px">
                    <span class="label">LIÊN HỆ</span>
                    <el-link type="primary" size="small">Thêm mới</el-link>
                  </div>
                  <p class="muted">Chưa có thông tin liên hệ</p>
                  <el-input placeholder="Email" style="margin-top: 8px" />
                </div>
                
                <el-link type="primary" @click="expandedCustomerInfo = !expandedCustomerInfo">
                  {{ expandedCustomerInfo ? 'Rút gọn ▲' : 'Xem thêm ▼' }}
                </el-link>
              </div>
              <div class="info-right">
                <div class="debt-row">
                  <span>Nợ phải thu</span>
                  <span class="text-danger">0</span>
                </div>
                <div class="debt-row">
                  <span>Tổng chi tiêu ({{ order.customerOrderCount || 0 }} đơn)</span>
                  <span>0</span>
                </div>
                <div class="debt-row">
                  <span>Trả hàng (0 sản phẩm)</span>
                  <span>0</span>
                </div>
                <div class="debt-row">
                  <span>Giao hàng thất bại (0 đơn)</span>
                  <span>0</span>
                </div>
              </div>
            </div>
          </el-card>

          <!-- Payment Waiting -->
          <el-card v-if="order.paymentStatus !== 'paid'" class="section-card payment-card">
            <div class="payment-waiting-header">
              <span>Đơn hàng chờ thanh toán</span>
              <el-button type="primary" @click="showPaymentDialog = true">Thanh toán</el-button>
            </div>
            <div class="payment-summary-row">
              <span>Khách phải trả: <strong>{{ formatCurrency(order.total) }}</strong></span>
              <span>Đã thanh toán: <strong>{{ formatCurrency(order.paidAmount || 0) }}</strong></span>
              <span>Còn phải trả: <strong class="text-danger">{{ formatCurrency(order.remainingAmount || order.total) }}</strong></span>
            </div>
          </el-card>

          <!-- Payment Completed -->
          <el-card v-else class="section-card payment-card paid">
            <div class="payment-completed-header">
              <el-icon color="#67c23a"><CircleCheckFilled /></el-icon>
              <span>Đã thanh toán toàn bộ</span>
            </div>
            <div class="payment-summary-row">
              <span>Khách phải trả: <strong>{{ formatCurrency(order.total) }}</strong></span>
              <span>Đã thanh toán: <strong>{{ formatCurrency(order.paidAmount) }}</strong></span>
              <span>Còn phải trả: <strong class="text-success">0</strong></span>
            </div>
            <div class="payment-detail" v-if="order.paidAt">
              <div class="payment-method-row">
                <span class="method-badge">● {{ getPaymentMethodLabel(order.paymentMethod || 'cash') }} {{ formatCurrency(order.paidAmount) }}</span>
                <el-icon class="expand-icon"><ArrowDown /></el-icon>
                <span class="payment-date">{{ formatDateTime(order.paidAt) }}</span>
              </div>
              <div class="payment-extra-info">
                <div class="info-row">
                  <span class="label">Người thanh toán</span>
                  <span class="value">: {{ order.staffName || 'Lê Nguyễn Thùy Linh' }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Tham chiếu</span>
                  <span class="value">: ---</span>
                </div>
                <div class="info-row">
                  <span class="label">Ghi chú</span>
                  <span class="value">: ---</span>
                </div>
              </div>
            </div>
          </el-card>

          <!-- Packaging and Shipping -->
          <el-card class="section-card packaging-card">
            <div class="packaging-header">
              <div class="header-left">
                <el-icon><Van /></el-icon>
                <span>Đóng gói và giao hàng</span>
              </div>
              <div class="header-actions">
                <!-- When packaging is active (packed) - show cancel & export buttons -->
                <template v-if="order.packagingCode && order.packagingStatus === 'packed' && order.status !== 'shipped' && order.status !== 'delivered'">
                  <el-button @click="cancelPackaging">Hủy đóng gói</el-button>
                  <el-button type="primary" @click="showExportDialog = true">Xuất kho</el-button>
                </template>
                <!-- When no packaging or cancelled - show create dropdown -->
                <template v-else-if="!order.packagingCode || order.packagingStatus === 'cancelled'">
                  <el-dropdown trigger="click">
                    <el-button type="primary">
                      Tạo đơn giao hàng <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item @click="createShipment('carrier')">
                          <el-icon><Van /></el-icon> Đẩy qua hãng vận chuyển
                        </el-dropdown-item>
                        <el-dropdown-item @click="createShipment('self')">
                          <el-icon><User /></el-icon> Tự gọi shipper
                        </el-dropdown-item>
                        <el-dropdown-item @click="createShipment('pickup')">
                          <el-icon><House /></el-icon> Nhận tại cửa hàng
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </template>
              </div>
            </div>
            
            <!-- Current Active Packaging (when packed) -->
            <div v-if="order.packagingCode && order.packagingStatus === 'packed'" class="packaging-status-row active">
              <div class="status-info">
                <span class="status-dot active">●</span>
                <el-link type="primary" class="package-code">{{ order.packagingCode }}</el-link>
                <el-button text size="small" @click="copyText(order.packagingCode)">
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
                <span class="shipping-status">Chờ lấy hàng</span>
                <el-icon class="expand-icon"><ArrowUp /></el-icon>
                <span class="shipping-date">{{ formatDateTime(order.updatedAt) }}</span>
              </div>
              <el-button text size="small">
                <el-icon><Printer /></el-icon>
              </el-button>
            </div>
            
            <!-- Packaging Details (when active) -->
            <div v-if="order.packagingCode && order.packagingStatus === 'packed'" class="packaging-info-grid">
              <div class="info-row">
                <span class="label">Mã đóng gói</span>
                <span class="value">: <el-link type="primary">{{ order.packagingCode }}</el-link></span>
              </div>
              <div class="info-row">
                <span class="label">Hình thức giao hàng</span>
                <span class="value">: {{ getShippingMethodLabel(order.shippingMethod) }}</span>
              </div>
            </div>
            
            <!-- Current Cancelled Packaging -->
            <div v-if="order.packagingCode && order.packagingStatus === 'cancelled'" class="packaging-status-row cancelled">
              <div class="status-info">
                <span class="status-dot cancelled">●</span>
                <el-link type="primary" class="package-code">{{ order.packagingCode }}</el-link>
                <el-button text size="small" @click="copyText(order.packagingCode)">
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
                <span class="shipping-status text-danger">Hủy đóng gói</span>
                <el-icon class="expand-icon"><ArrowDown /></el-icon>
                <span class="shipping-date">{{ formatDateTime(order.updatedAt) }}</span>
              </div>
              <el-button text size="small">
                <el-icon><Printer /></el-icon>
              </el-button>
            </div>
            
            <!-- Cancelled Packaging Details -->
            <div v-if="order.packagingCode && order.packagingStatus === 'cancelled'" class="packaging-info-grid cancelled-details">
              <div class="info-row">
                <span class="label">Mã đóng gói</span>
                <span class="value">: <el-link type="primary">{{ order.packagingCode }}</el-link> <el-icon><WarningFilled /></el-icon></span>
              </div>
              <div class="info-row">
                <span class="label">Hình thức giao hàng</span>
                <span class="value">: {{ getShippingMethodLabel(order.shippingMethod) }}</span>
              </div>
            </div>

            <!-- Packaging History (previously cancelled ones) -->
            <div v-if="packagingHistory.length > 0" class="packaging-history">
              <div 
                v-for="pkg in packagingHistory" 
                :key="pkg.code + pkg.date"
                class="packaging-status-row cancelled"
              >
                <div class="status-info">
                  <span class="status-dot cancelled">●</span>
                  <el-link type="primary" class="package-code">{{ pkg.code }}</el-link>
                  <el-button text size="small" @click="copyText(pkg.code)">
                    <el-icon><CopyDocument /></el-icon>
                  </el-button>
                  <span class="shipping-status text-danger">{{ pkg.statusLabel }}</span>
                  <el-icon class="expand-icon"><ArrowDown /></el-icon>
                  <span class="shipping-date">{{ formatDateTime(pkg.date) }}</span>
                </div>
                <el-button text size="small">
                  <el-icon><Printer /></el-icon>
                </el-button>
              </div>
            </div>

            <!-- No packaging message (only show when no packagingCode at all) -->
            <div v-if="!order.packagingCode" class="no-packaging">
              <p>Chưa tạo đơn giao hàng</p>
            </div>
          </el-card>

          <!-- Products Table -->
          <el-card class="section-card">
            <template #header>
              <div class="section-header">
                <span>Thông tin sản phẩm</span>
                <el-button type="primary" text>Kiểm tra tồn kho</el-button>
              </div>
            </template>
            <el-table :data="order.items" style="width: 100%">
              <el-table-column label="STT" type="index" width="50" />
              <el-table-column label="Ảnh" width="60">
                <template #default="{ row }">
                  <el-image
                    v-if="row.imageUrl"
                    :src="row.imageUrl"
                    fit="cover"
                    style="width: 40px; height: 40px; border-radius: 4px"
                  />
                  <div v-else class="no-image">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="Tên sản phẩm" min-width="200">
                <template #default="{ row }">
                  <div class="product-name">{{ row.productName }}</div>
                  <div class="product-variant">{{ row.variantName || 'Mặc định' }}</div>
                  <div class="product-sku">{{ row.sku }}</div>
                </template>
              </el-table-column>
              <el-table-column label="Số lượng" prop="quantity" width="80" align="center" />
              <el-table-column label="Đơn giá" width="100" align="right">
                <template #default="{ row }">
                  {{ formatCurrency(row.unitPrice) }}
                </template>
              </el-table-column>
              <el-table-column label="Chiết khấu" width="100" align="right">
                <template #default="{ row }">
                  {{ formatCurrency(row.discount || 0) }}
                </template>
              </el-table-column>
              <el-table-column label="Thành tiền" width="120" align="right">
                <template #default="{ row }">
                  {{ formatCurrency(row.total) }}
                </template>
              </el-table-column>
            </el-table>

            <!-- Totals -->
            <div class="order-totals">
              <div class="total-row">
                <span>Tổng tiền ({{ order.items?.length || 0 }} sản phẩm)</span>
                <span>{{ formatCurrency(order.subtotal) }}</span>
              </div>
              <div class="total-row">
                <span>Chiết khấu 🔔</span>
                <span>{{ formatCurrency(order.discount || 0) }}</span>
              </div>
              <div class="total-row">
                <span>Phí giao hàng</span>
                <span>{{ formatCurrency(order.shippingFee || 0) }}</span>
              </div>
              <div class="total-row">
                <span>Mã giảm giá</span>
                <span>0</span>
              </div>
              <div class="total-row highlight">
                <span>Khách phải trả</span>
                <span class="amount">{{ formatCurrency(order.total) }}</span>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- Right Column -->
        <el-col :span="8">
          <!-- Order Info -->
          <el-card class="section-card">
            <template #header>
              <div class="section-header">
                <span>Thông tin đơn hàng</span>
                <el-button :icon="Setting" circle size="small" />
              </div>
            </template>
            <div class="order-info-list">
              <div class="info-row">
                <span class="label">Chính sách giá</span>
                <span class="value">Giá bán lẻ</span>
              </div>
              <div class="info-row">
                <span class="label">Bán tại</span>
                <span class="value">{{ order.branchName }}</span>
              </div>
              <div class="info-row">
                <span class="label">Bán bởi</span>
                <span class="value">{{ order.staffName || 'N/A' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Hạn giao hàng</span>
                <span class="value">{{ order.expectedDeliveryDate ? formatDate(order.expectedDeliveryDate) : '---' }}</span>
              </div>
              <div class="info-row">
                <span class="label">Nguồn</span>
                <span class="value">{{ order.source }}</span>
              </div>
              <div class="info-row">
                <span class="label">Kênh bán hàng</span>
                <span class="value">---</span>
              </div>
              <div class="info-row">
                <span class="label">Ngày bán</span>
                <span class="value">{{ formatDate(order.createdAt) }}</span>
              </div>
              <div class="info-row">
                <span class="label">Đường dẫn</span>
                <span class="value">---</span>
              </div>
              <div class="info-row">
                <span class="label">Tham chiếu</span>
                <span class="value">---</span>
              </div>
            </div>
            <el-link type="primary">Xem lịch sử đơn hàng</el-link>
          </el-card>

          <!-- Notes -->
          <el-card class="section-card">
            <template #header>
              <span>Ghi chú</span>
            </template>
            <p v-if="order.note">{{ order.note }}</p>
            <p v-else class="text-muted">Chưa có ghi chú</p>
          </el-card>

          <!-- Tags -->
          <el-card class="section-card">
            <template #header>
              <span>Tags</span>
              <el-icon><InfoFilled /></el-icon>
            </template>
            <div v-if="order.tags?.length">
              <el-tag v-for="tag in order.tags" :key="tag" style="margin-right: 8px">
                {{ tag }}
              </el-tag>
            </div>
            <p v-else class="text-muted">Chưa có tag</p>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- Payment Dialog -->
    <el-dialog v-model="showPaymentDialog" title="Thanh toán" width="400px">
      <el-form label-width="100px">
        <el-form-item label="Còn phải trả">
          <span class="text-danger text-bold">{{ formatCurrency(order?.remainingAmount || order?.total || 0) }}</span>
        </el-form-item>
        <el-form-item label="Số tiền">
          <el-input-number v-model="paymentAmount" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="Phương thức">
          <el-select v-model="paymentMethod" style="width: 100%">
            <el-option label="Tiền mặt" value="cash" />
            <el-option label="Chuyển khoản" value="transfer" />
            <el-option label="Thẻ" value="card" />
            <el-option label="Quẹt thẻ" value="card_swipe" />
            <el-option label="COD" value="cod" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPaymentDialog = false">Hủy</el-button>
        <el-button type="primary" @click="processPayment">Xác nhận</el-button>
      </template>
    </el-dialog>

    <!-- Export Stock Dialog -->
    <el-dialog v-model="showExportDialog" title="Xuất kho cho đơn giao hàng" width="400px">
      <p>Bạn có chắc chắn xuất kho đơn giao hàng này không?</p>
      <template #footer>
        <el-button @click="showExportDialog = false">Thoát</el-button>
        <el-button type="primary" @click="confirmExportStock">Xuất kho</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft, Printer, CopyDocument, CircleCheckFilled,
  Setting, Picture, InfoFilled, Van, ArrowDown, ArrowUp, User, House, WarningFilled
} from '@element-plus/icons-vue'
import { orderService } from '@/services/order.service'
import { useDevice } from '@/composables/useDevice'
import MobileOrderDetail from '@/components/mobile/MobileOrderDetail.vue'

const { isMobile } = useDevice()

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const order = ref<any>(null)
const showPaymentDialog = ref(false)
const showExportDialog = ref(false)
const paymentAmount = ref(0)
const paymentMethod = ref('cash')
const expandedCustomerInfo = ref(false)
const packagingHistory = ref<any[]>([])

async function loadOrder() {
  loading.value = true
  try {
    const id = Number(route.params.id)
    const res = await orderService.getOrderById(id, { _t: Date.now() })
    if (res.success) {
      order.value = res.data
      paymentAmount.value = res.data.remainingAmount || 0
      
      // Load packaging history from order data
      const history = order.value.packagingHistory || []
      packagingHistory.value = history.map((h: any) => ({
        code: h.code,
        status: h.status,
        statusLabel: h.status === 'cancelled' ? 'Hủy đóng gói' : 'Chờ lấy hàng',
        method: h.method === 'pickup' ? 'Nhận tại cửa hàng' : (h.method === 'carrier' ? 'Đẩy qua hãng vận chuyển' : 'Tự gọi shipper'),
        date: h.date,
      }))
    }
  } catch (e: any) {
    ElMessage.error('Không thể tải thông tin đơn hàng')
    router.push('/orders')
  } finally {
    loading.value = false
  }
}

async function handleCancel() {
  try {
    await ElMessageBox.confirm(
      'Bạn có chắc chắn muốn hủy đơn hàng này?',
      'Xác nhận hủy',
      { type: 'warning' }
    )
    const res = await orderService.cancelOrder(order.value.id)
    if (res.success) {
      ElMessage.success('Đã hủy đơn hàng')
      loadOrder()
    }
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error(e.response?.data?.message || 'Hủy đơn hàng thất bại')
    }
  }
}

function handleEdit() {
  router.push(`/orders/${order.value.id}/edit`)
}

function handlePrint() {
  printInvoice()
}

function printInvoice() {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const invoiceHtml = generateInvoiceHtml(order.value)
  printWindow.document.write(invoiceHtml)
  printWindow.document.close()
  printWindow.print()
}

function generateInvoiceHtml(order: any): string {
  const itemsHtml = order.items?.map((item: any) => `
    <tr>
      <td>${item.productName}</td>
      <td style="text-align: center">${item.quantity}</td>
      <td style="text-align: right">${formatCurrency(item.unitPrice)}</td>
      <td style="text-align: right">${formatCurrency(item.total)}</td>
    </tr>
  `).join('') || ''

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Hóa đơn ${order.orderCode}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; font-size: 14px; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 18px; }
        .info { margin-bottom: 20px; }
        .info p { margin: 5px 0; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        .total { text-align: right; }
        .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
        .total-row.bold { font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Up All Nine</h1>
        <p>Hồ Chí Minh</p>
        <p>0775773775</p>
      </div>
      <hr>
      <h2 style="text-align: center">HÓA ĐƠN BÁN HÀNG</h2>
      <div class="info">
        <p><strong>Số:</strong> ${order.orderCode}</p>
        <p><strong>Ngày:</strong> ${formatDate(order.createdAt)}</p>
        <p><strong>Khách hàng:</strong> ${order.customerName || 'Khách lẻ'}</p>
        ${order.customerPhone ? `<p><strong>Điện thoại:</strong> ${order.customerPhone}</p>` : ''}
        ${order.customerAddress ? `<p><strong>Địa chỉ:</strong> ${order.customerAddress}</p>` : ''}
      </div>
      <table>
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th style="text-align: center">SL</th>
            <th style="text-align: right">Đơn giá</th>
            <th style="text-align: right">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <div class="total">
        <div class="total-row"><span>Cộng tiền hàng</span><span>${formatCurrency(order.subtotal)}</span></div>
        <div class="total-row"><span>Chiết khấu</span><span>${formatCurrency(order.discount || 0)}</span></div>
        <div class="total-row bold"><span>Khách phải trả</span><span>${formatCurrency(order.total)}</span></div>
        <div class="total-row"><span>Tiền khách đưa</span><span>${formatCurrency(order.paidAmount || 0)}</span></div>
        <div class="total-row"><span>Trả lại</span><span>${formatCurrency(Math.max(0, (order.paidAmount || 0) - order.total))}</span></div>
      </div>
      <div class="footer">
        <p>Cảm ơn quý khách. Hẹn gặp lại!</p>
      </div>
    </body>
    </html>
  `
}

function printPackingSlip() {
  ElMessage.info('Tính năng in phiếu đóng gói đang được phát triển')
}

function copyOrder() {
  navigator.clipboard.writeText(order.value.orderCode)
  ElMessage.success('Đã sao chép mã đơn hàng')
}

async function cancelPackaging() {
  try {
    await ElMessageBox.confirm('Bạn có chắc muốn hủy đóng gói?', 'Xác nhận', {
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy',
      type: 'warning',
    })
    
    // Add current packaging to history
    const currentHistory = order.value.packagingHistory || []
    const newHistory = [
      {
        code: order.value.packagingCode,
        status: 'cancelled',
        method: order.value.shippingMethod || 'pickup',
        date: new Date().toISOString(),
      },
      ...currentHistory,
    ]
    
    const res = await orderService.updateOrder(order.value.id, {
      packagingStatus: 'cancelled',
      // Keep packagingCode for display in history
      packagingHistory: newHistory,
    })
    if (res.success) {
      ElMessage.success('Đã hủy đóng gói')
      loadOrder()
    }
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error('Hủy đóng gói thất bại')
    }
  }
}

async function createShipment(method: string) {
  try {
    // Generate new packaging code
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 10000)
    const packagingCode = `FUN${String(timestamp).slice(-4)}${String(random).slice(-1)}`
    
    const res = await orderService.updateOrder(order.value.id, {
      shippingMethod: method,
      packagingCode,
      packagingStatus: 'packed',
    })
    if (res.success) {
      ElMessage.success('Đã tạo đơn giao hàng thành công')
      loadOrder()
    }
  } catch (e: any) {
    ElMessage.error('Tạo đơn giao hàng thất bại')
  }
}

async function exportStock() {
  showExportDialog.value = true
}

async function confirmExportStock() {
  try {
    // Update order: mark as shipped and delivered, update timestamps
    const now = new Date().toISOString()
    const res = await orderService.updateOrder(order.value.id, {
      status: 'delivered',
      shippedAt: now,
      deliveredAt: now,
    })
    if (res.success) {
      ElMessage.success('Đã xuất kho thành công')
      showExportDialog.value = false
      loadOrder()
    }
  } catch (e: any) {
    ElMessage.error('Xuất kho thất bại')
  }
}

async function processPayment() {
  if (paymentAmount.value <= 0) {
    ElMessage.warning('Vui lòng nhập số tiền thanh toán')
    return
  }

  try {
    const now = new Date().toISOString()
    const res = await orderService.addPayment(order.value.id, paymentAmount.value)
    if (res.success) {
      ElMessage.success('Thanh toán thành công')
      showPaymentDialog.value = false
      
      // Update order status to confirmed + create packaging code after payment
      await orderService.updateOrder(order.value.id, {
        status: 'confirmed',
        confirmedAt: now,
        packagingStatus: 'packed',
        packagingCode: `FUN${String(Date.now()).slice(-5)}`,
        paymentStatus: 'paid',
        paymentMethod: paymentMethod.value,
        paidAt: now,
        paidAmount: order.value.total,
        remainingAmount: 0,
      })
      
      loadOrder()
    }
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || 'Thanh toán thất bại')
  }
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

function formatDateTime(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    cash: 'Tiền mặt',
    transfer: 'Chuyển khoản',
    card: 'Thẻ',
    card_swipe: 'Quẹt thẻ',
    cod: 'COD',
  }
  return labels[method] || method
}

function getShippingStatusLabel(): string {
  if (!order.value) return ''
  if (order.value.status === 'delivered') return 'Đã giao hàng'
  if (order.value.status === 'shipped') return 'Đang giao'
  return 'Chờ lấy hàng'
}

function getShippingMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    pickup: 'Nhận tại cửa hàng',
    carrier: 'Đẩy qua hãng vận chuyển',
    self: 'Tự gọi shipper',
    external: 'Đẩy vận chuyển ngoài',
    later: 'Giao hàng sau',
  }
  return labels[method] || method
}

function copyPackageCode() {
  if (order.value?.packagingCode) {
    navigator.clipboard.writeText(order.value.packagingCode)
    ElMessage.success('Đã sao chép mã đóng gói')
  }
}

function copyText(text: string) {
  navigator.clipboard.writeText(text)
  ElMessage.success('Đã sao chép')
}

function getStatusType(status: string): 'success' | 'warning' | 'danger' | 'info' | '' {
  switch (status) {
    case 'delivered':
    case 'shipping':
      return 'success'
    case 'pending':
    case 'confirmed':
    case 'processing':
    case 'packing':
      return 'warning'
    case 'cancelled':
      return 'danger'
    default:
      return 'warning'
  }
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Đang giao dịch',
    confirmed: 'Đang giao dịch',
    processing: 'Đang giao dịch',
    packing: 'Đang giao dịch',
    shipping: 'Hoàn thành',
    delivered: 'Hoàn thành',
    cancelled: 'Hủy đơn',
  }
  return labels[status] || status
}

onMounted(() => {
  loadOrder()
})
</script>

<style scoped lang="scss">
.order-detail {
  background: #f5f7fa;
  min-height: 100%;

  .page-header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 24px;
    background: #fff;
    border-bottom: 1px solid #e4e7ed;

    .header-right {
      display: flex;
      gap: 12px;
    }
  }

  .order-content {
    padding: 20px;
  }

  .order-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 16px;
  }

  .order-code-section {
    display: flex;
    align-items: center;
    gap: 12px;

    .order-code {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }

  .order-timeline {
    display: flex;
    align-items: center;
    gap: 8px;

    .timeline-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #c0c4cc;

      &.active {
        color: #409eff;
      }

      .info {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 12px;
        margin-top: 4px;

        .label {
          font-weight: 500;
        }

        .date {
          color: #909399;
        }
      }
    }

    .timeline-line {
      width: 40px;
      height: 2px;
      background: #e4e7ed;

      &.active {
        background: #409eff;
      }
    }
  }

  .success-alert {
    margin-bottom: 16px;
  }

  .section-card {
    margin-bottom: 16px;
    border-radius: 8px;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-actions {
        display: flex;
        gap: 8px;
      }
    }
  }

  .customer-info-grid {
    display: flex;
    justify-content: space-between;
    gap: 24px;

    .info-left {
      flex: 1;

      .customer-name {
        font-weight: 600;
        cursor: pointer;
      }

      .address-section {
        background: #f5f7fa;
        padding: 12px;
        border-radius: 4px;
        margin: 12px 0;

        strong {
          font-size: 12px;
          color: #909399;
          display: block;
          margin-bottom: 8px;
        }

        p {
          margin: 4px 0;
          font-size: 14px;
        }
      }

      .expanded-info {
        background: #f5f7fa;
        padding: 12px;
        border-radius: 4px;
        margin: 12px 0;

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .label {
            font-size: 12px;
            color: #909399;
            font-weight: 600;
          }
        }

        p {
          margin: 4px 0;
          font-size: 14px;

          &.muted {
            color: #909399;
          }
        }
      }
    }

    .info-right {
      .debt-row {
        display: flex;
        justify-content: space-between;
        gap: 24px;
        padding: 4px 0;

        .text-danger {
          color: #f56c6c;
        }
      }
    }
  }

  .payment-card {
    .payment-waiting-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #ebeef5;
      font-weight: 500;
    }

    .payment-completed-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-bottom: 1px solid #ebeef5;
      font-weight: 500;
      color: #67c23a;
    }

    .payment-summary-row {
      display: flex;
      gap: 32px;
      padding: 16px;
      font-size: 14px;

      strong {
        font-weight: 600;
      }

      .text-danger {
        color: #f56c6c;
      }

      .text-success {
        color: #67c23a;
      }
    }

    .payment-detail {
      padding: 0 16px 16px;

      .payment-method-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        background: #f5f7fa;
        border-radius: 4px;
        margin-bottom: 12px;

        .method-badge {
          color: #409eff;
          font-weight: 500;
        }

        .expand-icon {
          color: #909399;
        }

        .payment-date {
          margin-left: auto;
          color: #909399;
          font-size: 13px;
        }
      }

      .payment-extra-info {
        padding-left: 12px;

        .info-row {
          display: flex;
          padding: 4px 0;
          font-size: 13px;

          .label {
            width: 120px;
            color: #606266;
          }

          .value {
            color: #303133;
          }
        }
      }
    }

    &.paid {
      border: 1px solid #67c23a;
      border-radius: 8px;
    }
  }

  .packaging-card {
    .packaging-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #ebeef5;

      .header-left {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
      }

      .header-actions {
        display: flex;
        gap: 8px;
      }
    }

    .packaging-status-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #f5f7fa;
      
      &.active {
        background-color: #f0f9eb;
        border-left: 3px solid #67c23a;
      }
      
      &.cancelled {
        background-color: #fef0f0;
        border-left: 3px solid #f56c6c;
      }

      .status-info {
        display: flex;
        align-items: center;
        gap: 8px;

        .status-dot {
          font-size: 10px;

          &.pending {
            color: #409eff;
          }

          &.delivered, &.active {
            color: #67c23a;
          }
          
          &.cancelled {
            color: #f56c6c;
          }
        }

        .package-code {
          font-weight: 600;
        }

        .shipping-status {
          color: #67c23a;
          font-size: 13px;
          
          &.text-danger {
            color: #f56c6c;
          }
        }

        .expand-icon {
          color: #909399;
          font-size: 12px;
        }

        .shipping-date {
          color: #909399;
          font-size: 13px;
        }
      }
    }
    
    .packaging-history {
      margin-top: 8px;
    }

    .packaging-info-grid {
      padding: 12px 16px;
      
      &.cancelled-details {
        background-color: #fef0f0;
        border-left: 3px solid #f56c6c;
        
        .value .el-icon {
          color: #e6a23c;
          margin-left: 4px;
        }
      }

      .info-row {
        display: flex;
        padding: 6px 0;
        font-size: 13px;

        .label {
          width: 140px;
          color: #606266;
        }

        .value {
          color: #303133;
        }
      }
    }

    .no-packaging {
      padding: 24px;
      text-align: center;
      color: #909399;
    }
  }

  .no-image {
    width: 40px;
    height: 40px;
    background: #f5f7fa;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #c0c4cc;
  }

  .product-name {
    font-weight: 500;
  }

  .product-variant,
  .product-sku {
    font-size: 12px;
    color: #909399;
  }

  .order-totals {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #ebeef5;

    .total-row {
      display: flex;
      justify-content: flex-end;
      gap: 48px;
      padding: 8px 0;

      &.highlight {
        font-size: 16px;
        font-weight: 600;

        .amount {
          color: #303133;
        }
      }
    }
  }

  .order-info-list {
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;

      .label {
        color: #909399;
      }

      .value {
        color: #303133;
      }
    }
  }

  .text-muted {
    color: #909399;
  }

  .text-bold {
    font-weight: 600;
  }
}
</style>


