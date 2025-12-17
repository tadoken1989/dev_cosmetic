# 🏗️ ARCHITECTURE OVERVIEW - HỆ THỐNG QUẢN LÝ BÁN HÀNG

## 📋 MỤC LỤC
1. [Tổng quan hệ thống](#tổng-quan-hệ-thống)
2. [Kiến trúc tổng thể](#kiến-trúc-tổng-thể)
3. [Tech Stack](#tech-stack)
4. [Yêu cầu hiệu năng](#yêu-cầu-hiệu-năng)
5. [Các module chính](#các-module-chính)
6. [Luồng xử lý dữ liệu](#luồng-xử-lý-dữ-liệu)

---

## 🎯 TỔNG QUAN HỆ THỐNG

### Mục tiêu
Xây dựng hệ thống quản lý bán hàng (POS/E-commerce) với khả năng:
- Quản lý sản phẩm, kho hàng, giá cả
- Xử lý đơn hàng, giao dịch
- Quản lý khách hàng, nhà cung cấp
- Báo cáo và phân tích
- Hỗ trợ đa chi nhánh, đa kênh bán hàng

### Quy mô hệ thống
- **Số lượng tài khoản**: 1,000 users
- **Số lượng records**: 1,000,000+ records
- **Concurrent users**: 200-300 users đồng thời
- **Throughput**: 1,000 requests/second (peak)

---

## 🏛️ KIẾN TRÚC TỔNG THỂ

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (Vue 3)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Web App    │  │  Mobile Web  │  │  Admin Panel │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            │
┌─────────────────────────────────────────────────────────────┐
│                 API GATEWAY LAYER                            │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Rate Limiting │ Auth │ Load Balancing │ Caching  │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
┌─────────────────────────────────────────────────────────────┐
│              APPLICATION LAYER (NestJS)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Products    │  │   Orders     │  │  Inventory   │     │
│  │   Module     │  │   Module     │  │   Module     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Customers   │  │  Suppliers   │  │   Reports    │     │
│  │   Module     │  │   Module     │  │   Module     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
┌─────────────────────────────────────────────────────────────┐
│              DATA LAYER (PostgreSQL)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Primary DB  │  │  Read Replica│  │   Cache      │     │
│  │  (Write)     │  │   (Read)     │  │  (Redis)     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ File Storage │  │  Email/SMS   │  │  Payment     │     │
│  │  (S3/CDN)    │  │   Service    │  │  Gateway     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ TECH STACK

### Frontend
- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **State Management**: Pinia
- **UI Framework**: Element Plus / Ant Design Vue
- **HTTP Client**: Axios
- **Form Validation**: VeeValidate + Yup
- **Routing**: Vue Router 4
- **Internationalization**: Vue I18n
- **Date Handling**: Day.js
- **Charts**: ECharts / Chart.js

### Backend
- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **ORM**: TypeORM / Prisma
- **Validation**: class-validator, class-transformer
- **Authentication**: JWT + Passport
- **Caching**: Redis
- **Queue**: Bull (Redis-based)
- **File Upload**: Multer + AWS S3
- **API Documentation**: Swagger/OpenAPI

### Database
- **Primary DB**: PostgreSQL 15+
- **Cache**: Redis 7+
- **Connection Pooling**: PgBouncer
- **Migrations**: TypeORM Migrations

### DevOps & Infrastructure
- **Containerization**: Docker, Docker Compose
- **Orchestration**: Kubernetes (production)
- **CI/CD**: GitHub Actions / GitLab CI
- **Monitoring**: Prometheus + Grafana
- **Logging**: Winston + ELK Stack
- **Error Tracking**: Sentry

---

## ⚡ YÊU CẦU HIỆU NĂNG

### Response Time Targets
- **API Response**: < 200ms (p95)
- **Page Load**: < 2s (First Contentful Paint)
- **Database Query**: < 100ms (p95)
- **Search Results**: < 500ms

### Scalability Requirements
- **Horizontal Scaling**: Support multiple API instances
- **Database Read Replicas**: 2-3 replicas
- **CDN**: Static assets caching
- **Database Partitioning**: By date/tenant for large tables

### Resource Limits
- **API Memory**: 512MB - 2GB per instance
- **Database**: 16GB RAM minimum
- **Redis**: 4GB RAM minimum
- **Connection Pool**: 20-50 connections per instance

---

## 📦 CÁC MODULE CHÍNH

### 1. Authentication & Authorization Module
- Đăng nhập/đăng xuất
- JWT token management
- Role-based access control (RBAC)
- Permission management
- Session management

### 2. Product Management Module
- CRUD sản phẩm
- Quản lý loại sản phẩm, nhãn hiệu, tags
- Quản lý thuộc tính (size, color, etc.)
- Quản lý hình ảnh sản phẩm
- Quản lý đơn vị quy đổi
- Sản phẩm thường / Sản phẩm lô - HSD
- Tìm kiếm và lọc nâng cao

### 3. Pricing Module
- Giá bán lẻ, giá bán buôn, giá nhập
- Chính sách giá (price policies)
- Quản lý thuế (VAT)
- Thuế đầu vào / Thuế đầu ra
- Lịch sử thay đổi giá

### 4. Inventory Management Module
- Tồn kho theo chi nhánh
- Quản lý lô hàng (batch management)
- Hạn sử dụng (expiry date)
- Cảnh báo lô sắp hết hạn
- Nhập hàng, xuất hàng
- Kiểm hàng, chuyển hàng
- Điều chỉnh giá vốn

### 5. Order Management Module
- Tạo đơn hàng
- Xử lý đơn hàng
- Trạng thái đơn hàng
- Thanh toán
- Hủy đơn hàng

### 6. Customer Management Module
- CRUD khách hàng
- Lịch sử mua hàng
- Loyalty program
- Phân loại khách hàng

### 7. Supplier Management Module
- CRUD nhà cung cấp
- Đặt hàng nhập
- Lịch sử giao dịch

### 8. Branch Management Module
- Quản lý chi nhánh
- Tồn kho theo chi nhánh
- Chuyển hàng giữa chi nhánh

### 9. Report & Analytics Module
- Báo cáo bán hàng
- Báo cáo tồn kho
- Báo cáo tài chính
- Dashboard analytics

### 10. Settings Module
- Cấu hình hệ thống
- Quản lý người dùng
- Quản lý quyền
- Cấu hình kênh bán hàng

---

## 🔄 LUỒNG XỬ LÝ DỮ LIỆU

### Request Flow
```
Client Request
    ↓
API Gateway (Rate Limiting, Auth)
    ↓
NestJS Controller (Validation)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Data Access)
    ↓
Database (PostgreSQL)
    ↓
Response (with Caching)
```

### Data Flow - Product Creation
```
1. User fills form (Vue 3)
2. Form validation (VeeValidate)
3. API call to /api/products (POST)
4. NestJS validates request
5. Check permissions
6. Process images (upload to S3)
7. Create product record
8. Create inventory records (per branch)
9. Create audit log
10. Return response
11. Update UI state (Pinia)
12. Show success notification
```

### Error Flow
```
Error occurs
    ↓
Catch in Service/Controller
    ↓
Log error (Winston → ELK)
    ↓
Send to Sentry (if critical)
    ↓
Transform to user-friendly message
    ↓
Return error response
    ↓
Display in UI (Toast notification)
```

---

## 🔐 SECURITY ARCHITECTURE

### Authentication Flow
1. User login → JWT token generation
2. Token stored in httpOnly cookie + localStorage
3. Token refresh mechanism
4. Token blacklist on logout

### Authorization
- Role-based: Admin, Manager, Staff, Viewer
- Permission-based: Granular permissions per module
- Resource-level: Check ownership/branch access

### Data Protection
- Input validation & sanitization
- SQL injection prevention (ORM)
- XSS prevention
- CSRF protection
- Rate limiting
- Data encryption at rest & in transit

---

## 📊 MONITORING & OBSERVABILITY

### Metrics to Track
- API response times
- Database query performance
- Error rates
- User activity
- System resource usage
- Cache hit rates

### Logging Strategy
- **Level**: Error, Warn, Info, Debug
- **Format**: JSON structured logs
- **Retention**: 30 days
- **Alerting**: Critical errors → Slack/Email

---

## 🚀 DEPLOYMENT STRATEGY

### Environments
1. **Development**: Local development
2. **Staging**: Pre-production testing
3. **Production**: Live system

### Deployment Process
1. Code commit → CI/CD pipeline
2. Run tests (unit, integration, e2e)
3. Build Docker images
4. Deploy to staging
5. Run smoke tests
6. Deploy to production (blue-green)
7. Monitor & rollback if needed

---

## 📈 SCALING STRATEGY

### Vertical Scaling
- Increase server resources (CPU, RAM)

### Horizontal Scaling
- Add more API instances
- Database read replicas
- Redis cluster
- Load balancer

### Database Optimization
- Indexing strategy
- Query optimization
- Partitioning large tables
- Archiving old data

---

## ✅ NEXT STEPS

1. Review và approve architecture
2. Setup development environment
3. Initialize project structure
4. Implement core modules
5. Setup CI/CD pipeline
6. Performance testing
7. Security audit
8. Production deployment

