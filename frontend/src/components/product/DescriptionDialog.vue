<template>
  <el-dialog
    v-model="dialogVisible"
    title="Mô tả sản phẩm"
    width="700px"
    @close="handleClose"
  >
    <el-input
      v-model="localDescription"
      type="textarea"
      :rows="10"
      placeholder="Nhập mô tả sản phẩm"
    />

    <template #footer>
      <el-button @click="handleClose">Hủy</el-button>
      <el-button type="primary" @click="handleSave">Lưu</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  description?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:description': [value: string]
}>()

const dialogVisible = ref(false)
const localDescription = ref('')

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
  if (val) {
    localDescription.value = props.description || ''
  }
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

watch(localDescription, (val) => {
  emit('update:description', val)
})

function handleClose() {
  dialogVisible.value = false
}

function handleSave() {
  emit('update:description', localDescription.value)
  handleClose()
}
</script>

