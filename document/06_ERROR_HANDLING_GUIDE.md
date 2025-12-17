# ⚠️ ERROR HANDLING & EXCEPTION MANAGEMENT GUIDE

## 📋 MỤC LỤC
1. [Error Handling Strategy](#error-handling-strategy)
2. [Exception Types](#exception-types)
3. [Frontend Error Handling](#frontend-error-handling)
4. [Backend Error Handling](#backend-error-handling)
5. [Error Logging](#error-logging)
6. [User-Friendly Messages](#user-friendly-messages)
7. [Error Recovery](#error-recovery)
8. [Best Practices](#best-practices)

---

## 🎯 ERROR HANDLING STRATEGY

### Principles
1. **Fail Fast**: Detect errors early
2. **Graceful Degradation**: System continues operating when possible
3. **User-Friendly**: Show clear, actionable error messages
4. **Logging**: Log all errors for debugging
5. **Monitoring**: Track error rates and patterns

### Error Categories
- **Client Errors (4xx)**: User input issues
- **Server Errors (5xx)**: System failures
- **Network Errors**: Connection issues
- **Validation Errors**: Data validation failures
- **Business Logic Errors**: Domain-specific errors

---

## 🏷️ EXCEPTION TYPES

### Custom Exceptions

#### Backend (NestJS)
```typescript
// src/common/exceptions/business.exception.ts
export class BusinessException extends HttpException {
  constructor(
    message: string,
    statusCode: number = 400,
    public readonly code?: string,
  ) {
    super(
      {
        success: false,
        error: {
          code: code || 'BUSINESS_ERROR',
          message,
        },
        timestamp: new Date().toISOString(),
      },
      statusCode,
    )
  }
}

// src/common/exceptions/validation.exception.ts
export class ValidationException extends HttpException {
  constructor(public readonly errors: ValidationError[]) {
    super(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dữ liệu không hợp lệ',
          errors: errors.map((err) => ({
            field: err.property,
            message: Object.values(err.constraints || {}).join(', '),
          })),
        },
        timestamp: new Date().toISOString(),
      },
      422,
    )
  }
}

// src/common/exceptions/not-found.exception.ts
export class NotFoundException extends HttpException {
  constructor(resource: string, id?: number | string) {
    super(
      {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: id
            ? `Không tìm thấy ${resource} với ID ${id}`
            : `Không tìm thấy ${resource}`,
        },
        timestamp: new Date().toISOString(),
      },
      404,
    )
  }
}

// src/common/exceptions/conflict.exception.ts
export class ConflictException extends HttpException {
  constructor(message: string, field?: string) {
    super(
      {
        success: false,
        error: {
          code: 'CONFLICT',
          message,
          field,
        },
        timestamp: new Date().toISOString(),
      },
      409,
    )
  }
}

// src/common/exceptions/insufficient-stock.exception.ts
export class InsufficientStockException extends BusinessException {
  constructor(productId: number, requested: number, available: number) {
    super(
      `Không đủ tồn kho. Yêu cầu: ${requested}, Có sẵn: ${available}`,
      400,
      'INSUFFICIENT_STOCK',
    )
    this.productId = productId
    this.requested = requested
    this.available = available
  }

  productId: number
  requested: number
  available: number
}
```

---

## 🎨 FRONTEND ERROR HANDLING

### Error Handler Composable
```typescript
// src/composables/useErrorHandler.ts
import { ref } from 'vue'
import type { AxiosError } from 'axios'
import { useToast } from './useToast'
import { useRouter } from 'vue-router'

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    errors?: Array<{
      field: string
      message: string
    }>
  }
  timestamp: string
  path: string
}

export function useErrorHandler() {
  const toast = useToast()
  const router = useRouter()
  const error = ref<string | null>(null)
  const fieldErrors = ref<Record<string, string>>({})

  function handleError(err: unknown) {
    // Clear previous errors
    error.value = null
    fieldErrors.value = {}

    if (err && typeof err === 'object' && 'response' in err) {
      const axiosError = err as AxiosError<ApiError>
      const errorData = axiosError.response?.data

      if (errorData && !errorData.success) {
        const apiError = errorData.error

        // Handle specific error codes
        switch (apiError.code) {
          case 'VALIDATION_ERROR':
            // Set field errors
            if (apiError.errors) {
              apiError.errors.forEach((err) => {
                fieldErrors.value[err.field] = err.message
              })
            }
            toast.error('Vui lòng kiểm tra lại thông tin đã nhập')
            break

          case 'UNAUTHORIZED':
            toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại')
            router.push('/login')
            break

          case 'FORBIDDEN':
            toast.error('Bạn không có quyền thực hiện thao tác này')
            break

          case 'NOT_FOUND':
            toast.error(apiError.message || 'Không tìm thấy dữ liệu')
            break

          case 'CONFLICT':
            toast.error(apiError.message || 'Dữ liệu đã tồn tại')
            break

          case 'INSUFFICIENT_STOCK':
            toast.error(apiError.message || 'Không đủ tồn kho')
            break

          case 'NETWORK_ERROR':
            toast.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng')
            break

          default:
            toast.error(apiError.message || 'Có lỗi xảy ra. Vui lòng thử lại sau')
        }

        error.value = apiError.message
      } else {
        // Handle HTTP status codes
        const status = axiosError.response?.status
        switch (status) {
          case 401:
            toast.error('Phiên đăng nhập đã hết hạn')
            router.push('/login')
            break
          case 403:
            toast.error('Bạn không có quyền thực hiện thao tác này')
            break
          case 404:
            toast.error('Không tìm thấy dữ liệu')
            break
          case 500:
            toast.error('Lỗi server. Vui lòng thử lại sau')
            break
          default:
            toast.error('Có lỗi xảy ra. Vui lòng thử lại sau')
        }
      }
    } else if (err instanceof Error) {
      error.value = err.message
      toast.error(err.message)
    } else {
      const defaultMessage = 'Có lỗi xảy ra. Vui lòng thử lại sau'
      error.value = defaultMessage
      toast.error(defaultMessage)
    }
  }

  function clearError() {
    error.value = null
    fieldErrors.value = {}
  }

  function getFieldError(field: string): string | undefined {
    return fieldErrors.value[field]
  }

  return {
    error,
    fieldErrors,
    handleError,
    clearError,
    getFieldError,
  }
}
```

### API Client Error Interceptor
```typescript
// services/api/interceptors.ts
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth.store'
import { useToast } from '@/composables/useToast'
import { useRouter } from 'vue-router'

export function setupResponseInterceptor(axiosInstance: any) {
  const router = useRouter()
  const toast = useToast()

  axiosInstance.interceptors.response.use(
    (response: any) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean
      }

      // Handle 401 - Unauthorized
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        const authStore = useAuthStore()
        
        try {
          // Try to refresh token
          await authStore.refreshToken()
          // Retry original request
          return axiosInstance(originalRequest)
        } catch (refreshError) {
          // Refresh failed, logout
          await authStore.logout()
          router.push('/login')
          return Promise.reject(refreshError)
        }
      }

      // Handle network errors
      if (!error.response) {
        const networkError = {
          ...error,
          response: {
            data: {
              success: false,
              error: {
                code: 'NETWORK_ERROR',
                message: 'Không thể kết nối đến server',
              },
            },
          },
        }
        return Promise.reject(networkError)
      }

      return Promise.reject(error)
    },
  )
}
```

### Error Boundary Component
```vue
<!-- components/common/AppErrorBoundary.vue -->
<template>
  <div v-if="hasError" class="error-boundary">
    <el-alert
      :title="errorTitle"
      :description="errorMessage"
      type="error"
      :closable="false"
      show-icon
    >
      <template #default>
        <div class="error-actions">
          <el-button @click="handleRetry">Thử lại</el-button>
          <el-button @click="handleGoHome">Về trang chủ</el-button>
          <el-button v-if="showDetails" @click="showErrorDetails = !showErrorDetails">
            {{ showErrorDetails ? 'Ẩn' : 'Hiện' }} chi tiết
          </el-button>
        </div>
        <div v-if="showErrorDetails" class="error-details">
          <pre>{{ errorStack }}</pre>
        </div>
      </template>
    </el-alert>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const hasError = ref(false)
const showErrorDetails = ref(false)
const errorTitle = ref('Đã xảy ra lỗi')
const errorMessage = ref('Vui lòng thử lại sau hoặc liên hệ hỗ trợ')
const errorStack = ref('')

onErrorCaptured((err: Error, instance, info) => {
  hasError.value = true
  errorMessage.value = err.message || 'Đã xảy ra lỗi không xác định'
  errorStack.value = err.stack || ''
  console.error('Error caught by boundary:', err, info)
  return false
})

function handleRetry() {
  hasError.value = false
  showErrorDetails.value = false
  window.location.reload()
}

function handleGoHome() {
  router.push('/')
  hasError.value = false
  showErrorDetails.value = false
}
</script>
```

---

## ⚙️ BACKEND ERROR HANDLING

### Global Exception Filter
```typescript
// src/common/filters/all-exceptions.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { QueryFailedError } from 'typeorm'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let errorResponse: any = {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Lỗi server. Vui lòng thử lại sau',
      },
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    }

    // Handle HttpException (custom exceptions)
    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        errorResponse = exceptionResponse
      } else {
        errorResponse.error.message = exceptionResponse as string
      }
    }
    // Handle database errors
    else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST
      errorResponse.error = {
        code: 'DATABASE_ERROR',
        message: this.handleDatabaseError(exception),
      }
    }
    // Handle validation errors
    else if (exception instanceof Error) {
      errorResponse.error.message = exception.message
    }

    // Log error
    this.logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : JSON.stringify(exception),
      'ExceptionFilter',
    )

    // Send to error tracking (Sentry, etc.)
    if (status >= 500) {
      // Send to Sentry
      // Sentry.captureException(exception)
    }

    response.status(status).json(errorResponse)
  }

  private handleDatabaseError(error: QueryFailedError): string {
    const message = error.message

    // Handle unique constraint violation
    if (message.includes('duplicate key')) {
      if (message.includes('sku')) {
        return 'Mã SKU đã tồn tại'
      }
      if (message.includes('barcode')) {
        return 'Mã vạch đã tồn tại'
      }
      if (message.includes('email')) {
        return 'Email đã tồn tại'
      }
      return 'Dữ liệu đã tồn tại'
    }

    // Handle foreign key constraint
    if (message.includes('foreign key constraint')) {
      return 'Không thể xóa do có dữ liệu liên quan'
    }

    // Handle not null constraint
    if (message.includes('not null')) {
      return 'Thiếu thông tin bắt buộc'
    }

    return 'Lỗi cơ sở dữ liệu'
  }
}
```

### Validation Pipe
```typescript
// src/common/pipes/validation.pipe.ts
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common'
import { validate } from 'class-validator'
import { plainToInstance } from 'class-transformer'
import { ValidationException } from '../exceptions/validation.exception'

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value
    }

    const object = plainToInstance(metatype, value)
    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
    })

    if (errors.length > 0) {
      throw new ValidationException(errors)
    }

    return object
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object]
    return !types.includes(metatype)
  }
}
```

---

## 📝 ERROR LOGGING

### Structured Logging
```typescript
// src/common/interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap, catchError } from 'rxjs/operators'
import { throwError } from 'rxjs'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name)

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const { method, url, body, query, params } = request
    const user = request.user
    const now = Date.now()

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse()
        const { statusCode } = response
        const responseTime = Date.now() - now

        this.logger.log({
          method,
          url,
          statusCode,
          responseTime: `${responseTime}ms`,
          userId: user?.id,
          body: this.sanitizeBody(body),
          query,
          params,
        })
      }),
      catchError((error) => {
        const responseTime = Date.now() - now

        this.logger.error({
          method,
          url,
          statusCode: error.status || 500,
          responseTime: `${responseTime}ms`,
          userId: user?.id,
          error: {
            message: error.message,
            stack: error.stack,
          },
          body: this.sanitizeBody(body),
          query,
          params,
        })

        return throwError(() => error)
      }),
    )
  }

  private sanitizeBody(body: any): any {
    if (!body) return body

    const sanitized = { ...body }
    // Remove sensitive fields
    if (sanitized.password) {
      sanitized.password = '[REDACTED]'
    }
    if (sanitized.token) {
      sanitized.token = '[REDACTED]'
    }
    return sanitized
  }
}
```

---

## 💬 USER-FRIENDLY MESSAGES

### Error Message Mapping
```typescript
// src/common/utils/error-messages.ts
export const ERROR_MESSAGES: Record<string, string> = {
  // Validation
  VALIDATION_ERROR: 'Vui lòng kiểm tra lại thông tin đã nhập',
  REQUIRED_FIELD: 'Trường này là bắt buộc',
  INVALID_EMAIL: 'Email không hợp lệ',
  INVALID_PHONE: 'Số điện thoại không hợp lệ',
  
  // Authentication
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này',
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng',
  
  // Resources
  NOT_FOUND: 'Không tìm thấy dữ liệu',
  CONFLICT: 'Dữ liệu đã tồn tại',
  DUPLICATE_SKU: 'Mã SKU đã tồn tại',
  DUPLICATE_BARCODE: 'Mã vạch đã tồn tại',
  
  // Business Logic
  INSUFFICIENT_STOCK: 'Không đủ tồn kho',
  INVALID_STATUS: 'Trạng thái không hợp lệ',
  ORDER_CANNOT_BE_CANCELLED: 'Đơn hàng không thể hủy',
  
  // System
  INTERNAL_SERVER_ERROR: 'Lỗi server. Vui lòng thử lại sau',
  NETWORK_ERROR: 'Không thể kết nối đến server',
  TIMEOUT: 'Request quá thời gian. Vui lòng thử lại',
}

export function getErrorMessage(code: string, defaultMessage?: string): string {
  return ERROR_MESSAGES[code] || defaultMessage || 'Có lỗi xảy ra'
}
```

---

## 🔄 ERROR RECOVERY

### Retry Strategy
```typescript
// src/composables/useRetry.ts
import { ref } from 'vue'

export function useRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000,
) {
  const retryCount = ref(0)
  const isRetrying = ref(false)

  async function execute(): Promise<T> {
    try {
      retryCount.value = 0
      isRetrying.value = false
      return await fn()
    } catch (error) {
      if (retryCount.value < maxRetries) {
        retryCount.value++
        isRetrying.value = true
        await new Promise((resolve) => setTimeout(resolve, delay * retryCount.value))
        return execute()
      }
      throw error
    }
  }

  return {
    execute,
    retryCount,
    isRetrying,
  }
}
```

---

## ✅ BEST PRACTICES

1. **Always Handle Errors**: Never let errors go unhandled
2. **User-Friendly Messages**: Show clear, actionable messages
3. **Log Everything**: Log errors with context
4. **Monitor Errors**: Track error rates and patterns
5. **Graceful Degradation**: System should continue when possible
6. **Validation**: Validate inputs early
7. **Type Safety**: Use TypeScript for error handling
8. **Error Boundaries**: Catch errors at component level
9. **Retry Logic**: Implement retry for transient errors
10. **Error Tracking**: Use services like Sentry

---

## 📝 NEXT STEPS

1. Implement custom exceptions
2. Setup global exception filter
3. Create error handler composable
4. Add error boundary component
5. Setup error logging
6. Configure error tracking (Sentry)
7. Write error handling tests
8. Monitor error rates

