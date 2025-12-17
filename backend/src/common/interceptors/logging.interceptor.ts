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
    if (sanitized.password) {
      sanitized.password = '[REDACTED]'
    }
    if (sanitized.token) {
      sanitized.token = '[REDACTED]'
    }
    return sanitized
  }
}

