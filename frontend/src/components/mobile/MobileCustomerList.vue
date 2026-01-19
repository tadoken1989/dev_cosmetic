<template>
  <div class="mobile-customer-list">
    <!-- Header -->
    <div class="mobile-header">
      <div class="header-left" @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="page-title">Khách hàng</div>
      <div class="header-right">
        <el-icon @click="showSearch = !showSearch"><Search /></el-icon>
        <el-icon @click="$router.push('/customers/create')"><Plus /></el-icon>
      </div>
    </div>

    <!-- Search -->
    <div class="search-section" v-if="showSearch">
      <el-input
        v-model="searchQuery"
        placeholder="Tìm theo tên, SĐT..."
        clearable
        @input="handleSearch"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
    </div>

    <!-- Filter Tabs -->
    <div class="filter-tabs">
      <div 
        class="tab-item" 
        :class="{ active: currentTab === 'all' }" 
        @click="currentTab = 'all'"
      >Tất cả</div>
      <div 
        class="tab-item" 
        :class="{ active: currentTab === 'vip' }" 
        @click="currentTab = 'vip'"
      >VIP</div>
      <div 
        class="tab-item" 
        :class="{ active: currentTab === 'debt' }" 
        @click="currentTab = 'debt'"
      >Có công nợ</div>
    </div>

    <!-- Count -->
    <div class="customer-count">{{ filteredCustomers.length }} khách hàng</div>

    <!-- Customer List -->
    <div class="customers-list">
      <div 
        class="customer-item"
        v-for="customer in filteredCustomers"
        :key="customer.id"
        @click="$router.push(`/customers/${customer.id}`)"
      >
        <div class="customer-avatar" :style="{ background: getAvatarColor(customer.name) }">
          {{ getInitial(customer.name) }}
        </div>
        <div class="customer-info">
          <div class="customer-name">{{ customer.name }}</div>
          <div class="customer-phone">{{ customer.phone || '-' }}</div>
        </div>
        <div class="customer-stats">
          <div class="stat-item">
            <span class="label">Công nợ:</span>
            <span class="value" :class="{ debt: customer.debt > 0 }">{{ formatCurrency(customer.debt) }}</span>
          </div>
          <div class="stat-item">
            <span class="label">Tổng chi:</span>
            <span class="value">{{ formatCurrency(customer.totalSpent) }}</span>
          </div>
        </div>
      </div>

      <div v-if="filteredCustomers.length === 0" class="empty-state">
        <el-icon :size="60"><User /></el-icon>
        <p>Không có khách hàng nào</p>
      </div>
    </div>

    <!-- FAB -->
    <div class="fab" @click="$router.push('/customers/create')">
      <el-icon><Plus /></el-icon>
    </div>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft, Search, Plus, User } from '@element-plus/icons-vue'
import { customerService } from '@/services/customer.service'
import BottomNav from './BottomNav.vue'

const searchQuery = ref('')
const customers = ref<any[]>([])
const currentTab = ref('all')
const showSearch = ref(false)

const filteredCustomers = computed(() => {
  let result = customers.value
  
  if (searchQuery.value) {
    const search = searchQuery.value.toLowerCase()
    result = result.filter(c => 
      c.name?.toLowerCase().includes(search) || 
      c.phone?.includes(search)
    )
  }
  
  if (currentTab.value === 'vip') {
    result = result.filter(c => c.isVip || c.group === 'VIP')
  } else if (currentTab.value === 'debt') {
    result = result.filter(c => c.debt > 0)
  }
  
  return result
})

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value || 0)
}

function getInitial(name: string) {
  return name?.charAt(0)?.toUpperCase() || '?'
}

function getAvatarColor(name: string) {
  const colors = ['#f56c6c', '#e6a23c', '#67c23a', '#409eff', '#909399']
  const index = name?.charCodeAt(0) % colors.length || 0
  return colors[index]
}

function handleSearch() {
  // Reactive via computed
}

async function loadCustomers() {
  try {
    const result = await customerService.getCustomers({ page: 1, pageSize: 100 })
    if (result.success) {
      customers.value = result.data?.items || []
    }
  } catch (e) {
    console.error('Load customers error:', e)
  }
}

onMounted(() => {
  loadCustomers()
})
</script>

<style scoped lang="scss">
.mobile-customer-list {
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

  .header-left .el-icon { font-size: 24px; cursor: pointer; color: #303133; }
  .page-title { flex: 1; text-align: center; font-size: 17px; font-weight: 600; }
  .header-right { 
    display: flex; 
    gap: 12px;
    .el-icon { font-size: 22px; cursor: pointer; color: #606266; }
  }
}

.search-section {
  background: #fff;
  padding: 12px 16px;

  :deep(.el-input__wrapper) {
    background: #f5f7fa;
    border-radius: 20px;
    box-shadow: none;
  }
}

.filter-tabs {
  background: #fff;
  padding: 0 16px;
  display: flex;
  border-bottom: 1px solid #e4e7ed;

  .tab-item {
    padding: 12px 16px;
    font-size: 14px;
    color: #606266;
    cursor: pointer;
    position: relative;

    &.active {
      color: #409eff;
      font-weight: 500;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 16px;
        right: 16px;
        height: 2px;
        background: #409eff;
      }
    }
  }
}

.customer-count {
  background: #e3f2fd;
  padding: 10px 16px;
  font-size: 13px;
  color: #1976D2;
}

.customers-list {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 140px;

  .customer-item {
    background: #fff;
    margin: 8px 16px;
    padding: 16px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;

    &:active { background: #f9f9f9; }

    .customer-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 18px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .customer-info {
      flex: 1;
      min-width: 0;
      
      .customer-name { font-size: 15px; font-weight: 500; margin-bottom: 4px; }
      .customer-phone { font-size: 13px; color: #909399; }
    }

    .customer-stats {
      text-align: right;
      
      .stat-item {
        font-size: 12px;
        margin-bottom: 4px;
        
        &:last-child { margin-bottom: 0; }
        
        .label { color: #909399; }
        .value { 
          margin-left: 4px; 
          font-weight: 500;
          
          &.debt { color: #f56c6c; }
        }
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #c0c4cc;
    
    p { margin-top: 16px; font-size: 14px; }
  }
}

.fab {
  position: fixed;
  bottom: calc(80px + env(safe-area-inset-bottom, 0));
  right: 16px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #409eff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
  z-index: 999;
  cursor: pointer;

  .el-icon { font-size: 28px; }
  &:active { transform: scale(0.95); }
}
</style>
