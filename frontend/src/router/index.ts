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
        path: 'products',
        name: 'Products',
        meta: { title: 'Sản phẩm' },
        children: [
          {
            path: '',
            name: 'ProductList',
            component: () => import('@/views/products/ProductListView.vue'),
            meta: { title: 'Danh sách sản phẩm' },
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
            component: () => import('@/views/products/ProductEditView.vue'),
            meta: { title: 'Sửa sản phẩm' },
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

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.name === 'Login' && authStore.isAuthenticated) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router

