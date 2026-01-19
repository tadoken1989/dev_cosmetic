<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Login Card -->
      <div class="login-card">
        <!-- Logo inside card -->
        <div class="logo-section">
          <img :src="logoUrl" alt="Logo" class="logo" @error="logoError = true" v-if="!logoError" />
          <div v-else class="logo-text">COSMETIC</div>
        </div>

        <h2 class="title">Đăng nhập vào cửa hàng của bạn</h2>

        <el-form :model="form" :rules="rules" ref="formRef" @submit.prevent="handleLogin">
          <el-form-item prop="email">
            <el-input
              v-model="form.email"
              placeholder="Email/Số điện thoại của bạn"
              size="large"
              :prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Mật khẩu đăng nhập cửa hàng"
              size="large"
              :prefix-icon="Lock"
              @keyup.enter="handleLogin"
            >
              <template #suffix>
                <el-icon class="password-toggle" @click="showPassword = !showPassword">
                  <View v-if="!showPassword" />
                  <Hide v-else />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>

          <div class="forgot-password">
            <el-link type="primary" @click="showForgotPassword = true">Quên mật khẩu</el-link>
          </div>

          <el-form-item>
            <el-button
              type="primary"
              :loading="authStore.loading"
              @click="handleLogin"
              class="login-btn"
              size="large"
            >
              Đăng nhập
            </el-button>
          </el-form-item>
        </el-form>

        <!-- Social Login -->
        <div class="social-login">
          <div class="divider">
            <span>Hoặc đăng nhập với</span>
          </div>
          <div class="social-buttons">
            <el-button circle class="social-btn facebook">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </el-button>
            <el-button circle class="social-btn google">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Lock, View, Hide } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref<FormInstance>()
const showPassword = ref(false)
const showForgotPassword = ref(false)
const logoError = ref(false)
const logoUrl = '/logo.jpg'

const form = reactive({
  email: '',
  password: '',
})

const rules: FormRules = {
  email: [
    { required: true, message: 'Vui lòng nhập email hoặc số điện thoại', trigger: 'blur' },
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
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 420px;
}

.login-card {
  background: #fff;
  border-radius: 16px;
  padding: 25px 25px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  position: relative;

  .logo-section {
    margin-bottom: 14px;
    text-align: center;

    .logo {
      height: 110px;
      width: auto;
    }

    .logo-text {
      font-size: 32px;
      font-weight: 700;
      background: linear-gradient(135deg, #4caf50, #2196f3);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  .title {
    font-size: 20px;
    font-weight: 600;
    color: #303133;
    text-align: center;
    margin: 0 0 24px;
  }

  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  :deep(.el-input__wrapper) {
    padding: 8px 15px;
    border-radius: 8px;
  }

  .password-toggle {
    cursor: pointer;
    color: #909399;

    &:hover {
      color: #606266;
    }
  }

  .forgot-password {
    text-align: right;
    margin-bottom: 24px;

    .el-link {
      font-size: 14px;
    }
  }

  .login-btn {
    width: 100%;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 24px;
    background: linear-gradient(135deg, #81c784, #4caf50);
    border: none;

    &:hover {
      background: linear-gradient(135deg, #66bb6a, #43a047);
    }
  }
}

.social-login {
  margin-top: 24px;

  .divider {
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    &::before,
    &::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e4e7ed;
    }

    span {
      padding: 0 16px;
      color: #909399;
      font-size: 14px;
    }
  }

  .social-buttons {
    display: flex;
    justify-content: center;
    gap: 16px;

    .social-btn {
      width: 48px;
      height: 48px;
      border: 1px solid #e4e7ed;

      &.facebook {
        color: #1877f2;
      }

      &.google {
        color: #ea4335;
      }

      &:hover {
        border-color: currentColor;
        background: rgba(0, 0, 0, 0.02);
      }
    }
  }
}

/* Responsive */
@media (max-width: 480px) {
  .login-page {
    padding: 16px;
    align-items: flex-start;
    padding-top: 60px;
  }

  .login-card {
    padding: 20px;

    .logo-section .logo {
      height: 80px;
    }

    .title {
      font-size: 18px;
    }

    .login-btn {
      height: 44px;
      font-size: 15px;
    }
  }
}

@media (max-width: 360px) {
  .login-card {
    padding: 16px;
  }
}
</style>
