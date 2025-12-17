# ⚙️ BACKEND SPECIFICATIONS - NESTJS

## 📋 MỤC LỤC
1. [Project Structure](#project-structure)
2. [Technology Stack](#technology-stack)
3. [Module Architecture](#module-architecture)
4. [Database Integration](#database-integration)
5. [API Design](#api-design)
6. [Authentication & Authorization](#authentication--authorization)
7. [Validation & DTOs](#validation--dtos)
8. [Error Handling](#error-handling)
9. [Caching Strategy](#caching-strategy)
10. [File Upload](#file-upload)
11. [Background Jobs](#background-jobs)
12. [Logging & Monitoring](#logging--monitoring)

---

## 📁 PROJECT STRUCTURE

```
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── roles.decorator.ts
│   │   │   ├── public.decorator.ts
│   │   │   └── current-user.decorator.ts
│   │   ├── filters/
│   │   │   ├── http-exception.filter.ts
│   │   │   └── all-exceptions.filter.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── permissions.guard.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   ├── transform.interceptor.ts
│   │   │   └── timeout.interceptor.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   ├── middleware/
│   │   │   ├── logger.middleware.ts
│   │   │   └── rate-limit.middleware.ts
│   │   └── utils/
│   │       ├── pagination.util.ts
│   │       └── response.util.ts
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   ├── aws.config.ts
│   │   └── app.config.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── local.strategy.ts
│   │   │   ├── dto/
│   │   │   │   ├── login.dto.ts
│   │   │   │   └── register.dto.ts
│   │   │   └── entities/
│   │   │       └── user.entity.ts
│   │   ├── products/
│   │   │   ├── products.module.ts
│   │   │   ├── products.controller.ts
│   │   │   ├── products.service.ts
│   │   │   ├── products.repository.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-product.dto.ts
│   │   │   │   ├── update-product.dto.ts
│   │   │   │   └── product-filter.dto.ts
│   │   │   └── entities/
│   │   │       └── product.entity.ts
│   │   ├── inventory/
│   │   │   ├── inventory.module.ts
│   │   │   ├── inventory.controller.ts
│   │   │   ├── inventory.service.ts
│   │   │   └── entities/
│   │   │       └── inventory.entity.ts
│   │   ├── orders/
│   │   │   ├── orders.module.ts
│   │   │   ├── orders.controller.ts
│   │   │   └── orders.service.ts
│   │   ├── customers/
│   │   │   ├── customers.module.ts
│   │   │   ├── customers.controller.ts
│   │   │   └── customers.service.ts
│   │   └── reports/
│   │       ├── reports.module.ts
│   │       ├── reports.controller.ts
│   │       └── reports.service.ts
│   ├── database/
│   │   ├── migrations/
│   │   └── seeds/
│   └── types/
│       └── index.ts
├── test/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env
├── .env.example
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🛠️ TECHNOLOGY STACK

### Core Dependencies
```json
{
  "dependencies": {
    "@nestjs/common": "^10.2.10",
    "@nestjs/core": "^10.2.10",
    "@nestjs/platform-express": "^10.2.10",
    "@nestjs/typeorm": "^10.0.1",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.2",
    "@nestjs/config": "^3.1.1",
    "@nestjs/swagger": "^7.1.16",
    "@nestjs/bull": "^10.0.1",
    "@nestjs/schedule": "^4.0.0",
    "typeorm": "^0.3.17",
    "pg": "^8.11.3",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0",
    "bcrypt": "^5.1.1",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    "redis": "^4.6.12",
    "bull": "^4.12.0",
    "aws-sdk": "^2.1514.0",
    "multer": "^1.4.5-lts.1",
    "winston": "^3.11.0",
    "nest-winston": "^1.9.4",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "express-rate-limit": "^7.1.5"
  },
  "devDependencies": {
    "@nestjs/testing": "^10.2.10",
    "@types/node": "^20.10.6",
    "@types/passport-jwt": "^4.0.0",
    "@types/passport-local": "^1.0.38",
    "@types/bcrypt": "^5.0.2",
    "@types/multer": "^1.4.11",
    "typescript": "^5.3.3",
    "ts-node": "^10.9.2",
    "ts-jest": "^29.1.1",
    "jest": "^29.7.0",
    "supertest": "^6.3.3"
  }
}
```

---

## 🏗️ MODULE ARCHITECTURE

### App Module Structure
```typescript
// src/app.module.ts
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BullModule } from '@nestjs/bull'
import { ThrottlerModule } from '@nestjs/throttler'
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'
import { JwtAuthGuard } from './common/guards/jwt-auth.guard'
import { AuthModule } from './modules/auth/auth.module'
import { ProductsModule } from './modules/products/products.module'
import { InventoryModule } from './modules/inventory/inventory.module'
import { OrdersModule } from './modules/orders/orders.module'
import { CustomersModule } from './modules/customers/customers.module'
import { ReportsModule } from './modules/reports/reports.module'
import { databaseConfig } from './config/database.config'
import { redisConfig } from './config/redis.config'

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    
    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: databaseConfig,
    }),
    
    // Redis & Bull Queue
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: redisConfig,
    }),
    
    // Rate Limiting
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute
    }]),
    
    // Feature Modules
    AuthModule,
    ProductsModule,
    InventoryModule,
    OrdersModule,
    CustomersModule,
    ReportsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
```

### Products Module Example
```typescript
// src/modules/products/products.module.ts
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BullModule } from '@nestjs/bull'
import { ProductsController } from './products.controller'
import { ProductsService } from './products.service'
import { ProductsRepository } from './products.repository'
import { Product } from './entities/product.entity'
import { ProductType } from './entities/product-type.entity'
import { Brand } from './entities/brand.entity'
import { ProductImage } from './entities/product-image.entity'
import { InventoryModule } from '../inventory/inventory.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductType, Brand, ProductImage]),
    BullModule.registerQueue({
      name: 'product-processing',
    }),
    InventoryModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository],
  exports: [ProductsService],
})
export class ProductsModule {}
```

---

## 🗄️ DATABASE INTEGRATION

### Database Configuration
```typescript
// src/config/database.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'

export const databaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5432),
  username: configService.get<string>('DB_USERNAME', 'postgres'),
  password: configService.get<string>('DB_PASSWORD', 'postgres'),
  database: configService.get<string>('DB_NAME', 'cosmetic_db'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  synchronize: configService.get<string>('NODE_ENV') !== 'production',
  logging: configService.get<string>('NODE_ENV') === 'development',
  extra: {
    max: 50, // Maximum pool size
    min: 5,  // Minimum pool size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
})
```

### Entity Example - Product
```typescript
// src/modules/products/entities/product.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm'
import { ProductType } from './product-type.entity'
import { Brand } from './brand.entity'
import { ProductImage } from './product-image.entity'
import { Inventory } from '../../inventory/entities/inventory.entity'

export enum ManagementType {
  NORMAL = 'normal',
  BATCH = 'batch',
}

@Entity('products')
@Index(['sku'], { unique: true, where: '"sku" IS NOT NULL' })
@Index(['barcode'], { unique: true, where: '"barcode" IS NOT NULL' })
@Index(['name'])
@Index(['productTypeId'])
@Index(['brandId'])
@Index(['createdAt'])
export class Product {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 255 })
  name: string

  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  sku: string

  @Column({ type: 'varchar', length: 50, nullable: true, unique: true })
  barcode: string

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weight: number

  @Column({ type: 'varchar', length: 10, nullable: true, default: 'g' })
  weightUnit: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  unit: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({
    type: 'enum',
    enum: ManagementType,
    default: ManagementType.NORMAL,
  })
  managementType: ManagementType

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  retailPrice: number

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, default: 0 })
  wholesalePrice: number

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, default: 0 })
  importPrice: number

  @Column({ type: 'boolean', default: true })
  allowSale: boolean

  @Column({ type: 'boolean', default: false })
  applyTax: boolean

  @Column({ type: 'boolean', nullable: true })
  taxIncluded: boolean

  @Column({ type: 'int', nullable: true })
  inputTaxId: number

  @Column({ type: 'int', nullable: true })
  outputTaxId: number

  @Column({ type: 'boolean', default: false })
  expiryWarningEnabled: boolean

  @Column({ type: 'int', nullable: true })
  productTypeId: number

  @ManyToOne(() => ProductType, { nullable: true })
  @JoinColumn({ name: 'productTypeId' })
  productType: ProductType

  @Column({ type: 'int', nullable: true })
  brandId: number

  @ManyToOne(() => Brand, { nullable: true })
  @JoinColumn({ name: 'brandId' })
  brand: Brand

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true })
  images: ProductImage[]

  @OneToMany(() => Inventory, (inventory) => inventory.product)
  inventories: Inventory[]

  @Column({ type: 'text', array: true, default: [] })
  tags: string[]

  @Column({ type: 'int', default: 0 })
  viewCount: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @Column({ type: 'int', nullable: true })
  createdById: number

  @Column({ type: 'int', nullable: true })
  updatedById: number
}
```

### Repository Pattern
```typescript
// src/modules/products/products.repository.ts
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, FindOptionsWhere, ILike, Between } from 'typeorm'
import { Product } from './entities/product.entity'
import { ProductFilterDto } from './dto/product-filter.dto'

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>,
  ) {}

  async findAll(filters: ProductFilterDto) {
    const {
      page = 1,
      pageSize = 20,
      search,
      productTypeId,
      brandId,
      managementType,
      allowSale,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filters

    const queryBuilder = this.repository.createQueryBuilder('product')
      .leftJoinAndSelect('product.productType', 'productType')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.images', 'images')

    // Search
    if (search) {
      queryBuilder.where(
        '(product.name ILIKE :search OR product.sku ILIKE :search OR product.barcode ILIKE :search)',
        { search: `%${search}%` }
      )
    }

    // Filters
    if (productTypeId) {
      queryBuilder.andWhere('product.productTypeId = :productTypeId', { productTypeId })
    }

    if (brandId) {
      queryBuilder.andWhere('product.brandId = :brandId', { brandId })
    }

    if (managementType) {
      queryBuilder.andWhere('product.managementType = :managementType', { managementType })
    }

    if (allowSale !== undefined) {
      queryBuilder.andWhere('product.allowSale = :allowSale', { allowSale })
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.retailPrice >= :minPrice', { minPrice })
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.retailPrice <= :maxPrice', { maxPrice })
    }

    // Sorting
    queryBuilder.orderBy(`product.${sortBy}`, sortOrder)

    // Pagination
    const skip = (page - 1) * pageSize
    queryBuilder.skip(skip).take(pageSize)

    const [data, total] = await queryBuilder.getManyAndCount()

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }

  async findById(id: number) {
    return this.repository.findOne({
      where: { id },
      relations: ['productType', 'brand', 'images', 'inventories'],
    })
  }

  async create(productData: Partial<Product>) {
    const product = this.repository.create(productData)
    return this.repository.save(product)
  }

  async update(id: number, productData: Partial<Product>) {
    await this.repository.update(id, productData)
    return this.findById(id)
  }

  async delete(id: number) {
    return this.repository.softDelete(id)
  }

  async existsBySku(sku: string, excludeId?: number) {
    const where: FindOptionsWhere<Product> = { sku }
    if (excludeId) {
      where.id = { $ne: excludeId } as any
    }
    const count = await this.repository.count({ where })
    return count > 0
  }

  async existsByBarcode(barcode: string, excludeId?: number) {
    const where: FindOptionsWhere<Product> = { barcode }
    if (excludeId) {
      where.id = { $ne: excludeId } as any
    }
    const count = await this.repository.count({ where })
    return count > 0
  }
}
```

---

## 🎯 API DESIGN

### Controller Example
```typescript
// src/modules/products/products.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  ParseIntPipe,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger'
import { ProductsService } from './products.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { ProductFilterDto } from './dto/product-filter.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { Public } from '../../common/decorators/public.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor'

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Tạo sản phẩm mới' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiResponse({ status: 201, description: 'Tạo sản phẩm thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() images: Express.Multer.File[],
    @CurrentUser() user: any,
  ) {
    return this.productsService.create(createProductDto, images, user.id)
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm' })
  @ApiResponse({ status: 200, description: 'Danh sách sản phẩm' })
  async findAll(@Query() filters: ProductFilterDto) {
    return this.productsService.findAll(filters)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin sản phẩm theo ID' })
  @ApiResponse({ status: 200, description: 'Thông tin sản phẩm' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id)
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Cập nhật sản phẩm' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() images: Express.Multer.File[],
    @CurrentUser() user: any,
  ) {
    return this.productsService.update(id, updateProductDto, images, user.id)
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Xóa sản phẩm' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id)
  }

  @Get('search/:query')
  @Public()
  @ApiOperation({ summary: 'Tìm kiếm sản phẩm' })
  async search(@Param('query') query: string) {
    return this.productsService.search(query)
  }
}
```

### Service Example
```typescript
// src/modules/products/products.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
import { ProductsRepository } from './products.repository'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { ProductFilterDto } from './dto/product-filter.dto'
import { Product } from './entities/product.entity'
import { S3Service } from '../../common/services/s3.service'

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly s3Service: S3Service,
    @InjectQueue('product-processing') private productQueue: Queue,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    images: Express.Multer.File[],
    userId: number,
  ): Promise<Product> {
    // Validate SKU uniqueness
    if (createProductDto.sku) {
      const skuExists = await this.productsRepository.existsBySku(createProductDto.sku)
      if (skuExists) {
        throw new ConflictException('Mã SKU đã tồn tại')
      }
    }

    // Validate Barcode uniqueness
    if (createProductDto.barcode) {
      const barcodeExists = await this.productsRepository.existsByBarcode(createProductDto.barcode)
      if (barcodeExists) {
        throw new ConflictException('Mã vạch đã tồn tại')
      }
    }

    // Upload images
    const imageUrls: string[] = []
    if (images && images.length > 0) {
      for (const image of images) {
        const url = await this.s3Service.uploadFile(image, 'products')
        imageUrls.push(url)
      }
    }

    // Create product
    const productData = {
      ...createProductDto,
      createdById: userId,
      images: imageUrls.map(url => ({ url })),
    }

    const product = await this.productsRepository.create(productData)

    // Queue background job for inventory initialization
    if (product.managementType === 'batch') {
      await this.productQueue.add('initialize-inventory', {
        productId: product.id,
        userId,
      })
    }

    return this.productsRepository.findById(product.id)
  }

  async findAll(filters: ProductFilterDto) {
    return this.productsRepository.findAll(filters)
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findById(id)
    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với ID ${id}`)
    }
    return product
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    images: Express.Multer.File[],
    userId: number,
  ): Promise<Product> {
    const product = await this.findOne(id)

    // Validate SKU uniqueness if changed
    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const skuExists = await this.productsRepository.existsBySku(updateProductDto.sku, id)
      if (skuExists) {
        throw new ConflictException('Mã SKU đã tồn tại')
      }
    }

    // Validate Barcode uniqueness if changed
    if (updateProductDto.barcode && updateProductDto.barcode !== product.barcode) {
      const barcodeExists = await this.productsRepository.existsByBarcode(
        updateProductDto.barcode,
        id,
      )
      if (barcodeExists) {
        throw new ConflictException('Mã vạch đã tồn tại')
      }
    }

    // Handle image uploads
    if (images && images.length > 0) {
      const imageUrls: string[] = []
      for (const image of images) {
        const url = await this.s3Service.uploadFile(image, 'products')
        imageUrls.push(url)
      }
      updateProductDto.images = imageUrls.map(url => ({ url })) as any
    }

    updateProductDto.updatedById = userId

    return this.productsRepository.update(id, updateProductDto)
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id)
    await this.productsRepository.delete(id)
  }

  async search(query: string): Promise<Product[]> {
    if (!query || query.length < 2) {
      throw new BadRequestException('Query phải có ít nhất 2 ký tự')
    }
    return this.productsRepository.search(query)
  }
}
```

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### JWT Strategy
```typescript
// src/modules/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { AuthService } from '../auth.service'

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
    })
  }

  async validate(payload: any) {
    const user = await this.authService.validateUser(payload.sub)
    if (!user) {
      throw new UnauthorizedException()
    }
    return user
  }
}
```

### Roles Guard
```typescript
// src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from '../decorators/roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles) {
      return true
    }

    const { user } = context.switchToHttp().getRequest()
    return requiredRoles.some((role) => user.role === role)
  }
}
```

---

## ✅ VALIDATION & DTOs

### DTO Example
```typescript
// src/modules/products/dto/create-product.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsArray,
  Min,
  Max,
  MinLength,
  MaxLength,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ManagementType } from '../entities/product.entity'

class ProductImageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  url: string
}

export class CreateProductDto {
  @ApiProperty({ description: 'Tên sản phẩm', example: 'Kem dưỡng da' })
  @IsString()
  @IsNotEmpty({ message: 'Tên sản phẩm là bắt buộc' })
  @MinLength(3, { message: 'Tên sản phẩm phải có ít nhất 3 ký tự' })
  @MaxLength(255, { message: 'Tên sản phẩm không được quá 255 ký tự' })
  name: string

  @ApiPropertyOptional({ description: 'Mã SKU', example: 'SKU001' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  sku?: string

  @ApiPropertyOptional({ description: 'Mã vạch', example: '1234567890123' })
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'Mã vạch phải có ít nhất 3 ký tự' })
  @MaxLength(15, { message: 'Mã vạch không được quá 15 ký tự' })
  barcode?: string

  @ApiPropertyOptional({ description: 'Khối lượng', example: 100 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  weight?: number

  @ApiPropertyOptional({ description: 'Đơn vị khối lượng', example: 'g' })
  @IsString()
  @IsOptional()
  weightUnit?: string

  @ApiPropertyOptional({ description: 'Đơn vị tính', example: 'Hộp' })
  @IsString()
  @IsOptional()
  unit?: string

  @ApiPropertyOptional({ description: 'Mô tả sản phẩm' })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({
    description: 'Hình thức quản lý',
    enum: ManagementType,
    example: ManagementType.NORMAL,
  })
  @IsEnum(ManagementType, { message: 'Hình thức quản lý không hợp lệ' })
  @IsNotEmpty()
  managementType: ManagementType

  @ApiProperty({ description: 'Giá bán lẻ', example: 100000 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0, { message: 'Giá bán lẻ phải lớn hơn hoặc bằng 0' })
  retailPrice: number

  @ApiPropertyOptional({ description: 'Giá bán buôn', example: 80000 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  wholesalePrice?: number

  @ApiPropertyOptional({ description: 'Giá nhập', example: 50000 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  importPrice?: number

  @ApiPropertyOptional({ description: 'Cho phép bán', default: true })
  @IsBoolean()
  @IsOptional()
  allowSale?: boolean

  @ApiPropertyOptional({ description: 'Áp dụng thuế', default: false })
  @IsBoolean()
  @IsOptional()
  applyTax?: boolean

  @ApiPropertyOptional({ description: 'ID loại sản phẩm' })
  @IsNumber()
  @IsOptional()
  productTypeId?: number

  @ApiPropertyOptional({ description: 'ID nhãn hiệu' })
  @IsNumber()
  @IsOptional()
  brandId?: number

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[]

  @ApiPropertyOptional({ description: 'Hình ảnh', type: [ProductImageDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[]
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

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value
    }

    const object = plainToInstance(metatype, value)
    const errors = await validate(object)

    if (errors.length > 0) {
      const messages = errors.map((error) => {
        return Object.values(error.constraints || {}).join(', ')
      })
      throw new BadRequestException({
        message: 'Validation failed',
        errors: messages,
      })
    }

    return value
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object]
    return !types.includes(metatype)
  }
}
```

---

## ⚠️ ERROR HANDLING

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

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error'

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: typeof message === 'string' ? message : (message as any).message,
      errors: typeof message === 'object' && 'errors' in message ? (message as any).errors : undefined,
    }

    // Log error
    this.logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : JSON.stringify(exception),
    )

    // Send to error tracking service (e.g., Sentry)
    if (status >= 500) {
      // Send to Sentry or other error tracking
    }

    response.status(status).json(errorResponse)
  }
}
```

---

## 💾 CACHING STRATEGY

### Redis Cache Service
```typescript
// src/common/services/cache.service.ts
import { Injectable, Inject } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key)
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl)
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key)
  }

  async reset(): Promise<void> {
    await this.cacheManager.reset()
  }

  // Cache product list
  async cacheProductList(filters: any, data: any, ttl = 300): Promise<void> {
    const key = `products:list:${JSON.stringify(filters)}`
    await this.set(key, data, ttl)
  }

  async getCachedProductList(filters: any): Promise<any> {
    const key = `products:list:${JSON.stringify(filters)}`
    return this.get(key)
  }

  // Invalidate product cache
  async invalidateProductCache(productId?: number): Promise<void> {
    if (productId) {
      await this.del(`products:${productId}`)
    }
    // Invalidate list cache patterns
    const keys = await this.cacheManager.store.keys('products:list:*')
    for (const key of keys) {
      await this.del(key)
    }
  }
}
```

---

## 📤 FILE UPLOAD

### S3 Service
```typescript
// src/common/services/s3.service.ts
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as AWS from 'aws-sdk'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class S3Service {
  private s3: AWS.S3
  private bucketName: string

  constructor(private configService: ConfigService) {
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get<string>('AWS_REGION'),
    })
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET')
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const fileName = `${folder}/${uuidv4()}-${file.originalname}`
    
    const params: AWS.S3.PutObjectRequest = {
      Bucket: this.bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    }

    const result = await this.s3.upload(params).promise()
    return result.Location
  }

  async deleteFile(url: string): Promise<void> {
    const key = url.split('.com/')[1]
    await this.s3.deleteObject({
      Bucket: this.bucketName,
      Key: key,
    }).promise()
  }
}
```

---

## 🔄 BACKGROUND JOBS

### Bull Queue Setup
```typescript
// src/modules/products/processors/product.processor.ts
import { Processor, Process } from '@nestjs/bull'
import { Job } from 'bull'
import { Injectable } from '@nestjs/common'
import { ProductsService } from '../products.service'

@Processor('product-processing')
@Injectable()
export class ProductProcessor {
  constructor(private productsService: ProductsService) {}

  @Process('initialize-inventory')
  async handleInitializeInventory(job: Job<{ productId: number; userId: number }>) {
    const { productId, userId } = job.data
    // Initialize inventory for all branches
    await this.productsService.initializeInventory(productId, userId)
  }
}
```

---

## 📊 LOGGING & MONITORING

### Winston Logger Setup
```typescript
// src/config/logger.config.ts
import { WinstonModuleOptions } from 'nest-winston'
import * as winston from 'winston'

export const loggerConfig: WinstonModuleOptions = {
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, context, trace }) => {
          return `${timestamp} [${context}] ${level}: ${message}${trace ? `\n${trace}` : ''}`
        }),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.json(),
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.json(),
    }),
  ],
}
```

---

## ✅ BEST PRACTICES

1. **Separation of Concerns**: Controller → Service → Repository
2. **Error Handling**: Use custom exceptions and global filters
3. **Validation**: Validate all inputs with DTOs
4. **Security**: Use guards, interceptors, and middleware
5. **Performance**: Implement caching, pagination, indexing
6. **Logging**: Log all important operations
7. **Testing**: Write unit and integration tests
8. **Documentation**: Use Swagger for API docs
9. **Code Quality**: Follow NestJS conventions
10. **Scalability**: Design for horizontal scaling

---

## 📝 NEXT STEPS

1. Setup NestJS project
2. Configure database connection
3. Setup authentication
4. Create core modules
5. Implement file upload
6. Setup caching
7. Add background jobs
8. Implement logging
9. Write tests
10. Setup CI/CD

