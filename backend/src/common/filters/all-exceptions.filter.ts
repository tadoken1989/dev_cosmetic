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

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        errorResponse = exceptionResponse
      } else {
        errorResponse.error.message = exceptionResponse as string
      }
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST
      errorResponse.error = {
        code: 'DATABASE_ERROR',
        message: this.handleDatabaseError(exception),
      }
    } else if (exception instanceof Error) {
      errorResponse.error.message = exception.message
    }

    this.logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : JSON.stringify(exception),
      'ExceptionFilter',
    )

    if (status >= 500) {
      // Send to error tracking service (e.g., Sentry)
    }

    response.status(status).json(errorResponse)
  }

  private handleDatabaseError(error: QueryFailedError): string {
    const message = error.message

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

    if (message.includes('foreign key constraint')) {
      return 'Không thể xóa do có dữ liệu liên quan'
    }

    if (message.includes('not null')) {
      return 'Thiếu thông tin bắt buộc'
    }

    return 'Lỗi cơ sở dữ liệu'
  }
}

