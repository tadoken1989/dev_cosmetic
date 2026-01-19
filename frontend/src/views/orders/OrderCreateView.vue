<template>
  <!-- Mobile View -->
  <MobileOrderCreate v-if="isMobile" />
  
  <!-- Desktop View -->
  <div v-else class="order-create">
    <!-- Header -->
    <div class="page-header-bar">
      <div class="header-left">
        <span class="page-title">Tạo đơn hàng</span>
      </div>
      <div class="header-right">
        <el-button @click="$router.push('/orders')">Thoát</el-button>
        <el-dropdown split-button type="primary" @click="handleSubmit">
          Tạo đơn hàng (F1)
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleSubmitAndPrint">Tạo và in đơn</el-dropdown-item>
              <el-dropdown-item @click="handleSubmitAndNew">Tạo và tạo mới</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- Order Content -->
    <div class="order-content">
      <!-- Row 1: Customer Info + Additional Info -->
      <el-row :gutter="16" class="top-row">
        <el-col :span="16">
          <!-- Customer Info Card -->
          <el-card class="section-card customer-card">
            <template #header>
              <span>Thông tin khách hàng</span>
            </template>
            
            <div v-if="!selectedCustomer" class="customer-search-section">
              <el-input
                v-model="customerSearchText"
                placeholder="Tìm theo tên, SĐT, mã khách hàng ... (F4)"
                @focus="handleCustomerFocus"
                @input="handleCustomerSearch"
                @keydown.esc="showCustomerDropdown = false"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>

              <!-- Customer Dropdown -->
              <div 
                v-if="showCustomerDropdown" 
                class="customer-dropdown-list"
                @scroll="handleCustomerScroll"
                ref="customerDropdownRef"
              >
                <div class="dropdown-item add-new" @click="showCustomerDialog = true">
                  <el-icon color="#409eff"><Plus /></el-icon>
                  <span class="add-text">Thêm mới khách hàng</span>
                </div>
                <div
                  v-for="customer in filteredCustomers"
                  :key="customer.id"
                  class="dropdown-item customer-item"
                  @click="selectCustomer(customer)"
                >
                  <el-avatar :size="36" :style="{ background: getAvatarColor(customer.name) }">
                    {{ maskName(customer.name) }}
                  </el-avatar>
                  <div class="customer-info">
                    <div class="name">{{ customer.name }}</div>
                    <div class="phone">{{ customer.phone || 'Chưa có số điện thoại' }}</div>
                  </div>
                </div>
                <div v-if="filteredCustomers.length === 0 && customerSearchText" class="dropdown-item empty">
                  Không tìm thấy khách hàng phù hợp
                </div>
              </div>

              <!-- Empty state -->
              <div v-if="!showCustomerDropdown" class="empty-customer">
                <el-icon :size="48" color="#c0c4cc"><UserFilled /></el-icon>
                <p>Chưa có thông tin khách hàng</p>
                <el-button type="primary" size="small" @click="handleCustomerFocus">
                  Tìm khách hàng
                </el-button>
              </div>
            </div>

            <!-- Selected customer display -->
            <div v-else class="selected-customer">
              <div class="customer-header">
                <el-link type="primary" class="customer-name">{{ selectedCustomer.name }}</el-link>
                <span v-if="selectedCustomer.phone"> - {{ selectedCustomer.phone }}</span>
                <el-button type="danger" :icon="Close" circle size="small" @click="clearCustomer" />
              </div>
              <div v-if="selectedCustomer.address" class="customer-address">
                <div class="address-header">
                  <strong>ĐỊA CHỈ GIAO HÀNG</strong>
                  <el-link type="primary" size="small">Thay đổi</el-link>
                </div>
                <p>{{ selectedCustomer.name }}</p>
                <p>{{ selectedCustomer.address }}</p>
              </div>
              <div class="customer-stats">
                <div class="stat-row">
                  <span>Nợ phải thu</span>
                  <span class="text-danger">{{ formatCurrency(selectedCustomer.debt || 0) }}</span>
                </div>
                <div class="stat-row">
                  <span>Tổng chi tiêu ({{ selectedCustomer.totalOrders || 0 }} đơn)</span>
                  <span>{{ formatCurrency(selectedCustomer.totalSpent || 0) }}</span>
                </div>
                <div class="stat-row">
                  <span>Trả hàng (0 sản phẩm)</span>
                  <span>0</span>
                </div>
                <div class="stat-row">
                  <span>Giao hàng thất bại (0 đơn)</span>
                  <span>0</span>
                </div>
              </div>
              <el-link type="primary">Xem thêm ▼</el-link>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <!-- Additional Info Card -->
          <el-card class="section-card">
            <template #header>
              <div class="section-header">
                <span>Thông tin bổ sung</span>
                <el-button :icon="Setting" circle size="small" />
              </div>
            </template>
            
            <el-form label-width="120px" label-position="left" size="default">
              <el-form-item label="Bán tại">
                <el-select v-model="form.branchId" style="width: 100%">
                  <el-option label="Chi nhánh mặc định" :value="1" />
                </el-select>
              </el-form-item>
              <el-form-item label="Bán bởi">
                <el-select v-model="form.staffId" style="width: 100%">
                  <el-option label="Lê Nguyễn Thùy Linh" :value="1" />
                </el-select>
              </el-form-item>
              <el-form-item label="Nguồn">
                <el-select v-model="form.source" style="width: 100%">
                  <el-option label="Web" value="Web" />
                  <el-option label="POS" value="POS" />
                  <el-option label="Shopee" value="Shopee" />
                  <el-option label="Lazada" value="Lazada" />
                </el-select>
              </el-form-item>
              <el-form-item label="Hẹn giao">
                <el-date-picker
                  v-model="form.expectedDeliveryDate"
                  type="datetime"
                  placeholder="Chọn ngày"
                  style="width: 100%"
                  size="small"
                />
              </el-form-item>
              <el-form-item label="Mã đơn">
                <el-input v-model="form.customOrderCode" disabled size="small" />
              </el-form-item>
              <el-form-item label="Đường dẫn đơn hàng">
                <el-input v-model="form.orderUrl" placeholder="https://" size="small" />
              </el-form-item>
              <el-form-item label="Tham chiếu">
                <el-input v-model="form.reference" size="small" />
              </el-form-item>
              <el-form-item label="Thanh toán dự kiến">
                <el-select v-model="form.expectedPaymentMethod" style="width: 100%" size="small">
                  <el-option label="Quẹt thẻ" value="card" />
                  <el-option label="COD" value="cod" />
                  <el-option label="Chuyển khoản" value="transfer" />
                  <el-option label="Tiền mặt" value="cash" />
                  <el-option label="Ví Shopee" value="shopee" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-checkbox v-model="form.splitLine">Tách dòng</el-checkbox>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>

      <!-- Row 2: Product Info -->
      <el-card class="section-card product-section">
        <template #header>
          <div class="section-header">
            <span>Thông tin sản phẩm</span>
            <div class="header-actions">
              <el-checkbox v-model="form.splitLine">Tách dòng</el-checkbox>
              <el-link type="primary" @click="openStockCheck">Kiểm tra tồn kho</el-link>
              <el-button :icon="Setting" circle size="small" />
            </div>
          </div>
        </template>

        <!-- Product Search Row -->
        <div class="product-search-row">
          <div class="product-search-wrapper">
            <el-input
              v-model="productSearchText"
              placeholder="Tìm theo tên, mã SKU, hoặc quét mã Barcode...(F3)"
              class="product-search"
              @focus="handleProductFocus"
              @input="handleProductSearchDebounced"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>

            <!-- Product Dropdown -->
            <div v-if="showProductDropdown" class="product-dropdown-list">
              <div class="dropdown-item add-new" @click="showProductModal = true">
                <el-icon color="#409eff"><Plus /></el-icon>
                <span class="add-text">Thêm mới sản phẩm</span>
              </div>
              <div
                v-for="product in filteredProducts"
                :key="product.id"
                class="dropdown-item product-item"
                @click="selectProduct(product)"
              >
                <el-image
                  v-if="product.images?.[0]?.url"
                  :src="product.images[0].url"
                  fit="cover"
                  class="product-thumb"
                />
                <div v-else class="product-thumb no-image">
                  <el-icon><Picture /></el-icon>
                </div>
                <div class="product-info">
                  <div class="name">{{ product.name }}</div>
                  <div class="meta">
                    <span class="sku">{{ product.sku }}</span>
                    <span class="variant">Mặc định</span>
                  </div>
                </div>
                <div class="product-right">
                  <div class="price">{{ formatCurrency(product.retailPrice) }}</div>
                  <div class="stock">
                    Tồn: <span>{{ product.stockQuantity || 2 }}</span>
                    <span class="divider">|</span>
                    Có thể bán: <span :class="(product.availableQuantity || product.stockQuantity || 0) <= 0 ? 'text-danger' : 'text-success'">{{ product.availableQuantity || product.stockQuantity || 0 }}</span>
                  </div>
                </div>
              </div>
              <div v-if="filteredProducts.length === 0 && productSearchText" class="dropdown-item empty">
                Không tìm thấy sản phẩm
              </div>
            </div>
          </div>
          <el-button>Chọn nhanh</el-button>
          <el-button :icon="ShoppingCart">(F10) ▼</el-button>
          <el-select v-model="priceType" style="width: 120px" size="small">
            <el-option label="Giá bán lẻ" value="retail" />
            <el-option label="Giá bán buôn" value="wholesale" />
          </el-select>
        </div>

        <!-- Products Table -->
        <div v-if="orderItems.length > 0" class="products-table">
          <el-table :data="orderItems" style="width: 100%">
            <el-table-column label="STT" width="50" type="index" />
            <el-table-column label="Ảnh" width="60">
              <template #default="{ row }">
                <el-image
                  v-if="row.imageUrl"
                  :src="row.imageUrl"
                  fit="cover"
                  class="item-thumb"
                />
                <div v-else class="item-thumb no-image">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="Tên sản phẩm" min-width="200">
              <template #default="{ row }">
                <template v-if="row.isService">
                  <el-input v-model="row.productName" placeholder="Tên dịch vụ" />
                </template>
                <template v-else>
                  <div class="product-cell">
                    <span class="name">{{ row.productName }}</span>
                    <el-tooltip v-if="row.note" :content="row.note">
                      <el-icon class="note-icon"><InfoFilled /></el-icon>
                    </el-tooltip>
                  </div>
                  <div class="variant">{{ row.variantName || 'Mặc định' }}</div>
                  <div class="sku">{{ row.sku }}</div>
                </template>
              </template>
            </el-table-column>
            <el-table-column label="Số lượng" width="100">
              <template #default="{ row, $index }">
                <el-input-number
                  v-model="row.quantity"
                  :min="1"
                  size="small"
                  controls-position="right"
                  @change="updateItemTotal($index)"
                />
              </template>
            </el-table-column>
            <el-table-column label="Đơn giá" width="120">
              <template #default="{ row, $index }">
                <el-input-number
                  v-model="row.unitPrice"
                  :min="0"
                  :controls="false"
                  size="small"
                  @change="updateItemTotal($index)"
                />
              </template>
            </el-table-column>
            <el-table-column label="Chiết khấu" width="100">
              <template #default="{ row, $index }">
                <el-input-number
                  v-model="row.discount"
                  :min="0"
                  :controls="false"
                  size="small"
                  @change="updateItemTotal($index)"
                />
              </template>
            </el-table-column>
            <el-table-column label="Thành tiền" width="120" align="right">
              <template #default="{ row }">
                {{ formatCurrency(row.total) }}
              </template>
            </el-table-column>
            <el-table-column width="40">
              <template #default="{ $index }">
                <el-button type="danger" text :icon="Close" @click="removeItem($index)" />
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- Empty state -->
        <div v-else class="empty-products">
          <el-icon :size="60" color="#c0c4cc"><Box /></el-icon>
          <p>Chưa có thông tin sản phẩm</p>
          <el-button type="primary" @click="focusProductSearch">Thêm sản phẩm</el-button>
        </div>

        <!-- Below table: Service, Tags, Notes, Totals -->
        <div class="below-table">
          <el-row :gutter="20">
            <el-col :span="12">
              <!-- Add service -->
              <div class="add-service" @click="addService">
                <el-icon><Plus /></el-icon>
                <span>Thêm dịch vụ khác (F9)</span>
              </div>

              <!-- Tags -->
              <div class="form-section">
                <label>Tags <el-icon><InfoFilled /></el-icon></label>
                <el-select
                  v-model="form.tags"
                  multiple
                  filterable
                  allow-create
                  placeholder="Nhập ký tự và ấn enter"
                  style="width: 100%"
                />
              </div>

              <!-- Note -->
              <div class="form-section">
                <label>Ghi chú đơn hàng</label>
                <el-input
                  v-model="form.note"
                  type="textarea"
                  :rows="3"
                  placeholder="VD: Hàng tặng gói riêng"
                />
              </div>
            </el-col>

            <el-col :span="12">
              <!-- Apply promotion -->
              <div class="promotion-link">
                <el-icon><Present /></el-icon>
                <el-link type="primary">Áp dụng chương trình khuyến mại</el-link>
              </div>

              <!-- Totals -->
              <div class="order-totals">
                <div class="total-row">
                  <span>Tổng tiền ({{ orderItems.length }} sản phẩm)</span>
                  <span>{{ formatCurrency(subtotal) }}</span>
                </div>
                <div class="total-row clickable" @click="showDiscountDialog = true">
                  <span>Chiết khấu (F6)</span>
                  <span class="text-link">{{ formatCurrency(form.discount || 0) }}</span>
                </div>
                <div class="total-row clickable" @click="showShippingDialog = true">
                  <span class="text-link">Phí giao hàng (F7)</span>
                  <span>{{ formatCurrency(form.shippingFee || 0) }}</span>
                </div>
                <div class="total-row clickable">
                  <span class="text-link">Mã giảm giá ▼</span>
                  <span>0</span>
                </div>
                <div class="total-row highlight">
                  <span>Khách phải trả</span>
                  <span class="amount">{{ formatCurrency(total) }}</span>
                </div>
                <div class="total-row">
                  <span>Khách đã trả</span>
                  <span>{{ formatCurrency(form.paidAmount || 0) }}</span>
                </div>
                <!-- Payment Methods List -->
                <div v-if="addedPayments.length > 0" class="added-payments">
                  <div 
                    v-for="(payment, idx) in addedPayments" 
                    :key="idx" 
                    class="payment-item"
                  >
                    <el-icon color="#f56c6c" @click="removeAddedPayment(idx)" class="remove-icon"><Close /></el-icon>
                    <el-dropdown trigger="click" @command="(cmd: string) => changePaymentMethod(idx, cmd)">
                      <span class="payment-label">
                        {{ payment.label }} <el-icon><ArrowDown /></el-icon>
                      </span>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item command="shopee">Ví Shopee</el-dropdown-item>
                          <el-dropdown-item command="cash">Tiền mặt</el-dropdown-item>
                          <el-dropdown-item command="transfer">Chuyển khoản</el-dropdown-item>
                          <el-dropdown-item command="card">Quẹt thẻ</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                    <span class="payment-amount">{{ formatCurrency(payment.amount) }}</span>
                  </div>
                </div>
                <el-dropdown trigger="click" @command="selectAndAddPayment">
                  <div class="payment-method">
                    <el-icon><Plus /></el-icon>
                    <span>Thêm phương thức</span>
                  </div>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item 
                        v-for="method in paymentMethods" 
                        :key="method.value"
                        :command="method"
                      >
                        {{ method.label }}
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <el-divider />
                <div class="total-row remaining">
                  <span>Còn phải trả</span>
                  <span class="amount">{{ formatCurrency(remaining) }}</span>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>

      <!-- Row 3: Shipping -->
      <el-card class="section-card">
        <template #header>
          <span>Đóng gói và giao hàng</span>
        </template>
        <div class="shipping-options">
          <el-radio-group v-model="form.shippingMethod">
            <el-radio-button value="carrier">
              <el-icon><Van /></el-icon> Đẩy qua hãng vận chuyển
            </el-radio-button>
            <el-radio-button value="external">
              <el-icon><Bicycle /></el-icon> Đẩy vận chuyển ngoài
            </el-radio-button>
            <el-radio-button value="pickup">
              <el-icon><House /></el-icon> Khách nhận tại cửa hàng
            </el-radio-button>
            <el-radio-button value="later">
              <el-icon><Clock /></el-icon> Giao hàng sau
            </el-radio-button>
          </el-radio-group>
        </div>
        <p class="shipping-note" v-if="!selectedCustomer">
          Bạn hãy thêm thông tin khách hàng để sử dụng dịch vụ giao hàng. 
          <el-link type="primary">Cập nhật tại đây</el-link>
        </p>
      </el-card>
    </div>

    <!-- Customer Dialog -->
    <el-dialog v-model="showCustomerDialog" title="Thêm mới khách hàng" width="600px" class="customer-dialog">
      <el-alert
        type="info"
        :closable="true"
        show-icon
        style="margin-bottom: 20px"
      >
        <template #default>
          Nếu hãng vận chuyển của bạn đang chưa hỗ trợ địa chỉ mới, bạn có thể đổi về địa chỉ cũ để thực hiện đẩy đơn vận chuyển <el-link type="primary">tại đây</el-link>.
        </template>
      </el-alert>

      <el-form :model="newCustomer" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Tên khách hàng" required>
              <el-input v-model="newCustomer.name" placeholder="" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Số điện thoại">
              <el-input v-model="newCustomer.phone" placeholder="" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item>
          <div class="address-toggle">
            <el-switch v-model="useNewAddress" />
            <span>Địa chỉ mới</span>
            <el-icon><InfoFilled /></el-icon>
          </div>
        </el-form-item>

        <template v-if="useNewAddress">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Khu vực" required>
                <el-select v-model="newCustomer.province" placeholder="Chọn Tỉnh/Thành phố" style="width: 100%">
                  <el-option label="Hà Nội" value="Hà Nội" />
                  <el-option label="TP. Hồ Chí Minh" value="TP. Hồ Chí Minh" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Phường xã" required>
                <el-select v-model="newCustomer.ward" placeholder="Chọn Phường/Xã" style="width: 100%">
                  <el-option label="Phường 1" value="Phường 1" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="Địa chỉ cụ thể" required>
            <el-input v-model="newCustomer.address" placeholder="Nhập số nhà, tên đường, tên khu vực" />
          </el-form-item>
        </template>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Mã khách hàng">
              <el-input v-model="newCustomer.customerCode" placeholder="Mã mặc định" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Nhân viên phụ trách">
              <el-select v-model="newCustomer.staffId" placeholder="" style="width: 100%">
                <el-option label="Lê Nguyễn Thùy Linh" :value="1" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <div class="more-info" @click="showMoreCustomerFields = !showMoreCustomerFields">
          <el-icon><Plus /></el-icon>
          <span>Thông tin thêm</span>
        </div>

        <div class="change-address">
          <el-icon><Switch /></el-icon>
          <span>Chuyển đổi địa chỉ</span>
        </div>
      </el-form>

      <template #footer>
        <el-button @click="showCustomerDialog = false">Thoát</el-button>
        <el-button type="primary" @click="createCustomer">Thêm</el-button>
      </template>
    </el-dialog>

    <!-- Payment Methods Selection -->
    <el-popover
      :visible="showPaymentPopover"
      placement="top"
      :width="200"
      trigger="click"
    >
      <template #reference>
        <span></span>
      </template>
      <div class="payment-methods-list">
        <div 
          v-for="method in paymentMethods" 
          :key="method.value"
          class="payment-method-item"
          @click="selectPaymentMethod(method)"
        >
          {{ method.label }}
        </div>
      </div>
    </el-popover>

    <!-- Payment Dialog -->
    <el-dialog v-model="showPaymentDialog" title="Thanh toán" width="400px">
      <el-form label-width="100px">
        <div v-if="selectedPaymentMethod" class="selected-payment-method">
          <el-icon color="#f56c6c" @click="removePaymentMethod"><Close /></el-icon>
          <span>{{ selectedPaymentMethod.label }}</span>
          <el-icon><ArrowDown /></el-icon>
        </div>
        <el-form-item label="Số tiền">
          <el-input-number v-model="paymentAmount" :min="0" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPaymentDialog = false">Hủy</el-button>
        <el-button type="primary" @click="addPayment">Xác nhận</el-button>
      </template>
    </el-dialog>

    <!-- Shipping Fee Dialog -->
    <el-dialog v-model="showShippingDialog" title="Chọn phí vận chuyển" width="500px">
      <el-alert
        type="warning"
        :closable="false"
        show-icon
        style="margin-bottom: 20px"
      >
        KHÔNG CÓ PHÍ GIAO HÀNG PHÙ HỢP<br>
        Bạn vui lòng kiểm tra lại thông tin đơn hàng hoặc thiết lập phí <el-link type="primary">tại đây</el-link>
      </el-alert>
      <el-radio-group v-model="shippingFeeType">
        <el-radio value="custom">Phí khác</el-radio>
      </el-radio-group>
      <el-input-number
        v-model="shippingFeeAmount"
        :min="0"
        placeholder="50,000"
        style="width: 100%; margin-top: 12px"
      />
      <el-link type="primary" style="display: block; margin-top: 12px">
        → Xem phí gợi ý của đối tác vận chuyển
      </el-link>
      <template #footer>
        <el-button @click="showShippingDialog = false">Thoát</el-button>
        <el-button type="primary" @click="applyShippingFee">Áp dụng</el-button>
      </template>
    </el-dialog>

    <!-- Stock Check Modal -->
    <el-dialog v-model="showStockCheckDialog" title="Kiểm tra tồn kho" width="900px">
      <div class="stock-check-filters">
        <el-select v-model="stockCheckBranch" style="width: 200px" size="small">
          <el-option label="Chi nhánh mặc định" value="1" />
        </el-select>
        <el-button style="margin-left: 12px" size="small">Cột hiển thị</el-button>
      </div>

      <div v-if="stockCheckData.length === 0" class="stock-check-empty">
        <el-empty description="Chưa có sản phẩm nào">
          <el-button type="primary" @click="showStockCheckDialog = false; focusProductSearch()">
            Thêm sản phẩm vào đơn
          </el-button>
        </el-empty>
      </div>

      <template v-else>
        <el-table :data="stockCheckData" style="width: 100%; margin-top: 16px">
          <el-table-column label="Mã SKU" width="120">
            <template #default="{ row }">
              <el-link type="primary">{{ row.sku }}</el-link>
            </template>
          </el-table-column>
          <el-table-column label="Tên sản phẩm" min-width="200">
            <template #default="{ row }">{{ row.name }}</template>
          </el-table-column>
          <el-table-column label="Số lượng" width="80" align="center">
            <template #default="{ row }">{{ row.orderQuantity }}</template>
          </el-table-column>
          <el-table-column label="Chính sách giá" align="center">
            <el-table-column label="Giá bán lẻ" width="110" align="right">
              <template #default="{ row }">{{ formatCurrency(row.retailPrice) }}</template>
            </el-table-column>
            <el-table-column label="Giá bán buôn" width="110" align="right">
              <template #default="{ row }">{{ formatCurrency(row.wholesalePrice || 0) }}</template>
            </el-table-column>
          </el-table-column>
          <el-table-column label="Chi nhánh mặc định" align="center">
            <el-table-column label="Tồn kho" width="90" align="center">
              <template #default="{ row }">{{ row.stockQuantity }}</template>
            </el-table-column>
            <el-table-column label="Có thể bán" width="90" align="center">
              <template #default="{ row }">
                <span :class="{ 'text-danger': row.availableQuantity < 0, 'text-success': row.availableQuantity > 0 }">
                  {{ row.availableQuantity }}
                </span>
              </template>
            </el-table-column>
          </el-table-column>
        </el-table>
      </template>

      <template #footer>
        <el-button @click="showStockCheckDialog = false">Thoát</el-button>
      </template>
    </el-dialog>

    <!-- Quick Add Product Modal -->
    <el-dialog v-model="showProductModal" title="Thêm nhanh sản phẩm" width="600px">
      <el-form :model="quickProduct" label-position="top">
        <el-form-item label="Tên sản phẩm" required>
          <el-input v-model="quickProduct.name" placeholder="Nhập tên sản phẩm" />
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Mã sản phẩm/SKU">
              <el-input v-model="quickProduct.sku" placeholder="Nhập tay hoặc dùng máy quét" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Khối lượng (dùng tính phí vận chuyển)">
              <el-input v-model="quickProduct.weight" placeholder="0">
                <template #append>
                  <el-select v-model="quickProduct.weightUnit" style="width: 60px">
                    <el-option label="g" value="g" />
                    <el-option label="kg" value="kg" />
                  </el-select>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Mã vạch/Barcode">
              <el-input v-model="quickProduct.barcode" placeholder="Nhập tay hoặc dùng máy quét">
                <template #suffix>
                  <el-tooltip content="Mã vạch sản phẩm">
                    <el-icon><InfoFilled /></el-icon>
                  </el-tooltip>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Đơn vị tính">
              <el-input v-model="quickProduct.unit" placeholder="" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Loại sản phẩm">
              <el-input v-model="quickProduct.productType" placeholder="Nhập loại sản phẩm" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Giá bán lẻ">
              <el-input-number v-model="quickProduct.retailPrice" :min="0" :controls="false" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Giá vốn">
              <el-input-number v-model="quickProduct.costPrice" :min="0" :controls="false" style="width: 100%">
                <template #suffix>
                  <el-tooltip content="Giá vốn sản phẩm">
                    <el-icon><InfoFilled /></el-icon>
                  </el-tooltip>
                </template>
              </el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Tồn kho">
              <el-input-number v-model="quickProduct.stockQuantity" :min="0" :controls="false" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <el-button @click="showProductModal = false">Thoát</el-button>
        <el-button type="primary" @click="createQuickProduct">Thêm</el-button>
      </template>
    </el-dialog>

    <!-- Mobile More Menu -->
    <el-drawer
      v-model="showMobileMoreMenu"
      direction="btt"
      :with-header="false"
      size="auto"
    >
      <div class="mobile-menu-item" @click="handleSubmitAndPrint">Tạo và in đơn</div>
      <div class="mobile-menu-item" @click="handleSubmitAndNew">Tạo và tạo mới</div>
    </el-drawer>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Plus, Close, Picture, Box, Van, Bicycle, House, Clock,
  Setting, InfoFilled, ShoppingCart, Present, UserFilled, Switch, Search, ArrowDown
} from '@element-plus/icons-vue'
import { orderService } from '@/services/order.service'
import { customerService } from '@/services/customer.service'
import { productService } from '@/services/product.service'
import { useDevice } from '@/composables/useDevice'
import MobileOrderCreate from '@/components/mobile/MobileOrderCreate.vue'

// Custom scan icon
const Scan = {
  template: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 4h2v16H2V4zm4 0h1v16H6V4zm3 0h2v16H9V4zm4 0h1v16h-1V4zm3 0h2v16h-2V4zm4 0h2v16h-2V4z"/></svg>`
}

// Import More icon
const More = {
  template: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>`
}

const ArrowRight = {
  template: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>`
}

const { isMobile } = useDevice()

// Mobile specific
const showMobileMoreMenu = ref(false)
const submitting = ref(false)
const showPaymentPopover = ref(false)

const router = useRouter()
const productSelectRef = ref()

// Form data
const form = reactive({
  customerId: null as number | null,
  customerName: '',
  customerPhone: '',
  customerAddress: '',
  branchId: 1,
  branchName: 'Chi nhánh mặc định',
  staffId: 1 as number | null,
  staffName: 'Lê Nguyễn Thùy Linh',
  source: 'Web',
  discount: 0,
  discountType: 'fixed',
  shippingFee: 0,
  shippingMethod: 'pickup',
  expectedDeliveryDate: null,
  note: '',
  tags: [] as string[],
  paidAmount: 0,
  customOrderCode: '',
  orderUrl: '',
  reference: '',
  expectedPaymentMethod: 'cash',
  splitLine: false,
})

// Customer
const customerSearchText = ref('')
const selectedCustomer = ref<any>(null)
const showCustomerDialog = ref(false)
const showCustomerDropdown = ref(false)
const allCustomers = ref<any[]>([])
const filteredCustomers = ref<any[]>([])
const useNewAddress = ref(true)
const showMoreCustomerFields = ref(false)
const newCustomer = reactive({
  name: '',
  phone: '',
  province: '',
  ward: '',
  district: '',
  address: '',
  customerCode: '',
  staffId: 1,
})

// Products
const productSearchText = ref('')
const showProductDropdown = ref(false)
const showProductModal = ref(false)
const allProducts = ref<any[]>([])
const filteredProducts = ref<any[]>([])
const orderItems = ref<any[]>([])
const priceType = ref('retail')

// Payment & Fees
const showPaymentDialog = ref(false)
const paymentAmount = ref(0)
const paymentMethod = ref('cash')
const selectedPaymentMethod = ref<any>(null)
const addedPayments = ref<any[]>([])
const paymentMethods = [
  { label: 'Ví Shopee', value: 'shopee' },
  { label: 'Tiền mặt', value: 'cash' },
  { label: 'Chuyển khoản', value: 'transfer' },
  { label: 'Quẹt thẻ', value: 'card' },
]
const showDiscountDialog = ref(false)
const showShippingDialog = ref(false)
const shippingFeeType = ref('custom')
const shippingFeeAmount = ref(0)

// Quick Product
const quickProduct = reactive({
  name: '',
  sku: '',
  barcode: '',
  productType: '',
  costPrice: 0,
  retailPrice: 0,
  stockQuantity: 0,
  weight: '',
  weightUnit: 'g',
  unit: '',
})

// Stock Check
const showStockCheckDialog = ref(false)
const stockCheckBranch = ref('1')
const stockCheckPeriod = ref('all')
const stockCheckData = ref<any[]>([])

// Computed
const subtotal = computed(() => {
  return orderItems.value.reduce((sum: number, item: any) => {
    const itemTotal = Number(item.total) || 0
    return sum + (isNaN(itemTotal) ? 0 : itemTotal)
  }, 0)
})

const total = computed(() => {
  const sub = Number(subtotal.value) || 0
  const disc = Number(form.discount) || 0
  const ship = Number(form.shippingFee) || 0
  const result = sub - disc + ship
  return isNaN(result) ? 0 : result
})

const remaining = computed(() => {
  const tot = Number(total.value) || 0
  const paid = Number(form.paidAmount) || 0
  const result = tot - paid
  return isNaN(result) ? 0 : result
})

// Methods
function maskName(name: string): string {
  if (!name) return '?'
  const firstChar = name.charAt(0).toUpperCase()
  return firstChar
}

function getAvatarColor(name: string): string {
  // Generate a consistent color based on name
  if (!name) return '#409eff'
  const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#8e44ad']
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

async function loadAllCustomers() {
  try {
    const res = await customerService.getCustomers({ pageSize: 200 })
    allCustomers.value = res.data?.data || []
    // Don't set filteredCustomers to empty, keep current state
  } catch (e) {
    console.error('Load customers error:', e)
    allCustomers.value = []
  }
}

async function handleCustomerFocus() {
  // Show dropdown immediately with existing data
  showCustomerDropdown.value = true
  
  // Show existing customers immediately if available
  if (allCustomers.value.length > 0) {
    filteredCustomers.value = allCustomers.value.slice(0, 10)
  }
  
  // Load customers from API
  try {
    const res = await customerService.getAll({ page: 1, pageSize: 100 })
    allCustomers.value = res.data?.data || res.data || []
    // Update filtered list immediately after load
    if (!customerSearchText.value || customerSearchText.value.trim() === '') {
      filteredCustomers.value = allCustomers.value.slice(0, 10)
    }
  } catch (e) {
    console.error('Load customers error:', e)
    if (filteredCustomers.value.length === 0) {
      filteredCustomers.value = []
    }
  }
}

// Debounce timer for customer search
let customerSearchTimer: any = null

async function handleCustomerSearch(query: string) {
  showCustomerDropdown.value = true
  
  // Clear previous timer
  if (customerSearchTimer) {
    clearTimeout(customerSearchTimer)
  }
  
  if (!query || query.trim() === '') {
    filteredCustomers.value = allCustomers.value.slice(0, 10)
    return
  }

  // Debounce 200ms for smooth search
  customerSearchTimer = setTimeout(async () => {
    try {
      const res = await customerService.searchCustomers(query)
      filteredCustomers.value = res.data || []
    } catch (e) {
      // Fallback to local filter
      const q = query.toLowerCase()
      filteredCustomers.value = allCustomers.value.filter((customer: any) =>
        customer.name?.toLowerCase().includes(q) ||
        customer.phone?.includes(q) ||
        customer.customerCode?.toLowerCase().includes(q)
      )
    }
  }, 200)
}

function selectCustomer(customer: any) {
  selectedCustomer.value = customer
  form.customerId = customer.id
  form.customerName = customer.name
  form.customerPhone = customer.phone
  form.customerAddress = customer.address
  customerSearchText.value = customer.name
  showCustomerDropdown.value = false
}

function clearCustomer() {
  selectedCustomer.value = null
  form.customerId = null
  form.customerName = ''
  form.customerPhone = ''
  form.customerAddress = ''
  customerSearchText.value = ''
  showCustomerDropdown.value = false
}

async function createCustomer() {
  if (!newCustomer.name) {
    ElMessage.warning('Vui lòng nhập tên khách hàng')
    return
  }
  try {
    const customerData = {
      name: newCustomer.name,
      phone: newCustomer.phone,
      province: newCustomer.province,
      ward: newCustomer.ward,
      address: newCustomer.address,
    }
    const res = await customerService.createCustomer(customerData)
    if (res.success) {
      ElMessage.success('Thêm khách hàng thành công')
      selectedCustomer.value = res.data
      form.customerId = res.data.id
      form.customerName = res.data.name
      form.customerPhone = res.data.phone
      form.customerAddress = res.data.address
      showCustomerDialog.value = false
      // Reset form
      Object.assign(newCustomer, { name: '', phone: '', province: '', ward: '', address: '', customerCode: '' })
    }
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || 'Thêm khách hàng thất bại')
  }
}

async function loadAllProducts() {
  try {
    const res = await productService.getProducts({ page: 1, pageSize: 200 })
    allProducts.value = (res.data || []).map((p: any) => ({
      ...p,
      stockQuantity: p.stockQuantity || 0,
      availableQuantity: p.availableQuantity || 0,
    }))
    // Don't set filteredProducts, keep current state
  } catch (e) {
    console.error('Load products error:', e)
    allProducts.value = []
  }
}

// Product focus - load products immediately
async function handleProductFocus() {
  showProductDropdown.value = true
  
  // Show existing products immediately if available
  if (allProducts.value.length > 0) {
    filteredProducts.value = allProducts.value.slice(0, 10)
  }
  
  // Load products if not loaded yet or refresh
  try {
    const res = await productService.getProducts({ page: 1, pageSize: 100 })
    allProducts.value = (res.data || []).map((p: any) => ({
      ...p,
      stockQuantity: p.stockQuantity || 0,
      availableQuantity: p.availableQuantity || 0,
    }))
    
    // Update filtered list immediately after load
    if (!productSearchText.value || productSearchText.value.trim() === '') {
      filteredProducts.value = allProducts.value.slice(0, 10)
    }
  } catch (e) {
    console.error('Load products error:', e)
    if (filteredProducts.value.length === 0) {
      filteredProducts.value = []
    }
  }
}

// Debounce timer for product search
let productSearchTimer: any = null

function handleProductSearchDebounced(query: string) {
  showProductDropdown.value = true
  
  // Clear previous timer
  if (productSearchTimer) {
    clearTimeout(productSearchTimer)
  }
  
  if (!query || query.trim() === '') {
    filteredProducts.value = allProducts.value.slice(0, 10)
    return
  }

  // Debounce 200ms for smooth search
  productSearchTimer = setTimeout(async () => {
    try {
      const res = await productService.searchProducts(query)
      filteredProducts.value = (res || []).map((p: any) => ({
        ...p,
        stockQuantity: p.stockQuantity || 0,
        availableQuantity: p.availableQuantity || 0,
      }))
    } catch (e) {
      console.error('Search products error:', e)
      // Fallback to local filter
      const q = query.toLowerCase()
      filteredProducts.value = allProducts.value.filter((p: any) =>
        p.name?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q)
      )
    }
  }, 200)
}

function selectProduct(product: any) {
  if (!product) return

  // Check if product already exists
  const existingIndex = orderItems.value.findIndex((item: any) => item.productId === product.id && !item.isService)
  if (existingIndex > -1 && !form.splitLine) {
    orderItems.value[existingIndex].quantity += 1
    updateItemTotal(existingIndex)
  } else {
    const rawPrice = priceType.value === 'retail' ? product.retailPrice : (product.wholesalePrice || product.retailPrice)
    const price = Number(rawPrice) || 0
    orderItems.value.push({
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      variantName: 'Mặc định',
      imageUrl: product.images?.[0]?.url,
      quantity: 1,
      unitPrice: price,
      discount: 0,
      total: price,
      isService: false,
    })
  }
  productSearchText.value = ''
  showProductDropdown.value = false
}

function addService() {
  orderItems.value.push({
    productId: null,
    productName: '',
    sku: '',
    variantName: '',
    imageUrl: null,
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    total: 0,
    isService: true,
  })
}

function updateItemTotal(index: number) {
  const item = orderItems.value[index]
  if (!item) return
  
  const unitPrice = parseFloat(String(item.unitPrice)) || 0
  const discount = parseFloat(String(item.discount)) || 0
  const quantity = parseInt(String(item.quantity)) || 1
  
  // Ensure all values are valid numbers
  if (isNaN(unitPrice) || isNaN(discount) || isNaN(quantity)) {
    item.total = 0
    return
  }
  
  item.total = Math.max(0, (unitPrice - discount) * quantity)
}

function removeItem(index: number) {
  orderItems.value.splice(index, 1)
}

function focusProductSearch() {
  productSelectRef.value?.focus()
}

function addPayment() {
  if (selectedPaymentMethod.value && paymentAmount.value > 0) {
    addedPayments.value.push({
      method: selectedPaymentMethod.value.value,
      label: selectedPaymentMethod.value.label,
      amount: paymentAmount.value,
    })
    form.paidAmount += paymentAmount.value
  }
  showPaymentDialog.value = false
  paymentAmount.value = 0
  selectedPaymentMethod.value = null
}

function selectAndAddPayment(method: any) {
  selectedPaymentMethod.value = method
  paymentAmount.value = remaining.value > 0 ? remaining.value : 0
  showPaymentDialog.value = true
}

function selectPaymentMethod(method: any) {
  selectedPaymentMethod.value = method
  showPaymentPopover.value = false
}

function removePaymentMethod() {
  selectedPaymentMethod.value = null
}

function removeAddedPayment(index: number) {
  const payment = addedPayments.value[index]
  form.paidAmount -= payment.amount
  addedPayments.value.splice(index, 1)
}

function changePaymentMethod(index: number, methodValue: string) {
  const method = paymentMethods.find(m => m.value === methodValue)
  if (method) {
    addedPayments.value[index].method = method.value
    addedPayments.value[index].label = method.label
  }
}

async function createQuickProduct() {
  if (!quickProduct.name) {
    ElMessage.warning('Vui lòng nhập tên sản phẩm')
    return
  }
  
  try {
    const productData: any = {
      name: quickProduct.name,
      sku: quickProduct.sku || undefined,
      barcode: quickProduct.barcode || undefined,
      productType: quickProduct.productType || undefined,
      importPrice: quickProduct.costPrice || 0,
      retailPrice: quickProduct.retailPrice || 0,
      stockQuantity: quickProduct.stockQuantity || 0,
      unit: quickProduct.unit || undefined,
      weight: quickProduct.weight ? parseFloat(quickProduct.weight) : undefined,
      weightUnit: quickProduct.weightUnit,
      status: 'active',
      tags: [],
      managementType: 'normal',
      allowSale: true,
      applyTax: false,
      expiryWarningEnabled: false,
    }
    
    const res = await productService.createProduct(productData)
    if (res) {
      ElMessage.success('Thêm sản phẩm thành công')
      // Auto select the new product
      selectProduct(res)
      showProductModal.value = false
      // Reset form
      Object.assign(quickProduct, {
        name: '',
        sku: '',
        barcode: '',
        productType: '',
        costPrice: 0,
        retailPrice: 0,
        stockQuantity: 0,
        weight: '',
        weightUnit: 'g',
        unit: '',
      })
    }
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || 'Thêm sản phẩm thất bại')
  }
}

function applyShippingFee() {
  form.shippingFee = shippingFeeAmount.value
  showShippingDialog.value = false
}

async function openStockCheck() {
  // Prepare stock check data from current order items
  const { inventoryService } = await import('@/services/inventory.service')
  
  const stockData = await Promise.all(orderItems.value.map(async (item: any) => {
    let stockQuantity = 0
    let availableQuantity = 0
    let wholesalePrice = 0
    
    try {
      if (item.productId) {
        const invRes = await inventoryService.getProductInventory(item.productId)
        if (invRes.success && invRes.data) {
          stockQuantity = invRes.data.totalQuantity || 0
          availableQuantity = invRes.data.totalAvailable || 0
        }
        // Get product wholesale price
        const product = allProducts.value.find((p: any) => p.id === item.productId)
        wholesalePrice = product?.wholesalePrice || 0
      }
    } catch (e) {
      console.error('Error loading inventory:', e)
    }
    
    return {
      sku: item.sku,
      name: item.productName,
      orderQuantity: item.quantity,
      retailPrice: item.unitPrice,
      wholesalePrice,
      stockQuantity,
      availableQuantity,
    }
  }))
  
  stockCheckData.value = stockData
  showStockCheckDialog.value = true
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value || 0)
}

// Mobile helper functions
function scanBarcode() {
  ElMessage.info('Tính năng scan barcode đang phát triển')
}

function increaseItemQty(index: number) {
  orderItems.value[index].quantity++
  updateItemTotal(index)
}

function decreaseItemQty(index: number) {
  if (orderItems.value[index].quantity > 1) {
    orderItems.value[index].quantity--
    updateItemTotal(index)
  } else {
    orderItems.value.splice(index, 1)
  }
}

async function handleSubmit() {
  if (orderItems.value.length === 0) {
    ElMessage.warning('Vui lòng thêm sản phẩm vào đơn hàng')
    return
  }

  try {
    const orderData = {
      ...form,
      subtotal: subtotal.value,
      total: total.value,
      remainingAmount: remaining.value,
      paymentStatus: form.paidAmount >= total.value ? 'paid' : (form.paidAmount > 0 ? 'partial' : 'unpaid'),
      items: orderItems.value.filter((item: any) => item.productName), // Filter out empty services
    }

    const res = await orderService.createOrder(orderData)
    if (res.success) {
      ElMessage.success('Tạo đơn hàng thành công')
      router.push(`/orders/${res.data.id}`)
    }
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || 'Tạo đơn hàng thất bại')
  }
}

function handleSubmitAndPrint() {
  handleSubmit()
}

function handleSubmitAndNew() {
  handleSubmit().then(() => {
    orderItems.value = []
    clearCustomer()
    form.discount = 0
    form.shippingFee = 0
    form.paidAmount = 0
    form.note = ''
    form.tags = []
  })
}

onMounted(() => {
  // Preload customers and products
  loadAllCustomers()
  loadAllProducts()
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement
    if (!target.closest('.customer-search-section')) {
      showCustomerDropdown.value = false
    }
    if (!target.closest('.product-search-wrapper')) {
      showProductDropdown.value = false
    }
  })
})
</script>

<style scoped lang="scss">
.order-create {
  background: #f5f7fa;
  min-height: 100%;

  .page-header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 24px;
    background: #fff;
    border-bottom: 1px solid #e4e7ed;

    .page-title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }

    .header-right {
      display: flex;
      gap: 12px;
    }
  }

  .order-content {
    padding: 16px;
  }

  .top-row {
    .el-col {
      display: flex;
      flex-direction: column;
    }

    .section-card {
      flex: 1;
      display: flex;
      flex-direction: column;

      :deep(.el-card__body) {
        flex: 1;
        overflow-y: auto;
        max-height: 600px;
      }
    }
  }

  .section-card {
    margin-bottom: 16px;
    border-radius: 8px;

    :deep(.el-card__header) {
      padding: 12px 16px;
      border-bottom: 1px solid #ebeef5;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-actions {
        display: flex;
        align-items: center;
        gap: 16px;
      }
    }
  }

  // Customer section
  .customer-search-section {
    position: relative;
    margin-bottom: 20px;

    .el-input {
      :deep(.el-input__wrapper) {
        background: #fff;
      }
    }

    .customer-dropdown-list {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      background: #fff;
      border: 1px solid #dcdfe6;
      border-radius: 6px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
      max-height: 400px;
      overflow-y: auto;
      z-index: 2000;

      .dropdown-item {
        padding: 12px 16px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 12px;
        transition: background 0.2s;
        border-bottom: 1px solid #f5f7fa;

        &:last-child {
          border-bottom: none;
        }

        &:hover {
          background: #f5f7fa;
        }

        &.add-new {
          background: #f9fafb;
          border-bottom: 2px solid #e4e7ed;
          color: #409eff;
          font-weight: 500;
          padding: 14px 16px;

          .add-text {
            font-weight: 500;
          }

          &:hover {
            background: #ecf5ff;
          }
        }

        &.customer-item {
          .el-avatar {
            font-size: 15px;
            font-weight: 600;
          }
        }

        &.empty {
          color: #909399;
          cursor: default;
          justify-content: center;
          text-align: center;
          padding: 20px;
          font-size: 13px;

          &:hover {
            background: #fff;
          }
        }

        .customer-info {
          flex: 1;
          min-width: 0;

          .name {
            font-weight: 600;
            font-size: 14px;
            color: #303133;
            margin-bottom: 4px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .phone {
            font-size: 13px;
            color: #909399;
          }
        }
      }
    }

    .empty-customer {
      text-align: center;
      padding: 40px 20px;
      color: #909399;

      p {
        margin: 12px 0 16px 0;
        font-size: 14px;
      }
    }
  }

  .selected-customer {
    .customer-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;

      .customer-name {
        font-weight: 600;
        font-size: 15px;
      }
    }

    .customer-address {
      background: #f5f7fa;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 16px;

      .address-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;

        strong {
          font-size: 12px;
          color: #909399;
        }
      }

      p {
        margin: 4px 0;
        font-size: 14px;
      }
    }

    .customer-stats {
      .stat-row {
        display: flex;
        justify-content: space-between;
        padding: 6px 0;
        font-size: 14px;

        .text-danger {
          color: #f56c6c;
        }
      }
    }
  }

  // Additional Info - same height as Customer Info
  .el-col:nth-child(2) .section-card {
    height: calc(100% - 0px);
    display: flex;
    flex-direction: column;

    :deep(.el-card__body) {
      flex: 1;
    }
  }

  // Product section
  .product-section {
    .product-search-row {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;

      .product-search-wrapper {
        flex: 1;
        position: relative;
      }
    }

    .product-dropdown-list {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: #fff;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      max-height: 400px;
      overflow-y: auto;
      z-index: 100;
      margin-top: 4px;

      .dropdown-item {
        padding: 10px 12px;
        cursor: pointer;
        transition: background 0.2s;

        &:hover {
          background: #f5f7fa;
        }

        &.add-new {
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid #ebeef5;
          color: #409eff;

          .add-text {
            font-weight: 500;
          }
        }

        &.product-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        &.empty {
          color: #909399;
          cursor: default;
          text-align: center;

          &:hover {
            background: #fff;
          }
        }
      }

      .product-thumb {
        width: 48px;
        height: 48px;
        border-radius: 6px;
        flex-shrink: 0;

        &.no-image {
          background: #f0f2f5;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c0c4cc;
        }
      }

      .product-info {
        flex: 1;
        min-width: 0;

        .name {
          font-weight: 700;
          font-size: 14px;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .meta {
          display: flex;
          gap: 10px;
          font-size: 12px;

          .sku {
            color: #6b7280;
          }

          .variant {
            color: #3b82f6;
          }
        }
      }

      .product-right {
        text-align: right;
        flex-shrink: 0;
        min-width: 150px;

        .price {
          font-weight: 700;
          font-size: 15px;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .stock {
          font-size: 12px;
          color: #6b7280;

          .divider {
            margin: 0 6px;
          }

          .text-danger {
            color: #ef4444;
            font-weight: 500;
          }

          .text-success {
            color: #10b981;
            font-weight: 500;
          }
        }
      }
    }

    .products-table {
      margin-bottom: 16px;

      .item-thumb {
        width: 40px;
        height: 40px;
        border-radius: 4px;
        object-fit: cover;

        &.no-image {
          background: #f5f7fa;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c0c4cc;
        }
      }

      .product-cell {
        .name {
          font-weight: 500;
        }

        .note-icon {
          color: #409eff;
          margin-left: 4px;
        }
      }

      .variant, .sku {
        font-size: 12px;
        color: #909399;
      }
    }

    .empty-products {
      text-align: center;
      padding: 60px 0;
      color: #909399;

      p {
        margin: 16px 0;
      }
    }
  }

  // Below table section
  .below-table {
    padding-top: 16px;
    border-top: 1px solid #ebeef5;

    .add-service {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #409eff;
      cursor: pointer;
      margin-bottom: 20px;
      font-size: 14px;

      &:hover {
        text-decoration: underline;
      }
    }

    .form-section {
      margin-bottom: 16px;

      label {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-bottom: 8px;
        font-size: 14px;
        color: #606266;
      }
    }

    .promotion-link {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;
      color: #409eff;
    }

    .order-totals {
      .total-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        font-size: 14px;

        &.clickable {
          cursor: pointer;

          &:hover {
            background: #f5f7fa;
            margin: 0 -16px;
            padding: 8px 16px;
          }
        }

        &.highlight {
          font-weight: 600;
          font-size: 15px;
        }

        &.remaining {
          font-weight: 600;

          .amount {
            color: #f56c6c;
            font-size: 16px;
          }
        }

        .text-link {
          color: #409eff;
        }
      }

      .payment-method {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #409eff;
        cursor: pointer;
        padding: 8px 0;

        &:hover {
          text-decoration: underline;
        }
      }

      .added-payments {
        .payment-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 0;
          border-bottom: 1px solid #f0f0f0;

          .remove-icon {
            cursor: pointer;
            &:hover {
              color: #f56c6c;
            }
          }

          .payment-label {
            color: #409eff;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 4px;
            flex: 1;
          }

          .payment-amount {
            font-weight: 500;
          }
        }
      }
    }
  }

  // Shipping section
  .shipping-options {
    .el-radio-button {
      :deep(.el-radio-button__inner) {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 10px 16px;
      }
    }
  }

  .shipping-note {
    margin-top: 16px;
    color: #909399;
    font-size: 14px;
  }
}


// Customer dialog
.customer-dialog {
  .address-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .more-info,
  .change-address {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #409eff;
    cursor: pointer;
    margin-top: 16px;

    &:hover {
      text-decoration: underline;
    }
  }

  .change-address {
    margin-top: 8px;
  }
}

// Stock check empty state
.stock-check-empty {
  padding: 40px 0;
  text-align: center;
}

.stock-check-filters {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 16px;
}

// Selected payment method in dialog
.selected-payment-method {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 16px;

  .el-icon:first-child {
    cursor: pointer;
  }

  span {
    flex: 1;
    color: #409eff;
  }
}
</style>
