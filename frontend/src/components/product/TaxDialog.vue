<template>
  <el-dialog
    v-model="dialogVisible"
    title="Thêm thuế thông tin thuế"
    width="500px"
    @close="handleClose"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="150px">
      <el-form-item label="Tên thuế" prop="name" required>
        <el-input v-model="form.name" placeholder="VD: VAT" />
      </el-form-item>

      <el-form-item label="Mã Thuế" prop="code">
        <el-input v-model="form.code" placeholder="VD: THUEDAUVAO" />
      </el-form-item>

      <el-form-item label="Thuế suất %" prop="rate" required>
        <el-input-number
          v-model="form.rate"
          :min="0"
          :max="100"
          :precision="2"
          placeholder="VD: 10%"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">Thoát</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">
        Xác nhận
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
  code: '',
  rate: 0,
})

const rules: FormRules = {
  name: [{ required: true, message: 'Vui lòng nhập tên thuế', trigger: 'blur' }],
  rate: [{ required: true, message: 'Vui lòng nhập thuế suất', trigger: 'blur' }],
}

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

function handleClose() {
  form.name = ''
  form.code = ''
  form.rate = 0
  formRef.value?.resetFields()
  dialogVisible.value = false
}

async function handleSubmit() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // TODO: Call API to create tax
        await new Promise((resolve) => setTimeout(resolve, 500))
        ElMessage.success('Thêm thuế thành công')
        emit('created')
        handleClose()
      } catch (error) {
        ElMessage.error('Thêm thuế thất bại')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

