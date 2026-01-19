<template>
  <div class="mobile-order-create">
    <!-- Header -->
    <div class="mobile-header">
      <div class="header-left" @click="$router.push('/orders')">
        <el-icon><Close /></el-icon>
      </div>
      <div class="search-input">
        <el-input 
          v-model="productSearchText"
          placeholder="Tìm và thêm sản phẩm vào đơn" 
          :prefix-icon="Search"
          @focus="showProductSearch = true"
        >
          <template #suffix>
            <el-icon class="barcode-icon" @click="scanBarcode"><Scan /></el-icon>
          </template>
        </el-input>
      </div>
      <div class="header-right">
        <el-icon @click="showMoreMenu = true"><More /></el-icon>
      </div>
    </div>

    <!-- Content -->
    <div class="mobile-content">
      <!-- Empty Cart -->
      <div class="empty-cart" v-if="orderItems.length === 0">
        <div class="cart-icon">
          <el-icon :size="60"><ShoppingCart /></el-icon>
        </div>
        <p>Đơn hàng của bạn chưa có sản phẩm nào!</p>
        <el-link type="primary" @click="showProductSearch = true">Chọn sản phẩm</el-link>
      </div>

      <!-- Cart Items -->
      <div class="cart-items" v-else>
        <div class="cart-item" v-for="(item, index) in orderItems" :key="index">
          <div class="item-main">
            <div class="item-name">{{ item.name }}</div>
            <div class="item-sku">SKU: {{ item.sku || 'N/A' }}</div>
            <div class="item-price">{{ formatCurrency(item.price) }}</div>
            <div class="item-available">
              Có thể bán: <span :class="(item.availableQuantity || 0) > 0 ? 'text-success' : 'text-danger'">{{ item.availableQuantity || 0 }}</span>
            </div>
          </div>
          <el-icon class="remove-btn" @click="removeItem(index)"><Close /></el-icon>
          <div class="item-controls">
            <el-button size="small" @click="decreaseQty(index)">-</el-button>
            <el-input-number v-model="item.quantity" :min="1" size="small" controls-position="right" style="width: 80px" />
            <el-button size="small" @click="increaseQty(index)">+</el-button>
          </div>
          <div class="item-stock" v-if="item.quantity > (item.availableQuantity || 0)">
            <el-icon><WarningFilled /></el-icon>
            <span class="text-danger">Thiếu hàng</span>
          </div>
        </div>
      </div>

      <div class="section-divider"></div>

      <!-- Promotion -->
      <div class="action-row">
        <el-icon class="icon-blue"><Present /></el-icon>
        <span class="label-blue">Áp dụng khuyến mại</span>
      </div>

      <!-- Summary -->
      <div class="order-summary">
        <div class="summary-row">
          <span>Tổng số lượng</span>
          <span>{{ totalQuantity }}</span>
        </div>
        <div class="summary-row">
          <span>Tổng tiền hàng</span>
          <span>{{ formatCurrency(subtotal) }}</span>
        </div>
        <div class="summary-row clickable" @click="showDiscountInput = true">
          <span class="label-blue">Chiết khấu</span>
          <span>{{ formatCurrency(discount) }}</span>
        </div>
        <div class="summary-row clickable" @click="showShippingInput = true">
          <span class="label-blue">Phí giao hàng</span>
          <span>{{ formatCurrency(shippingFee) }}</span>
        </div>
      </div>

      <div class="section-divider"></div>

      <!-- Customer -->
      <div class="info-section customer-section">
        <div class="section-header">
          <span class="section-label">Khách hàng</span>
          <el-icon v-if="selectedCustomer" class="close-icon" @click.stop="selectedCustomer = null"><Close /></el-icon>
        </div>
        <div class="add-row" v-if="!selectedCustomer" @click="showCustomerSearch = true">
          <el-icon><UserFilled /></el-icon>
          <span class="label-blue">Thêm khách hàng</span>
        </div>
        <div class="customer-detail" v-else @click="showCustomerSearch = true">
          <div class="customer-row">
            <el-icon><UserFilled /></el-icon>
            <span class="name">{{ selectedCustomer.name }}</span>
            <span class="phone">- {{ selectedCustomer.phone }}</span>
          </div>
          <div class="customer-meta">
            <span>Công nợ: {{ formatCurrency(selectedCustomer.debt || 0) }}</span>
            <span class="divider">|</span>
            <span>Điểm: {{ selectedCustomer.loyaltyPoints || 0 }}</span>
            <el-link type="primary" class="activate-link">Kích hoạt</el-link>
          </div>
          <div class="address-row" v-if="selectedCustomer.address">
            <span class="label">Địa chỉ giao hàng</span>
            <el-link type="primary">Thay đổi địa chỉ</el-link>
          </div>
          <div class="address-text" v-if="selectedCustomer.address">
            {{ selectedCustomer.address }}, {{ selectedCustomer.ward }}, {{ selectedCustomer.district }}, {{ selectedCustomer.province }}
          </div>
        </div>
      </div>

      <div class="section-divider"></div>

      <!-- Payment Method -->
      <div class="action-row" @click="showPaymentPicker = true">
        <el-icon><Wallet /></el-icon>
        <span>{{ selectedPaymentMethod || 'Chọn phương thức thanh toán' }}</span>
        <el-icon class="arrow"><ArrowRight /></el-icon>
      </div>

      <!-- Temp Total -->
      <div class="temp-total">
        <span>Tạm tính</span>
        <span class="amount">{{ formatCurrency(total) }}</span>
      </div>
    </div>

    <!-- Bottom Actions -->
    <div class="mobile-bottom">
      <el-button type="primary" class="submit-btn" @click="handleSubmitAndApprove" :loading="submitting">
        Tạo đơn và duyệt
      </el-button>
      <el-button class="more-btn" @click="showCreateOptions = true">
        <el-icon><More /></el-icon>
      </el-button>
    </div>

    <!-- Create Options Menu -->
    <el-drawer v-model="showCreateOptions" direction="btt" size="auto" :show-close="false">
      <div class="create-options">
        <div class="option-header">Thay đổi phương thức đặt hàng</div>
        <div class="timeline-preview">
          <div class="step" :class="{ active: createMode === 'create' || createMode === 'approve' || createMode === 'ship' }">
            <div class="dot"></div>
            <span>Đặt hàng</span>
          </div>
          <div class="line" :class="{ active: createMode === 'approve' || createMode === 'ship' }"></div>
          <div class="step" :class="{ active: createMode === 'approve' || createMode === 'ship' }">
            <div class="dot"></div>
            <span>Duyệt</span>
          </div>
          <div class="line" :class="{ active: createMode === 'ship' }"></div>
          <div class="step" :class="{ active: createMode === 'ship' }">
            <div class="dot"></div>
            <span>Đóng gói</span>
          </div>
          <div class="line" :class="{ active: createMode === 'ship' }"></div>
          <div class="step" :class="{ active: createMode === 'ship' }">
            <div class="dot"></div>
            <span>Xuất kho</span>
          </div>
          <div class="line"></div>
          <div class="step">
            <div class="dot"></div>
            <span>Hoàn thành</span>
          </div>
        </div>
        <div class="option-item" @click="selectCreateMode('create')">Tạo đơn hàng</div>
        <div class="option-item primary" @click="selectCreateMode('approve')">Tạo đơn và duyệt</div>
        <div class="option-item" @click="selectCreateMode('ship')">Tạo đơn và giao hàng</div>
      </div>
    </el-drawer>

    <!-- Product Search Dialog -->
    <el-drawer v-model="showProductSearch" direction="btt" size="80%">
      <template #header>
        <span>Chọn sản phẩm</span>
      </template>
      <el-input v-model="productSearchText" placeholder="Tìm sản phẩm..." class="mb-3" />
      <div class="product-list">
        <div class="product-item" v-for="p in filteredProducts" :key="p.id" @click="addProduct(p)">
          <img :src="p.imageUrl || '/placeholder-product.png'" class="product-image" />
          <div class="product-info">
            <div class="product-name">{{ p.name }}</div>
            <div class="product-price">{{ formatCurrency(p.retailPrice) }}</div>
          </div>
          <el-icon><Plus /></el-icon>
        </div>
      </div>
    </el-drawer>

    <!-- Customer Search Dialog -->
    <el-drawer v-model="showCustomerSearch" direction="btt" size="80%">
      <template #header>
        <span>Chọn khách hàng</span>
      </template>
      <el-input v-model="customerSearchText" placeholder="Tìm khách hàng..." class="mb-3" />
      <div class="customer-list">
        <div class="customer-item" v-for="c in filteredCustomers" :key="c.id" @click="selectCustomer(c)">
          <div class="customer-name">{{ c.name }}</div>
          <div class="customer-phone">{{ c.phone }}</div>
        </div>
      </div>
    </el-drawer>

    <!-- Payment Method Picker -->
    <el-drawer v-model="showPaymentPicker" direction="btt" size="auto" :show-close="false">
      <template #header>
        <span style="font-weight: 600;">Chọn phương thức thanh toán</span>
      </template>
      <div class="payment-list">
        <div 
          v-for="method in paymentMethods" 
          :key="method.value"
          class="payment-item"
          :class="{ active: selectedPaymentMethod === method.name }"
          @click="selectPayment(method)"
        >
          {{ method.name }}
        </div>
      </div>
    </el-drawer>

    <!-- Discount Input Dialog -->
    <el-dialog v-model="showDiscountInput" title="Chiết khấu" width="90%">
      <el-input v-model.number="discount" type="number" placeholder="Nhập số tiền chiết khấu">
        <template #suffix>₫</template>
      </el-input>
      <template #footer>
        <el-button @click="showDiscountInput = false">Đóng</el-button>
        <el-button type="primary" @click="showDiscountInput = false">Xác nhận</el-button>
      </template>
    </el-dialog>

    <!-- Shipping Fee Input Dialog -->
    <el-dialog v-model="showShippingInput" title="Phí giao hàng" width="90%">
      <el-input v-model.number="shippingFee" type="number" placeholder="Nhập phí giao hàng">
        <template #suffix>₫</template>
      </el-input>
      <template #footer>
        <el-button @click="showShippingInput = false">Đóng</el-button>
        <el-button type="primary" @click="showShippingInput = false">Xác nhận</el-button>
      </template>
    </el-dialog>

    <!-- More Menu -->
    <el-drawer v-model="showMoreMenu" direction="btt" size="auto">
      <div class="menu-item" @click="handleSaveDraft">Lưu nháp</div>
      <div class="menu-item" @click="handleCheckInventory">Kiểm tra tồn kho</div>
      <div class="menu-item" @click="handlePrint">In đơn</div>
      <div class="menu-item cancel" @click="handleCancel">Huỷ đơn</div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Close, Search, More, ShoppingCart, Present, UserFilled, 
  Wallet, Plus, WarningFilled
} from '@element-plus/icons-vue'
import { productService } from '@/services/product.service'
import { customerService } from '@/services/customer.service'
import { orderService } from '@/services/order.service'

const Scan = { template: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h2v12H4zm3 0h1v12H7zm2 0h3v12H9zm4 0h1v12h-1zm3 0h2v12h-2zm3 0h1v12h-1z"/></svg>` }
const ArrowRight = { template: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>` }

const router = useRouter()

// Search
const productSearchText = ref('')
const customerSearchText = ref('')

// UI State
const showProductSearch = ref(false)
const showCustomerSearch = ref(false)
const showPaymentPicker = ref(false)
const showMoreMenu = ref(false)
const showDiscountInput = ref(false)
const showShippingInput = ref(false)
const showCreateOptions = ref(false)
const submitting = ref(false)
const createMode = ref<'create' | 'approve' | 'ship'>('approve') // Default: create and approve

// Data
const products = ref<any[]>([])
const customers = ref<any[]>([])
const orderItems = ref<any[]>([])
const selectedCustomer = ref<any>(null)
const selectedPaymentMethod = ref('')
const discount = ref(0)
const shippingFee = ref(0)

// Payment Methods
const paymentMethods = [
  { name: 'Tiền mặt', value: 'cash' },
  { name: 'Chuyển khoản', value: 'bank' },
  { name: 'Ví Shopee', value: 'shopee' },
  { name: 'Quẹt thẻ', value: 'card' }
]

// Computed
const filteredProducts = computed(() => {
  if (!productSearchText.value) return products.value
  const search = productSearchText.value.toLowerCase()
  return products.value.filter(p => 
    p.name.toLowerCase().includes(search) || p.sku?.toLowerCase().includes(search)
  )
})

const filteredCustomers = computed(() => {
  if (!customerSearchText.value) return customers.value
  const search = customerSearchText.value.toLowerCase()
  return customers.value.filter(c => 
    c.name.toLowerCase().includes(search) || c.phone?.includes(search)
  )
})

const totalQuantity = computed(() => orderItems.value.reduce((sum, item) => sum + item.quantity, 0))
const subtotal = computed(() => orderItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0))
const total = computed(() => subtotal.value - discount.value + shippingFee.value)

// Methods
function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value || 0)
}

function addProduct(product: any) {
  const existing = orderItems.value.find(item => item.productId === product.id)
  if (existing) {
    existing.quantity++
  } else {
    orderItems.value.push({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      price: product.retailPrice,
      imageUrl: product.imageUrl,
      availableQuantity: product.availableQuantity || product.stockQuantity || 0,
      quantity: 1
    })
  }
  showProductSearch.value = false
}

function increaseQty(index: number) {
  orderItems.value[index].quantity++
}

function decreaseQty(index: number) {
  if (orderItems.value[index].quantity > 1) {
    orderItems.value[index].quantity--
  } else {
    orderItems.value.splice(index, 1)
  }
}

function removeItem(index: number) {
  orderItems.value.splice(index, 1)
}

function selectCustomer(customer: any) {
  selectedCustomer.value = customer
  showCustomerSearch.value = false
}

function selectPayment(action: any) {
  selectedPaymentMethod.value = action.name
  showPaymentPicker.value = false
}

function selectCreateMode(mode: 'create' | 'approve' | 'ship') {
  createMode.value = mode
  showCreateOptions.value = false
  handleSubmitWithMode(mode)
}

function handleSubmitAndApprove() {
  handleSubmitWithMode('approve')
}

function scanBarcode() {
  ElMessage.info('Quét mã vạch...')
}

async function handleSubmitWithMode(mode: 'create' | 'approve' | 'ship') {
  if (orderItems.value.length === 0) {
    ElMessage.warning('Vui lòng thêm sản phẩm')
    return
  }

  submitting.value = true
  try {
    // Calculate totals
    const orderSubtotal = orderItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const orderTotal = orderSubtotal - discount.value + shippingFee.value
    
    // Build items array with proper structure
    const items = orderItems.value.map(item => ({
      productId: item.productId,
      productName: item.name,
      sku: item.sku || '',
      quantity: item.quantity,
      unitPrice: item.price,
      total: item.price * item.quantity
    }))

    // Determine status based on mode
    let status = 'pending' // default: create only
    if (mode === 'approve') {
      status = 'confirmed' // create and approve
    } else if (mode === 'ship') {
      status = 'shipping' // create and ship (ready to export)
    }

    const orderData = {
      // Customer info
      customerId: selectedCustomer.value?.id || null,
      customerName: selectedCustomer.value?.name || 'Khách lẻ',
      customerPhone: selectedCustomer.value?.phone || '',
      customerAddress: selectedCustomer.value?.address || '',
      
      // Branch info
      branchId: 1,
      branchName: 'Chi nhánh mặc định',
      
      // Staff info  
      staffId: 1,
      staffName: 'Lê Nguyễn Thùy Linh',
      
      // Order status
      status: status,
      
      // Order details
      source: 'Web',
      discount: discount.value,
      discountType: 'fixed',
      shippingFee: shippingFee.value,
      shippingMethod: 'pickup',
      
      // Amounts
      subtotal: orderSubtotal,
      total: orderTotal,
      paidAmount: 0, // Not paid yet
      remainingAmount: orderTotal,
      
      // Payment
      paymentStatus: 'unpaid',
      paymentMethod: selectedPaymentMethod.value || 'cash',
      expectedPaymentMethod: selectedPaymentMethod.value || 'cash',
      
      // Items
      items: items,
      
      // Optional
      note: '',
      tags: []
    }
    
    const result = await orderService.createOrder(orderData)
    if (result.success) {
      const orderId = result.data?.id || result.data
      ElMessage.success('Tạo đơn hàng thành công')
      // Go to order detail page
      router.push(`/orders/${orderId}`)
    } else {
      ElMessage.error(result.message || 'Lỗi tạo đơn hàng')
    }
  } catch (e: any) {
    console.error('Create order error:', e)
    ElMessage.error(e.response?.data?.message || e.message || 'Lỗi tạo đơn hàng')
  } finally {
    submitting.value = false
  }
}

function handleSaveDraft() {
  showMoreMenu.value = false
  ElMessage.success('Đã lưu nháp')
}

function handleCheckInventory() {
  showMoreMenu.value = false
  if (orderItems.value.length === 0) {
    ElMessage.warning('Chưa có sản phẩm để kiểm tra')
    return
  }
  ElMessage.info('Kiểm tra tồn kho...')
}

function handlePrint() {
  showMoreMenu.value = false
  ElMessage.info('In đơn...')
}

function handleCancel() {
  showMoreMenu.value = false
  router.push('/orders')
}

async function loadData() {
  try {
    const [prodRes, custRes] = await Promise.all([
      productService.getProducts({ page: 1, pageSize: 100 }),
      customerService.getCustomers({ page: 1, pageSize: 100 })
    ])
    // productService returns data directly, not wrapped in success
    products.value = prodRes?.data || prodRes?.items || prodRes || []
    customers.value = custRes?.data?.data || custRes?.data?.items || custRes?.data || []
  } catch (e) {
    console.error('Load data error:', e)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.mobile-order-create {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.mobile-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid #e4e7ed;
  background: #fff;

  .header-left .el-icon { font-size: 24px; cursor: pointer; color: #606266; }
  .search-input { flex: 1; }
  .header-right .el-icon { font-size: 22px; cursor: pointer; color: #606266; }
  .barcode-icon { font-size: 20px; color: #409eff; cursor: pointer; }
}

.mobile-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 100px;
}

.empty-cart {
  text-align: center;
  padding: 60px 20px;

  .cart-icon { 
    color: #dcdfe6; 
    margin-bottom: 16px;
  }
  p { font-size: 14px; color: #909399; margin-bottom: 8px; }
}

.cart-items {
  padding: 0 16px;

  .cart-item {
    position: relative;
    padding: 16px 0;
    border-bottom: 1px solid #f5f5f5;

    .item-main { padding-right: 30px; }
    .item-name { font-size: 15px; font-weight: 500; margin-bottom: 4px; }
    .item-sku { font-size: 12px; color: #909399; margin-bottom: 4px; }
    .item-price { font-size: 14px; color: #303133; margin-bottom: 4px; }
    .item-available { 
      font-size: 12px; 
      color: #909399;
      .text-success { color: #67c23a; font-weight: 500; }
      .text-danger { color: #f56c6c; font-weight: 500; }
    }
    
    .remove-btn { 
      position: absolute; 
      top: 16px; 
      right: 0; 
      color: #909399; 
      cursor: pointer;
      font-size: 18px;
    }
    
    .item-controls { 
      display: flex; 
      align-items: center; 
      gap: 8px; 
      margin-top: 12px;
    }
    
    .item-stock {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 8px;
      font-size: 13px;
      
      .el-icon { color: #f56c6c; }
      .text-danger { color: #f56c6c; }
    }
  }
}

.section-divider { height: 8px; background: #f5f7fa; }

.action-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  cursor: pointer;

  .icon-blue { color: #409eff; font-size: 18px; }
  .label-blue { color: #409eff; font-size: 14px; }
  span { flex: 1; font-size: 14px; color: #303133; }
  .arrow { color: #c0c4cc; font-size: 14px; }
}

.order-summary {
  padding: 0 16px;

  .summary-row {
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    font-size: 14px;
    border-bottom: 1px solid #f5f5f5;

    &:last-child { border-bottom: none; }
    &.clickable { cursor: pointer; }
    .label-blue { color: #409eff; }
  }
}

.info-section {
  padding: 16px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    
    .close-icon { color: #909399; cursor: pointer; }
  }
  
  .section-label { font-size: 14px; font-weight: 500; color: #303133; }
  
  .add-row { 
    display: flex; 
    align-items: center; 
    gap: 8px; 
    cursor: pointer;
    .el-icon { color: #409eff; }
  }
  
  &.customer-section {
    background: #fff;
    
    .customer-detail {
      cursor: pointer;
      
      .customer-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        
        .el-icon { color: #606266; }
        .name { font-weight: 500; color: #409eff; }
        .phone { color: #303133; }
      }
      
      .customer-meta {
        font-size: 13px;
        color: #909399;
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        
        .divider { color: #dcdfe6; }
        .activate-link { font-size: 13px; }
      }
      
      .address-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
        
        .label { font-size: 13px; color: #909399; }
      }
      
      .address-text {
        font-size: 14px;
        color: #303133;
        line-height: 1.5;
      }
    }
  }
}

.temp-total {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  font-size: 14px;
  background: #fafafa;

  .amount { font-size: 20px; font-weight: 600; color: #f56c6c; }
}

.mobile-bottom {
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
  z-index: 100;

  .submit-btn { flex: 1; height: 48px; font-size: 16px; border-radius: 8px; }
  .more-btn { width: 48px; height: 48px; padding: 0; border-radius: 8px; }
}

.product-list, .customer-list {
  .product-item, .customer-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f5f5f5;
    cursor: pointer;
    gap: 12px;

    &:active { background: #f9f9f9; }
  }

  .product-image { width: 50px; height: 50px; border-radius: 6px; object-fit: cover; }
  .product-info, .customer-name { flex: 1; }
  .product-name { font-size: 14px; font-weight: 500; }
  .product-price, .customer-phone { font-size: 13px; color: #909399; }
}

.menu-item {
  padding: 18px 20px;
  font-size: 16px;
  color: #303133;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;

  &:active { background: #f5f7fa; }
  &.cancel { color: #f56c6c; }
}

.payment-list {
  .payment-item {
    padding: 16px 20px;
    font-size: 15px;
    color: #303133;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;

    &:active { background: #f5f7fa; }
    &.active { color: #409eff; font-weight: 500; }
  }
}

.create-options {
  .option-header {
    font-size: 16px;
    font-weight: 600;
    text-align: center;
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
  }

  .timeline-preview {
    display: flex;
    align-items: center;
    padding: 20px 16px;
    background: #f9f9f9;

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;

      .dot {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid #dcdfe6;
        background: #fff;
      }

      span { font-size: 11px; color: #909399; }

      &.active {
        .dot {
          background: #409eff;
          border-color: #409eff;
        }
        span { color: #409eff; }
      }
    }

    .line {
      flex: 1;
      height: 2px;
      background: #dcdfe6;
      margin: 0 4px;
      margin-bottom: 18px;

      &.active { background: #409eff; }
    }
  }

  .option-item {
    padding: 16px 20px;
    font-size: 15px;
    color: #303133;
    text-align: center;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;

    &:active { background: #f5f7fa; }
    &.primary { 
      color: #409eff; 
      font-weight: 500;
      background: #ecf5ff;
    }
  }
}

.mb-3 { margin-bottom: 12px; }
</style>
