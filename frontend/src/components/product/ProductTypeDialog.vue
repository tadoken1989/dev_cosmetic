<template>
  <el-dialog
    v-model="dialogVisible"
    title="Thêm loại sản phẩm"
    width="500px"
    @close="handleClose"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="150px">
      <el-form-item label="Tên loại sản phẩm" prop="name" required>
        <el-input v-model="form.name" placeholder="Nhập tên loại sản phẩm" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">Thoát</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">
        Thêm loại sản phẩm
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  created: []
}>()

const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  name: '',
})

const rules: FormRules = {
  name: [{ required: true, message: 'Vui lòng nhập tên loại sản phẩm', trigger: 'blur' }],
}

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

function handleClose() {
  form.name = ''
  formRef.value?.resetFields()
  dialogVisible.value = false
}

async function handleSubmit() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // TODO: Call API to create product type
        await new Promise((resolve) => setTimeout(resolve, 500))
        ElMessage.success('Thêm loại sản phẩm thành công')
        emit('created')
        handleClose()
      } catch (error) {
        ElMessage.error('Thêm loại sản phẩm thất bại')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

