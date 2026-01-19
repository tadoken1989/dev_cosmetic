<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="Thêm nhãn hiệu mới"
    width="500px"
    @close="resetForm"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
      <el-form-item label="Tên nhãn hiệu" prop="name">
        <el-input v-model="form.name" placeholder="Nhập tên nhãn hiệu" autofocus />
      </el-form-item>
      <el-form-item label="Xuất xứ" prop="country">
        <el-input v-model="form.country" placeholder="VD: Việt Nam, Hàn Quốc, Nhật Bản..." />
      </el-form-item>
      <el-form-item label="Mô tả">
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="Mô tả nhãn hiệu" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">Hủy</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">Lưu</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import apiClient from '@/services/api/client'

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue', 'created'])

const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  name: '',
  country: '',
  description: '',
})

const rules: FormRules = {
  name: [{ required: true, message: 'Vui lòng nhập tên nhãn hiệu', trigger: 'blur' }],
}

function resetForm() {
  form.name = ''
  form.country = ''
  form.description = ''
  formRef.value?.resetFields()
}

async function handleSubmit() {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await apiClient.post('/products/brands', form)
        ElMessage.success('Thêm nhãn hiệu thành công')
        emit('created')
        emit('update:modelValue', false)
        resetForm()
      } catch (error: any) {
        ElMessage.error(error.response?.data?.message || 'Thêm nhãn hiệu thất bại')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>





