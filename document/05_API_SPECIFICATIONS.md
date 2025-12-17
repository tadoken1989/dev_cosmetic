# 🌐 API SPECIFICATIONS

## 📋 MỤC LỤC
1. [API Overview](#api-overview)
2. [Authentication APIs](#authentication-apis)
3. [Product APIs](#product-apis)
4. [Inventory APIs](#inventory-apis)
5. [Order APIs](#order-apis)
6. [Customer APIs](#customer-apis)
7. [Common Response Format](#common-response-format)
8. [Error Codes](#error-codes)

---

## 🎯 API OVERVIEW

### Base URL
```
Development: http://localhost:3000/api
Production: https://api.example.com/api
```

### API Versioning
- **Version**: v1
- **Format**: `/api/v1/{resource}`

### Authentication
- **Method**: Bearer Token (JWT)
- **Header**: `Authorization: Bearer {token}`

### Content Types
- **Request**: `application/json` or `multipart/form-data` (for file uploads)
- **Response**: `application/json`

---

## 🔐 AUTHENTICATION APIS

### POST /api/v1/auth/login
Đăng nhập

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "fullName": "Nguyễn Văn A",
      "role": "admin",
      "branchId": 1
    }
  }
}
```

**Error Responses:**
- `401`: Invalid credentials
- `422`: Validation errors

---

### POST /api/v1/auth/logout
Đăng xuất

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Đăng xuất thành công"
}
```

---

### GET /api/v1/auth/me
Lấy thông tin user hiện tại

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "role": "admin",
    "permissions": ["product:create", "product:update", "product:delete"],
    "branchId": 1
  }
}
```

---

## 📦 PRODUCT APIS

### GET /api/v1/products
Lấy danh sách sản phẩm

**Query Parameters:**
- `page` (number, default: 1): Số trang
- `pageSize` (number, default: 20): Số lượng mỗi trang
- `search` (string): Tìm kiếm theo tên, SKU, barcode
- `productTypeId` (number): Lọc theo loại sản phẩm
- `brandId` (number): Lọc theo nhãn hiệu
- `managementType` (string): 'normal' hoặc 'batch'
- `allowSale` (boolean): Lọc theo cho phép bán
- `minPrice` (number): Giá tối thiểu
- `maxPrice` (number): Giá tối đa
- `sortBy` (string, default: 'createdAt'): Sắp xếp theo
- `sortOrder` (string, default: 'DESC'): 'ASC' hoặc 'DESC'

**Example:**
```
GET /api/v1/products?page=1&pageSize=20&search=kem&productTypeId=1&sortBy=name&sortOrder=ASC
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "name": "Kem dưỡng da",
        "sku": "SKU001",
        "barcode": "1234567890123",
        "retailPrice": 100000,
        "wholesalePrice": 80000,
        "importPrice": 50000,
        "productType": {
          "id": 1,
          "name": "Kem dưỡng mắt"
        },
        "brand": {
          "id": 1,
          "name": "Brand A"
        },
        "images": [
          {
            "id": 1,
            "url": "https://example.com/image.jpg",
            "isPrimary": true
          }
        ],
        "tags": ["tag1", "tag2"],
        "allowSale": true,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  }
}
```

---

### GET /api/v1/products/:id
Lấy thông tin chi tiết sản phẩm

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Kem dưỡng da",
    "sku": "SKU001",
    "barcode": "1234567890123",
    "weight": 100,
    "weightUnit": "g",
    "unit": "Hộp",
    "description": "Mô tả sản phẩm",
    "managementType": "normal",
    "retailPrice": 100000,
    "wholesalePrice": 80000,
    "importPrice": 50000,
    "allowSale": true,
    "applyTax": true,
    "taxIncluded": false,
    "inputTax": {
      "id": 1,
      "name": "VAT",
      "rate": 10
    },
    "outputTax": {
      "id": 2,
      "name": "VAT",
      "rate": 10
    },
    "productType": {
      "id": 1,
      "name": "Kem dưỡng mắt"
    },
    "brand": {
      "id": 1,
      "name": "Brand A"
    },
    "images": [...],
    "tags": ["tag1", "tag2"],
    "inventories": [
      {
        "branchId": 1,
        "quantity": 100,
        "availableQuantity": 95,
        "costPrice": 50000
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

**Error Responses:**
- `404`: Product not found

---

### POST /api/v1/products
Tạo sản phẩm mới

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
name: "Kem dưỡng da"
sku: "SKU001"
barcode: "1234567890123"
weight: 100
weightUnit: "g"
unit: "Hộp"
description: "Mô tả sản phẩm"
managementType: "normal"
retailPrice: 100000
wholesalePrice: 80000
importPrice: 50000
allowSale: true
applyTax: false
productTypeId: 1
brandId: 1
tags: ["tag1", "tag2"]
images: [File, File, ...]
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Kem dưỡng da",
    ...
  },
  "message": "Tạo sản phẩm thành công"
}
```

**Error Responses:**
- `400`: Bad request
- `403`: Forbidden
- `409`: Conflict (SKU or barcode already exists)
- `422`: Validation errors

---

### PATCH /api/v1/products/:id
Cập nhật sản phẩm

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body:** Same as POST

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    ...
  },
  "message": "Cập nhật sản phẩm thành công"
}
```

---

### DELETE /api/v1/products/:id
Xóa sản phẩm

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Xóa sản phẩm thành công"
}
```

---

### GET /api/v1/products/search/:query
Tìm kiếm sản phẩm (quick search)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Kem dưỡng da",
      "sku": "SKU001",
      "barcode": "1234567890123",
      "retailPrice": 100000
    }
  ]
}
```

---

## 📊 INVENTORY APIS

### GET /api/v1/inventory
Lấy danh sách tồn kho

**Query Parameters:**
- `page`, `pageSize`
- `productId`: Lọc theo sản phẩm
- `branchId`: Lọc theo chi nhánh
- `minQuantity`: Số lượng tối thiểu
- `maxQuantity`: Số lượng tối đa

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "product": {
          "id": 1,
          "name": "Kem dưỡng da",
          "sku": "SKU001"
        },
        "branch": {
          "id": 1,
          "name": "Chi nhánh mặc định"
        },
        "quantity": 100,
        "availableQuantity": 95,
        "reservedQuantity": 5,
        "costPrice": 50000,
        "minStock": 10,
        "maxStock": 200
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### GET /api/v1/inventory/products/:productId
Lấy tồn kho của sản phẩm theo các chi nhánh

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "branchId": 1,
      "branchName": "Chi nhánh mặc định",
      "quantity": 100,
      "availableQuantity": 95,
      "costPrice": 50000
    }
  ]
}
```

---

### POST /api/v1/inventory/adjust
Điều chỉnh tồn kho

**Request Body:**
```json
{
  "productId": 1,
  "branchId": 1,
  "quantity": 10,
  "type": "increase", // "increase" or "decrease"
  "reason": "Kiểm hàng",
  "notes": "Ghi chú"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "quantity": 110,
    "previousQuantity": 100
  },
  "message": "Điều chỉnh tồn kho thành công"
}
```

---

## 🛒 ORDER APIS

### GET /api/v1/orders
Lấy danh sách đơn hàng

**Query Parameters:**
- `page`, `pageSize`
- `status`: Lọc theo trạng thái
- `customerId`: Lọc theo khách hàng
- `branchId`: Lọc theo chi nhánh
- `startDate`: Ngày bắt đầu
- `endDate`: Ngày kết thúc

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "orderNumber": "ORD001",
        "customer": {
          "id": 1,
          "fullName": "Nguyễn Văn A"
        },
        "status": "confirmed",
        "totalAmount": 200000,
        "paymentStatus": "paid",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### POST /api/v1/orders
Tạo đơn hàng mới

**Request Body:**
```json
{
  "customerId": 1,
  "branchId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "unitPrice": 100000,
      "discountAmount": 0
    }
  ],
  "paymentMethod": "cash",
  "notes": "Ghi chú"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderNumber": "ORD001",
    "totalAmount": 200000,
    ...
  },
  "message": "Tạo đơn hàng thành công"
}
```

---

## 👥 CUSTOMER APIS

### GET /api/v1/customers
Lấy danh sách khách hàng

**Query Parameters:**
- `page`, `pageSize`
- `search`: Tìm kiếm theo tên, email, phone
- `customerType`: Lọc theo loại khách hàng

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "code": "CUS001",
        "fullName": "Nguyễn Văn A",
        "email": "customer@example.com",
        "phone": "0123456789",
        "customerType": "retail",
        "loyaltyPoints": 100,
        "totalSpent": 1000000
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### POST /api/v1/customers
Tạo khách hàng mới

**Request Body:**
```json
{
  "fullName": "Nguyễn Văn A",
  "email": "customer@example.com",
  "phone": "0123456789",
  "address": "123 Đường ABC",
  "customerType": "retail"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    ...
  },
  "message": "Tạo khách hàng thành công"
}
```

---

## 📝 COMMON RESPONSE FORMAT

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Thành công"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "data": [...],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu không hợp lệ",
    "errors": [
      {
        "field": "name",
        "message": "Tên sản phẩm là bắt buộc"
      }
    ]
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "path": "/api/v1/products"
}
```

---

## 🚨 ERROR CODES

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `422`: Unprocessable Entity (Validation Error)
- `500`: Internal Server Error

### Custom Error Codes
- `VALIDATION_ERROR`: Validation failed
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `DUPLICATE_ENTRY`: Duplicate record (SKU, barcode, etc.)
- `INSUFFICIENT_STOCK`: Not enough inventory
- `INVALID_STATUS`: Invalid status transition

---

## 🔒 RATE LIMITING

### Limits
- **General**: 100 requests/minute
- **Authentication**: 5 requests/minute
- **File Upload**: 10 requests/minute

### Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

---

## 📚 API DOCUMENTATION

### Swagger/OpenAPI
- **URL**: `/api/docs`
- **Format**: OpenAPI 3.0

### Postman Collection
- Export Postman collection for testing
- Include environment variables

---

## ✅ BEST PRACTICES

1. **RESTful Design**: Follow REST conventions
2. **Versioning**: Use API versioning
3. **Pagination**: Always paginate list endpoints
4. **Filtering**: Support common filters
5. **Sorting**: Allow custom sorting
6. **Error Handling**: Consistent error format
7. **Validation**: Validate all inputs
8. **Security**: Use authentication and authorization
9. **Documentation**: Keep API docs updated
10. **Testing**: Test all endpoints

---

## 📝 NEXT STEPS

1. Implement authentication APIs
2. Implement product APIs
3. Implement inventory APIs
4. Implement order APIs
5. Add Swagger documentation
6. Write API tests
7. Setup rate limiting
8. Monitor API performance

