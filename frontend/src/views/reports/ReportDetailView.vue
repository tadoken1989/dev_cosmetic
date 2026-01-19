<template>
  <MobileReportDetail v-if="isMobile" />
  <div v-else class="desktop-report-detail">
    <h1>Chi tiết báo cáo (Desktop)</h1>
    <p>Chức năng chi tiết báo cáo desktop đang được phát triển.</p>
  </div>
</template>

<script setup lang="ts">
import { useDevice } from '@/composables/useDevice'
import MobileReportDetail from '@/components/mobile/MobileReportDetail.vue'

const { isMobile } = useDevice()
</script>

<style scoped lang="scss">
.desktop-report-detail {
  padding: 20px;
}
</style>
