<template>
  <MobileReportsPage v-if="isMobile" />
  <div v-else class="desktop-reports">
    <h1>Báo cáo (Desktop)</h1>
    <p>Chức năng báo cáo desktop đang được phát triển.</p>
  </div>
</template>

<script setup lang="ts">
import { useDevice } from '@/composables/useDevice'
import MobileReportsPage from '@/components/mobile/MobileReportsPage.vue'

const { isMobile } = useDevice()
</script>

<style scoped lang="scss">
.desktop-reports {
  padding: 20px;
}
</style>
