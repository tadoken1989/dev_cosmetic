# 🔐 SECURITY IMPLEMENTATION GUIDE

## 📋 MỤC LỤC
1. [Authentication & Authorization](#authentication--authorization)
2. [Data Validation & Sanitization](#data-validation--sanitization)
3. [SQL Injection Prevention](#sql-injection-prevention)
4. [XSS Prevention](#xss-prevention)
5. [CSRF Protection](#csrf-protection)
6. [Rate Limiting](#rate-limiting)
7. [Data Encryption](#data-encryption)
8. [Security Headers](#security-headers)
9. [Audit Logging](#audit-logging)
10. [Best Practices](#best-practices)

---

## 🔑 AUTHENTICATION & AUTHORIZATION

### JWT Implementation
```typescript
// JWT Strategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      algorithms: ['HS256'],
    })
  }

  async validate(payload: JwtPayload) {
    // Validate token and return user
    const user = await this.authService.validateUser(payload.sub)
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User is inactive')
    }
    return user
  }
}
```

### Password Hashing
```typescript
// Use bcrypt with salt rounds
import * as bcrypt from 'bcrypt'

const SALT_ROUNDS = 12

async hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

async comparePassword(
  plainText: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(plainText, hashedPassword)
}
```

### Role-Based Access Control (RBAC)
```typescript
// Roles Guard
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    )

    if (!requiredRoles) {
      return true
    }

    const { user } = context.switchToHttp().getRequest()
    return requiredRoles.some((role) => user.role === role)
  }
}

// Usage
@Roles('admin', 'manager')
@UseGuards(JwtAuthGuard, RolesGuard)
@Post()
async create() {
  // ...
}
```

### Permission-Based Access Control
```typescript
// Permissions Guard
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    )

    if (!requiredPermissions) {
      return true
    }

    const { user } = context.switchToHttp().getRequest()
    const userPermissions = user.permissions || []

    return requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    )
  }
}

// Usage
@Permissions('product:create')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Post()
async create() {
  // ...
}
```

---

## ✅ DATA VALIDATION & SANITIZATION

### Input Validation
```typescript
// DTO with validation
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  @Matches(/^[a-zA-Z0-9\s\u00C0-\u1EF9]+$/, {
    message: 'Tên sản phẩm chỉ được chứa chữ cái, số và khoảng trắng',
  })
  name: string

  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Matches(/^[A-Z0-9-]+$/, {
    message: 'SKU chỉ được chứa chữ in hoa, số và dấu gạch ngang',
  })
  sku?: string

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(999999999999)
  retailPrice: number
}
```

### Sanitization
```typescript
// Sanitize user input
import { sanitize } from 'sanitize-html'

function sanitizeInput(input: string): string {
  return sanitize(input, {
    allowedTags: [],
    allowedAttributes: {},
  })
}

// Use in service
async createProduct(dto: CreateProductDto) {
  const sanitizedDto = {
    ...dto,
    name: sanitizeInput(dto.name),
    description: sanitizeInput(dto.description || ''),
  }
  // ...
}
```

---

## 🛡️ SQL INJECTION PREVENTION

### Use ORM (TypeORM)
```typescript
// ✅ Safe: Use ORM
const products = await repository.find({
  where: { name: userInput },
})

// ✅ Safe: Use parameterized queries
const products = await repository
  .createQueryBuilder('product')
  .where('product.name = :name', { name: userInput })
  .getMany()

// ❌ Unsafe: Raw SQL with string concatenation
const products = await repository.query(
  `SELECT * FROM products WHERE name = '${userInput}'`,
)
```

### Parameterized Queries
```typescript
// Always use parameters
const result = await repository.query(
  'SELECT * FROM products WHERE id = $1 AND name = $2',
  [productId, productName],
)
```

---

## 🚫 XSS PREVENTION

### Frontend
```vue
<!-- Vue automatically escapes content -->
<template>
  <div>{{ userInput }}</div>
  <!-- Safe: Automatically escaped -->
</template>

<!-- For HTML content, use v-html carefully -->
<template>
  <div v-html="sanitizedHtml"></div>
</template>

<script setup>
import { sanitize } from 'sanitize-html'

const sanitizedHtml = computed(() => {
  return sanitize(rawHtml.value, {
    allowedTags: ['p', 'br', 'strong', 'em'],
    allowedAttributes: {},
  })
})
</script>
```

### Backend
```typescript
// Sanitize HTML content
import { sanitize } from 'sanitize-html'

function sanitizeHtml(html: string): string {
  return sanitize(html, {
    allowedTags: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
    allowedAttributes: {},
  })
}

// Use in DTOs
@Transform(({ value }) => sanitizeHtml(value))
description?: string
```

---

## 🔒 CSRF PROTECTION

### CSRF Token
```typescript
// Generate CSRF token
import * as csrf from 'csurf'

const csrfProtection = csrf({ cookie: true })

app.use(csrfProtection)

// Send token to frontend
@Get('csrf-token')
getCsrfToken(@Req() req: Request) {
  return { csrfToken: req.csrfToken() }
}
```

### Frontend
```typescript
// Include CSRF token in requests
axios.defaults.headers.common['X-CSRF-Token'] = csrfToken
```

---

## ⏱️ RATE LIMITING

### API Rate Limiting
```typescript
import rateLimit from 'express-rate-limit'

// General rate limit
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Quá nhiều requests. Vui lòng thử lại sau.',
  standardHeaders: true,
  legacyHeaders: false,
})

// Strict rate limit for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  message: 'Quá nhiều lần đăng nhập. Vui lòng thử lại sau 15 phút.',
  skipSuccessfulRequests: true,
})

app.use('/api/', generalLimiter)
app.use('/api/auth/login', authLimiter)
```

### Redis-based Rate Limiting
```typescript
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 100,
      storage: new ThrottlerStorageRedisService(redis),
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

---

## 🔐 DATA ENCRYPTION

### Sensitive Data Encryption
```typescript
import * as crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const SECRET_KEY = process.env.ENCRYPTION_KEY

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv)
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

function decrypt(encryptedData: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  
  const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv)
  decipher.setAuthTag(authTag)
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}
```

### Database Encryption
```typescript
// Encrypt sensitive columns
@Entity('customers')
export class Customer {
  @Column({
    type: 'varchar',
    transformer: {
      to: (value: string) => encrypt(value),
      from: (value: string) => decrypt(value),
    },
  })
  phone: string
}
```

---

## 🛡️ SECURITY HEADERS

### Helmet.js
```typescript
import helmet from 'helmet'

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'https:', 'data:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),
)
```

### Custom Headers
```typescript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  next()
})
```

---

## 📝 AUDIT LOGGING

### Audit Trail
```typescript
// Track all important actions
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  action: string // 'create', 'update', 'delete'

  @Column()
  entityType: string // 'product', 'order', etc.

  @Column()
  entityId: number

  @Column('jsonb')
  oldValues: any

  @Column('jsonb')
  newValues: any

  @Column()
  userId: number

  @Column()
  ipAddress: string

  @CreateDateColumn()
  createdAt: Date
}

// Audit interceptor
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const { method, url, body, user, ip } = request

    return next.handle().pipe(
      tap((response) => {
        // Log audit trail
        this.auditService.log({
          action: method,
          entityType: this.getEntityType(url),
          entityId: body?.id || response?.id,
          oldValues: body,
          newValues: response,
          userId: user?.id,
          ipAddress: ip,
        })
      }),
    )
  }
}
```

---

## 🔍 SECURITY BEST PRACTICES

### 1. Environment Variables
```typescript
// Never commit secrets
// Use .env file (in .gitignore)
JWT_SECRET=your-secret-key-here
DB_PASSWORD=your-db-password
ENCRYPTION_KEY=your-encryption-key
```

### 2. Input Validation
- ✅ Always validate user input
- ✅ Use whitelist approach
- ✅ Sanitize HTML content
- ✅ Validate file uploads

### 3. Error Handling
```typescript
// Don't expose sensitive information in errors
catch (error) {
  // ❌ Bad
  throw new Error(`Database error: ${error.message}`)
  
  // ✅ Good
  this.logger.error('Database error', error)
  throw new InternalServerErrorException('An error occurred')
}
```

### 4. File Upload Security
```typescript
// Validate file types and sizes
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp']
const maxFileSize = 5 * 1024 * 1024 // 5MB

if (!allowedMimeTypes.includes(file.mimetype)) {
  throw new BadRequestException('Invalid file type')
}

if (file.size > maxFileSize) {
  throw new BadRequestException('File too large')
}

// Scan for malware (if possible)
// Rename files to prevent path traversal
const fileName = `${uuidv4()}-${file.originalname}`
```

### 5. Session Security
```typescript
// Secure cookie settings
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS only
      httpOnly: true, // Prevent XSS
      sameSite: 'strict', // CSRF protection
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
)
```

### 6. API Security
- ✅ Use HTTPS in production
- ✅ Implement rate limiting
- ✅ Validate all inputs
- ✅ Use parameterized queries
- ✅ Sanitize outputs
- ✅ Implement proper authentication
- ✅ Use RBAC/PBAC

### 7. Dependency Security
```bash
# Regularly check for vulnerabilities
npm audit
npm audit fix

# Use Snyk or similar tools
```

---

## ✅ SECURITY CHECKLIST

### Authentication & Authorization
- [ ] JWT with secure secret
- [ ] Password hashing (bcrypt, 12+ rounds)
- [ ] Token expiration and refresh
- [ ] Role-based access control
- [ ] Permission-based access control
- [ ] Session management

### Data Protection
- [ ] Input validation
- [ ] Output sanitization
- [ ] SQL injection prevention (ORM)
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Data encryption for sensitive fields

### API Security
- [ ] Rate limiting
- [ ] HTTPS only in production
- [ ] Security headers (Helmet)
- [ ] CORS configuration
- [ ] Request validation
- [ ] Error handling (no sensitive info)

### Infrastructure
- [ ] Environment variables for secrets
- [ ] Secure file uploads
- [ ] Database connection security
- [ ] Audit logging
- [ ] Regular security updates
- [ ] Dependency vulnerability scanning

---

## 📝 NEXT STEPS

1. Implement JWT authentication
2. Setup RBAC/PBAC
3. Add input validation
4. Configure security headers
5. Setup rate limiting
6. Implement audit logging
7. Security testing
8. Security audit

