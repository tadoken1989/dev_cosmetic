import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('@/components/layout/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: { title: 'Tổng quan' },
      },
      {
        path: 'dashboard',
        redirect: '/',
      },
      {
        path: 'products',
        name: 'Products',
        meta: { title: 'Sản phẩm' },
        children: [
          {
            path: '',
            name: 'ProductMenu',
            component: () => import('@/views/products/ProductListView.vue'),
            meta: { title: 'Sản phẩm' },
          },
          {
            path: 'list',
            name: 'ProductList',
            component: () => import('@/views/products/ProductListView.vue'),
            meta: { title: 'Danh sách sản phẩm' },
          },
          {
            path: 'inventory',
            name: 'ProductInventory',
            component: () => import('@/views/products/InventoryView.vue'),
            meta: { title: 'Quản lý kho' },
          },
          {
            path: 'create',
            name: 'ProductCreate',
            component: () => import('@/views/products/ProductCreateView.vue'),
            meta: { title: 'Tạo sản phẩm' },
          },
          {
            path: ':id',
            name: 'ProductDetail',
            component: () => import('@/views/products/ProductDetailView.vue'),
            meta: { title: 'Chi tiết sản phẩm' },
          },
          {
            path: ':id/edit',
            name: 'ProductEdit',
            component: () => import('@/views/products/ProductCreateView.vue'),
            meta: { title: 'Sửa sản phẩm' },
          },
        ],
      },
      {
        path: 'orders',
        name: 'Orders',
        meta: { title: 'Đơn hàng' },
        children: [
          {
            path: '',
            name: 'OrderMenu',
            component: () => import('@/views/orders/OrderListView.vue'),
            meta: { title: 'Đơn hàng' },
          },
          {
            path: 'list',
            name: 'OrderList',
            component: () => import('@/views/orders/OrderListView.vue'),
            meta: { title: 'Danh sách đơn hàng' },
          },
          {
            path: 'create',
            name: 'OrderCreate',
            component: () => import('@/views/orders/OrderCreateView.vue'),
            meta: { title: 'Tạo đơn hàng' },
          },
          {
            path: 'returns',
            name: 'OrderReturns',
            component: () => import('@/views/orders/OrderReturnsView.vue'),
            meta: { title: 'Khách trả hàng' },
          },
          {
            path: 'shipping',
            name: 'OrderShipping',
            component: () => import('@/views/orders/OrderListView.vue'),
            meta: { title: 'Quản lý giao hàng' },
          },
          {
            path: 'drafts',
            name: 'OrderDrafts',
            component: () => import('@/views/orders/OrderListView.vue'),
            meta: { title: 'Đơn lưu tạm' },
          },
          {
            path: ':id',
            name: 'OrderDetail',
            component: () => import('@/views/orders/OrderDetailView.vue'),
            meta: { title: 'Chi tiết đơn hàng' },
          },
          {
            path: ':id/edit',
            name: 'OrderEdit',
            component: () => import('@/views/orders/OrderCreateView.vue'),
            meta: { title: 'Sửa đơn hàng' },
          },
        ],
      },
      {
        path: 'customers',
        name: 'Customers',
        meta: { title: 'Khách hàng' },
        children: [
          {
            path: '',
            name: 'CustomerList',
            component: () => import('@/views/customers/CustomerListView.vue'),
            meta: { title: 'Danh sách khách hàng' },
          },
          {
            path: 'create',
            name: 'CustomerCreate',
            component: () => import('@/views/customers/CustomerCreateView.vue'),
            meta: { title: 'Thêm khách hàng' },
          },
          {
            path: 'groups',
            name: 'CustomerGroupList',
            component: () => import('@/views/customers/CustomerGroupListView.vue'),
            meta: { title: 'Nhóm khách hàng' },
          },
          {
            path: 'groups/create',
            name: 'CustomerGroupCreate',
            component: () => import('@/views/customers/CustomerGroupsView.vue'),
            meta: { title: 'Tạo nhóm khách hàng' },
          },
          {
            path: 'groups/:id',
            name: 'CustomerGroupEdit',
            component: () => import('@/views/customers/CustomerGroupsView.vue'),
            meta: { title: 'Sửa nhóm khách hàng' },
          },
          {
            path: ':id',
            name: 'CustomerDetail',
            component: () => import('@/views/customers/CustomerDetailView.vue'),
            meta: { title: 'Chi tiết khách hàng' },
          },
          {
            path: ':id/edit',
            name: 'CustomerEdit',
            component: () => import('@/views/customers/CustomerCreateView.vue'),
            meta: { title: 'Sửa khách hàng' },
          },
        ],
      },
      {
        path: 'more',
        name: 'More',
        component: () => import('@/views/more/MoreView.vue'),
        meta: { title: 'Thêm' },
      },
      {
        path: 'reports',
        name: 'Reports',
        meta: { title: 'Báo cáo' },
        children: [
          {
            path: '',
            name: 'ReportsMenu',
            component: () => import('@/views/reports/ReportsView.vue'),
            meta: { title: 'Báo cáo' },
          },
          {
            path: ':type',
            name: 'ReportDetail',
            component: () => import('@/views/reports/ReportDetailView.vue'),
            meta: { title: 'Chi tiết báo cáo' },
          },
        ],
      },
      {
        path: 'settings',
        name: 'Settings',
        meta: { title: 'Cài đặt' },
        children: [
          {
            path: '',
            redirect: '/settings/products',
          },
          {
            path: 'products',
            name: 'ProductSettings',
            component: () => import('@/views/settings/ProductSettingsView.vue'),
            meta: { title: 'Cấu hình sản phẩm & kho' },
          },
          {
            path: 'branches',
            name: 'BranchSettings',
            component: () => import('@/views/settings/BranchSettingsView.vue'),
            meta: { title: 'Chi nhánh' },
          },
          {
            path: 'users',
            name: 'UserSettings',
            component: () => import('@/views/settings/UserSettingsView.vue'),
            meta: { title: 'Nhân viên' },
          },
        ],
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Wait for auth store to initialize if not yet initialized
  if (!authStore.isInitialized) {
    await authStore.init()
  }

  // Public route - allow access
  if (to.name === 'Login') {
    if (authStore.isAuthenticated) {
      // Already logged in, redirect to dashboard
      next({ name: 'Dashboard' })
    } else {
      next()
    }
    return
  }

  // Protected routes - require authentication
  if (!authStore.isAuthenticated) {
    // Not authenticated, redirect to login
    next({ name: 'Login' })
    return
  }

  // Check session validity before allowing access
  if (!authStore.isSessionValid()) {
    // Session expired, logout and redirect
    await authStore.logout()
    next({ name: 'Login' })
    return
  }

  // All checks passed, allow navigation
  next()
})

export default router

