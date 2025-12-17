<template>
  <el-dialog
    v-model="dialogVisible"
    title="Thêm chính sách giá"
    width="600px"
    @close="handleClose"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="150px">
      <el-form-item label="Tên chính sách" prop="name" required>
        <el-input v-model="form.name" placeholder="Nhập tên chính sách giá" />
      </el-form-item>

      <el-form-item label="Loại khách hàng">
        <el-select v-model="form.customerType" placeholder="Chọn loại khách hàng" style="width: 100%">
          <el-option label="Bán lẻ" value="retail" />
          <el-option label="Bán buôn" value="wholesale" />
          <el-option label="VIP" value="vip" />
        </el-select>
      </el-form-item>

      <el-form-item label="Số lượng tối thiểu">
        <el-input-number v-model="form.minQuantity" :min="1" style="width: 100%" />
      </el-form-item>

      <el-form-item label="Loại giảm giá">
        <el-radio-group v-model="form.discountType">
          <el-radio label="percentage">Phần trăm (%)</el-radio>
          <el-radio label="fixed">Số tiền cố định</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="Giá trị giảm" prop="discountValue" required>
        <el-input-number
          v-model="form.discountValue"
          :min="0"
          :precision="2"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="Ngày bắt đầu" prop="startDate" required>
        <el-date-picker
          v-model="form.startDate"
          type="date"
          placeholder="Chọn ngày bắt đầu"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="Ngày kết thúc">
        <el-date-picker
          v-model="form.endDate"
          type="date"
          placeholder="Chọn ngày kết thúc"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">Hủy</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">
        Thêm chính sách
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
  customerType: '',
  minQuantity: 1,
  discountType: 'percentage',
  discountValue: 0,
  startDate: null as Date | null,
  endDate: null as Date | null,
})

const rules: FormRules = {
  name: [{ required: true, message: 'Vui lòng nhập tên chính sách', trigger: 'blur' }],
  discountValue: [{ required: true, message: 'Vui lòng nhập giá trị giảm', trigger: 'blur' }],
  startDate: [{ required: true, message: 'Vui lòng chọn ngày bắt đầu', trigger: 'change' }],
}

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

function handleClose() {
  Object.assign(form, {
    name: '',
    customerType: '',
    minQuantity: 1,
    discountType: 'percentage',
    discountValue: 0,
    startDate: null,
    endDate: null,
  })
  formRef.value?.resetFields()
  dialogVisible.value = false
}

async function handleSubmit() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // TODO: Call API to create price policy
        await new Promise((resolve) => setTimeout(resolve, 500))
        ElMessage.success('Thêm chính sách giá thành công')
        emit('created')
        handleClose()
      } catch (error) {
        ElMessage.error('Thêm chính sách giá thất bại')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

