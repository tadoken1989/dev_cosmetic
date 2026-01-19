<template>
  <!-- Mobile View -->
  <MobileMorePage v-if="isMobile" />
  
  <!-- Desktop View - Redirect to settings -->
  <div v-else class="more-page">
    <el-card class="menu-card">
      <template #header>
        <h2>Menu</h2>
      </template>
      <el-menu router>
        <el-menu-item index="/reports">
          <el-icon><DataLine /></el-icon>
          <span>Báo cáo</span>
        </el-menu-item>
        <el-menu-item index="/customers">
          <el-icon><User /></el-icon>
          <span>Khách hàng</span>
        </el-menu-item>
        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <span>Cài đặt</span>
        </el-menu-item>
      </el-menu>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { DataLine, User, Setting } from '@element-plus/icons-vue'
import { useDevice } from '@/composables/useDevice'
import MobileMorePage from '@/components/mobile/MobileMorePage.vue'

const router = useRouter()
const { isMobile } = useDevice()

// On desktop, redirect to settings page
onMounted(() => {
  if (!isMobile.value) {
    router.replace('/settings')
  }
})
</script>

<style scoped lang="scss">
.more-page {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.menu-card {
  h2 {
    margin: 0;
    font-size: 18px;
  }
}
</style>
