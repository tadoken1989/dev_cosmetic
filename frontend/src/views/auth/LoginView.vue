<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2>Đăng nhập</h2>
      </template>
      <el-form :model="form" :rules="rules" ref="formRef" @submit.prevent="handleLogin">
        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" type="email" placeholder="Nhập email" />
        </el-form-item>
        <el-form-item label="Mật khẩu" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="Nhập mật khẩu"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="authStore.loading" @click="handleLogin" style="width: 100%">
            Đăng nhập
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref<FormInstance>()

const form = reactive({
  email: '',
  password: '',
})

const rules: FormRules = {
  email: [
    { required: true, message: 'Vui lòng nhập email', trigger: 'blur' },
    { type: 'email', message: 'Email không hợp lệ', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'Vui lòng nhập mật khẩu', trigger: 'blur' },
    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự', trigger: 'blur' },
  ],
}

async function handleLogin() {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await authStore.login(form)
        ElMessage.success('Đăng nhập thành công')
        router.push('/')
      } catch (error: any) {
        ElMessage.error(error.response?.data?.error?.message || 'Đăng nhập thất bại')
      }
    }
  })
}
</script>

<style scoped lang="scss">
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .login-card {
    width: 400px;

    h2 {
      margin: 0;
      text-align: center;
    }
  }
}
</style>

