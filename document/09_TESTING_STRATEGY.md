# 🧪 TESTING STRATEGY

## 📋 MỤC LỤC
1. [Testing Overview](#testing-overview)
2. [Unit Testing](#unit-testing)
3. [Integration Testing](#integration-testing)
4. [E2E Testing](#e2e-testing)
5. [Frontend Testing](#frontend-testing)
6. [Backend Testing](#backend-testing)
7. [Test Coverage](#test-coverage)
8. [CI/CD Testing](#cicd-testing)

---

## 🎯 TESTING OVERVIEW

### Testing Pyramid
```
        /\
       /  \      E2E Tests (10%)
      /____\
     /      \    Integration Tests (30%)
    /________\
   /          \  Unit Tests (60%)
  /____________\
```

### Testing Tools
- **Frontend**: Vitest, Vue Test Utils, Testing Library
- **Backend**: Jest, Supertest
- **E2E**: Playwright, Cypress
- **Coverage**: Istanbul/NYC

---

## 🔬 UNIT TESTING

### Frontend Unit Tests
```typescript
// tests/unit/components/ProductCard.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductCard from '@/components/product/ProductCard.vue'
import type { Product } from '@/types/product.types'

describe('ProductCard', () => {
  const product: Product = {
    id: 1,
    name: 'Test Product',
    sku: 'SKU001',
    retailPrice: 100000,
    allowSale: true,
  }

  it('renders product name', () => {
    const wrapper = mount(ProductCard, {
      props: { product },
    })
    expect(wrapper.text()).toContain('Test Product')
  })

  it('displays price correctly', () => {
    const wrapper = mount(ProductCard, {
      props: { product },
    })
    expect(wrapper.text()).toContain('100,000')
  })

  it('emits click event', async () => {
    const wrapper = mount(ProductCard, {
      props: { product },
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
```

### Backend Unit Tests
```typescript
// src/modules/products/products.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing'
import { ProductsService } from './products.service'
import { ProductsRepository } from './products.repository'
import { NotFoundException, ConflictException } from '@nestjs/common'

describe('ProductsService', () => {
  let service: ProductsService
  let repository: ProductsRepository

  const mockRepository = {
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    existsBySku: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: ProductsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile()

    service = module.get<ProductsService>(ProductsService)
    repository = module.get<ProductsRepository>(ProductsRepository)
  })

  describe('findOne', () => {
    it('should return a product', async () => {
      const product = { id: 1, name: 'Test Product' }
      mockRepository.findById.mockResolvedValue(product)

      const result = await service.findOne(1)
      expect(result).toEqual(product)
      expect(repository.findById).toHaveBeenCalledWith(1)
    })

    it('should throw NotFoundException if product not found', async () => {
      mockRepository.findById.mockResolvedValue(null)

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('should create a product', async () => {
      const dto = { name: 'Test Product', retailPrice: 100000 }
      const product = { id: 1, ...dto }
      
      mockRepository.existsBySku.mockResolvedValue(false)
      mockRepository.create.mockResolvedValue(product)
      mockRepository.findById.mockResolvedValue(product)

      const result = await service.create(dto, [], 1)
      expect(result).toEqual(product)
    })

    it('should throw ConflictException if SKU exists', async () => {
      const dto = { name: 'Test Product', sku: 'SKU001', retailPrice: 100000 }
      
      mockRepository.existsBySku.mockResolvedValue(true)

      await expect(service.create(dto, [], 1)).rejects.toThrow(ConflictException)
    })
  })
})
```

---

## 🔗 INTEGRATION TESTING

### Backend Integration Tests
```typescript
// test/integration/products.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../../src/app.module'
import { DataSource } from 'typeorm'

describe('Products (e2e)', () => {
  let app: INestApplication
  let dataSource: DataSource
  let authToken: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    dataSource = app.get(DataSource)
    
    // Login to get token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@test.com', password: 'password' })
    
    authToken = loginResponse.body.data.token
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    // Clean database before each test
    await dataSource.query('TRUNCATE TABLE products CASCADE')
  })

  describe('POST /api/v1/products', () => {
    it('should create a product', () => {
      return request(app.getHttpServer())
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Product',
          retailPrice: 100000,
          managementType: 'normal',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true)
          expect(res.body.data.name).toBe('Test Product')
        })
    })

    it('should return 400 if name is missing', () => {
      return request(app.getHttpServer())
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          retailPrice: 100000,
        })
        .expect(422)
    })

    it('should return 409 if SKU already exists', async () => {
      // Create first product
      await request(app.getHttpServer())
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Product 1',
          sku: 'SKU001',
          retailPrice: 100000,
        })

      // Try to create duplicate
      return request(app.getHttpServer())
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Product 2',
          sku: 'SKU001',
          retailPrice: 100000,
        })
        .expect(409)
    })
  })

  describe('GET /api/v1/products', () => {
    it('should return paginated products', async () => {
      // Create test products
      for (let i = 1; i <= 25; i++) {
        await request(app.getHttpServer())
          .post('/api/v1/products')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: `Product ${i}`,
            retailPrice: 100000,
          })
      }

      return request(app.getHttpServer())
        .get('/api/v1/products?page=1&pageSize=20')
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true)
          expect(res.body.data.data).toHaveLength(20)
          expect(res.body.data.total).toBe(25)
          expect(res.body.data.page).toBe(1)
          expect(res.body.data.pageSize).toBe(20)
        })
    })
  })
})
```

---

## 🎭 E2E TESTING

### Playwright E2E Tests
```typescript
// tests/e2e/product-management.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Product Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@test.com')
    await page.fill('input[name="password"]', 'password')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('should create a new product', async ({ page }) => {
    // Navigate to products
    await page.click('text=Sản phẩm')
    await page.click('text=Danh sách sản phẩm')
    
    // Click create button
    await page.click('text=+ Thêm sản phẩm')
    
    // Fill form
    await page.fill('input[name="name"]', 'Test Product E2E')
    await page.fill('input[name="sku"]', 'E2E001')
    await page.fill('input[name="retailPrice"]', '100000')
    
    // Select product type
    await page.click('select[name="productTypeId"]')
    await page.selectOption('select[name="productTypeId"]', '1')
    
    // Submit
    await page.click('button:has-text("Lưu")')
    
    // Wait for success message
    await expect(page.locator('text=Sản phẩm đã được tạo')).toBeVisible()
    
    // Verify product in list
    await page.goto('/products')
    await expect(page.locator('text=Test Product E2E')).toBeVisible()
  })

  test('should search products', async ({ page }) => {
    await page.goto('/products')
    
    // Search
    await page.fill('input[placeholder*="Tìm kiếm"]', 'kem')
    await page.waitForTimeout(500) // Wait for debounce
    
    // Verify results
    const products = page.locator('.product-card')
    await expect(products.first()).toBeVisible()
  })

  test('should edit product', async ({ page }) => {
    await page.goto('/products')
    
    // Click on first product
    await page.click('.product-card:first-child')
    
    // Click edit button
    await page.click('button:has-text("Sửa sản phẩm")')
    
    // Update name
    await page.fill('input[name="name"]', 'Updated Product Name')
    
    // Save
    await page.click('button:has-text("Lưu")')
    
    // Verify update
    await expect(page.locator('text=Updated Product Name')).toBeVisible()
  })
})
```

---

## 🎨 FRONTEND TESTING

### Component Testing
```typescript
// tests/unit/composables/useProduct.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useProduct } from '@/composables/useProduct'
import { productService } from '@/services/product.service'

vi.mock('@/services/product.service')

describe('useProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch products', async () => {
    const mockProducts = [
      { id: 1, name: 'Product 1' },
      { id: 2, name: 'Product 2' },
    ]

    vi.mocked(productService.getProducts).mockResolvedValue({
      data: mockProducts,
      total: 2,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    })

    const { products, fetchProducts, loading } = useProduct()
    
    expect(loading.value).toBe(false)
    
    await fetchProducts()
    
    expect(loading.value).toBe(false)
    expect(products.value).toEqual(mockProducts)
    expect(productService.getProducts).toHaveBeenCalled()
  })

  it('should handle errors', async () => {
    const error = new Error('Failed to fetch')
    vi.mocked(productService.getProducts).mockRejectedValue(error)

    const { error: errorState, fetchProducts } = useProduct()
    
    await fetchProducts()
    
    expect(errorState.value).toBeTruthy()
  })
})
```

---

## ⚙️ BACKEND TESTING

### Service Testing
```typescript
// src/modules/products/products.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { ProductsService } from './products.service'
import { Product } from './entities/product.entity'

describe('ProductsService', () => {
  let service: ProductsService
  let repository: Repository<Product>

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
      ],
    }).compile()

    service = module.get<ProductsService>(ProductsService)
    repository = module.get<Repository<Product>>(getRepositoryToken(Product))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
```

---

## 📊 TEST COVERAGE

### Coverage Configuration
```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "playwright test"
  },
  "jest": {
    "collectCoverageFrom": [
      "src/**/*.{ts,tsx}",
      "!src/**/*.spec.ts",
      "!src/**/*.interface.ts",
      "!src/main.ts"
    ],
    "coverageThresholds": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

### Coverage Goals
- **Unit Tests**: 80%+ coverage
- **Integration Tests**: 70%+ coverage
- **E2E Tests**: Critical user flows

---

## 🔄 CI/CD TESTING

### GitHub Actions
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      
      - name: Generate coverage
        run: npm run test:cov
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## ✅ TESTING BEST PRACTICES

1. **Test Isolation**: Each test should be independent
2. **Arrange-Act-Assert**: Clear test structure
3. **Descriptive Names**: Test names should describe what they test
4. **Mock External Dependencies**: Don't test third-party code
5. **Test Edge Cases**: Test boundary conditions
6. **Fast Tests**: Unit tests should be fast
7. **Maintainable**: Tests should be easy to maintain
8. **Coverage**: Aim for high coverage but focus on quality

---

## 📝 TESTING CHECKLIST

### Unit Tests
- [ ] Service methods
- [ ] Utility functions
- [ ] Composables
- [ ] Components (critical ones)
- [ ] Validators

### Integration Tests
- [ ] API endpoints
- [ ] Database operations
- [ ] Authentication flow
- [ ] Authorization checks

### E2E Tests
- [ ] User registration/login
- [ ] Product CRUD operations
- [ ] Order creation
- [ ] Critical user flows

---

## 📝 NEXT STEPS

1. Setup testing framework
2. Write unit tests
3. Write integration tests
4. Write E2E tests
5. Setup CI/CD testing
6. Monitor test coverage
7. Maintain test suite

