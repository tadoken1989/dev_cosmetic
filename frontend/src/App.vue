<template>
  <div :class="['app-wrapper', deviceType + '-view']">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { useDevice } from '@/composables/useDevice'

const { deviceType } = useDevice()
</script>

<style lang="scss">
#app {
  width: 100%;
  height: 100vh;
}

.app-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

// Import mobile styles
@import './assets/styles/mobile.scss';
</style>

