# 🗄️ DATABASE SCHEMA DESIGN - POSTGRESQL

## 📋 MỤC LỤC
1. [Database Overview](#database-overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Core Tables](#core-tables)
4. [Indexing Strategy](#indexing-strategy)
5. [Partitioning Strategy](#partitioning-strategy)
6. [Migration Scripts](#migration-scripts)
7. [Seed Data](#seed-data)
8. [Performance Optimization](#performance-optimization)

---

## 🎯 DATABASE OVERVIEW

### Database Configuration
- **Database Name**: `cosmetic_db`
- **Version**: PostgreSQL 15+
- **Encoding**: UTF-8
- **Collation**: vi_VN.UTF-8
- **Connection Pool**: 20-50 connections
- **Max Connections**: 100

### Design Principles
1. **Normalization**: 3NF (Third Normal Form)
2. **Indexing**: Strategic indexes for performance
3. **Constraints**: Foreign keys, unique constraints, check constraints
4. **Soft Deletes**: Use `deleted_at` for important entities
5. **Audit Trail**: Track `created_at`, `updated_at`, `created_by`, `updated_by`
6. **Scalability**: Design for 1M+ records

---

## 📊 ENTITY RELATIONSHIP DIAGRAM

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│    Users    │         │   Products  │         │  Inventory  │
├─────────────┤         ├─────────────┤         ├─────────────┤
│ id (PK)     │         │ id (PK)     │◄────────┤ product_id  │
│ email       │         │ name        │         │ branch_id   │
│ password    │         │ sku         │         │ quantity    │
│ role        │         │ barcode     │         │ cost_price  │
│ ...         │         │ ...         │         │ ...         │
└─────────────┘         └─────────────┘         └─────────────┘
      │                        │                        │
      │                        │                        │
      │                  ┌─────┴─────┐                  │
      │                  │           │                  │
      │            ┌─────────┐ ┌─────────┐      ┌──────────┐
      │            │Product  │ │  Brand  │      │ Branches │
      │            │  Type   │ │         │      │          │
      │            └─────────┘ └─────────┘      └──────────┘
      │
┌─────────────┐
│   Orders    │
├─────────────┤
│ id (PK)     │
│ customer_id │
│ total       │
│ ...         │
└─────────────┘
```

---

## 📦 CORE TABLES

### 1. Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL DEFAULT 'staff',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    branch_id INTEGER REFERENCES branches(id),
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_branch_id ON users(branch_id);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;
```

### 2. Products Table
```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(50) UNIQUE,
    weight DECIMAL(10, 2),
    weight_unit VARCHAR(10) DEFAULT 'g',
    unit VARCHAR(50),
    description TEXT,
    management_type VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (management_type IN ('normal', 'batch')),
    retail_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
    wholesale_price DECIMAL(12, 2) DEFAULT 0,
    import_price DECIMAL(12, 2) DEFAULT 0,
    allow_sale BOOLEAN NOT NULL DEFAULT true,
    apply_tax BOOLEAN NOT NULL DEFAULT false,
    tax_included BOOLEAN,
    input_tax_id INTEGER REFERENCES taxes(id),
    output_tax_id INTEGER REFERENCES taxes(id),
    expiry_warning_enabled BOOLEAN DEFAULT false,
    product_type_id INTEGER REFERENCES product_types(id),
    brand_id INTEGER REFERENCES brands(id),
    tags TEXT[] DEFAULT '{}',
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
);

CREATE INDEX idx_products_name ON products USING gin(to_tsvector('vietnamese', name));
CREATE INDEX idx_products_sku ON products(sku) WHERE sku IS NOT NULL;
CREATE INDEX idx_products_barcode ON products(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX idx_products_product_type_id ON products(product_type_id);
CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_products_management_type ON products(management_type);
CREATE INDEX idx_products_allow_sale ON products(allow_sale);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_deleted_at ON products(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_tags ON products USING gin(tags);
```

### 3. Product Types Table
```sql
CREATE TABLE product_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    parent_id INTEGER REFERENCES product_types(id),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_product_types_name ON product_types(name);
CREATE INDEX idx_product_types_parent_id ON product_types(parent_id);
CREATE INDEX idx_product_types_deleted_at ON product_types(deleted_at) WHERE deleted_at IS NULL;
```

### 4. Brands Table
```sql
CREATE TABLE brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    logo_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_brands_name ON brands(name);
CREATE INDEX idx_brands_deleted_at ON brands(deleted_at) WHERE deleted_at IS NULL;
```

### 5. Product Images Table
```sql
CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_is_primary ON product_images(product_id, is_primary) WHERE is_primary = true;
```

### 6. Branches Table
```sql
CREATE TABLE branches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    manager_id INTEGER REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_branches_code ON branches(code);
CREATE INDEX idx_branches_status ON branches(status);
CREATE INDEX idx_branches_deleted_at ON branches(deleted_at) WHERE deleted_at IS NULL;
```

### 7. Inventory Table
```sql
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    branch_id INTEGER NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    available_quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER NOT NULL DEFAULT 0,
    in_transit_quantity INTEGER NOT NULL DEFAULT 0,
    cost_price DECIMAL(12, 2),
    min_stock INTEGER,
    max_stock INTEGER,
    storage_location VARCHAR(255),
    last_counted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, branch_id)
);

CREATE INDEX idx_inventory_product_id ON inventory(product_id);
CREATE INDEX idx_inventory_branch_id ON inventory(branch_id);
CREATE INDEX idx_inventory_quantity ON inventory(quantity) WHERE quantity > 0;
CREATE INDEX idx_inventory_available_quantity ON inventory(available_quantity) WHERE available_quantity > 0;
CREATE INDEX idx_inventory_product_branch ON inventory(product_id, branch_id);
```

### 8. Batches Table (for batch products)
```sql
CREATE TABLE batches (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    branch_id INTEGER NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    batch_number VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    available_quantity INTEGER NOT NULL DEFAULT 0,
    cost_price DECIMAL(12, 2),
    manufacture_date DATE,
    expiry_date DATE NOT NULL,
    warning_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, branch_id, batch_number)
);

CREATE INDEX idx_batches_product_id ON batches(product_id);
CREATE INDEX idx_batches_branch_id ON batches(branch_id);
CREATE INDEX idx_batches_expiry_date ON batches(expiry_date);
CREATE INDEX idx_batches_expiry_warning ON batches(expiry_date, warning_sent) 
    WHERE expiry_date <= CURRENT_DATE + INTERVAL '30 days' AND warning_sent = false;
CREATE INDEX idx_batches_product_branch ON batches(product_id, branch_id);
```

### 9. Taxes Table
```sql
CREATE TABLE taxes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    rate DECIMAL(5, 2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('input', 'output', 'both')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_taxes_code ON taxes(code);
CREATE INDEX idx_taxes_type ON taxes(type);
CREATE INDEX idx_taxes_is_active ON taxes(is_active) WHERE is_active = true;
CREATE INDEX idx_taxes_deleted_at ON taxes(deleted_at) WHERE deleted_at IS NULL;
```

### 10. Orders Table
```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id),
    branch_id INTEGER NOT NULL REFERENCES branches(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid' 
        CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'refunded')),
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancelled_by INTEGER REFERENCES users(id)
);

CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_branch_id ON orders(branch_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_branch_status ON orders(branch_id, status);
```

### 11. Order Items Table
```sql
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    batch_id INTEGER REFERENCES batches(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(12, 2) NOT NULL,
    discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_order_items_batch_id ON order_items(batch_id);
```

### 12. Customers Table
```sql
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    gender VARCHAR(10),
    customer_type VARCHAR(20) DEFAULT 'retail' CHECK (customer_type IN ('retail', 'wholesale', 'vip')),
    loyalty_points INTEGER DEFAULT 0,
    total_spent DECIMAL(12, 2) DEFAULT 0,
    last_purchase_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

CREATE INDEX idx_customers_code ON customers(code) WHERE code IS NOT NULL;
CREATE INDEX idx_customers_email ON customers(email) WHERE email IS NOT NULL;
CREATE INDEX idx_customers_phone ON customers(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_customers_customer_type ON customers(customer_type);
CREATE INDEX idx_customers_deleted_at ON customers(deleted_at) WHERE deleted_at IS NULL;
```

### 13. Suppliers Table
```sql
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    tax_code VARCHAR(50),
    bank_account VARCHAR(100),
    bank_name VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_suppliers_code ON suppliers(code);
CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_suppliers_status ON suppliers(status);
CREATE INDEX idx_suppliers_deleted_at ON suppliers(deleted_at) WHERE deleted_at IS NULL;
```

### 14. Purchase Orders Table
```sql
CREATE TABLE purchase_orders (
    id SERIAL PRIMARY KEY,
    po_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
    branch_id INTEGER NOT NULL REFERENCES branches(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' 
        CHECK (status IN ('draft', 'sent', 'confirmed', 'received', 'cancelled')),
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    expected_delivery_date DATE,
    received_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_purchase_orders_po_number ON purchase_orders(po_number);
CREATE INDEX idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_branch_id ON purchase_orders(branch_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_purchase_orders_created_at ON purchase_orders(created_at DESC);
```

### 15. Stock Movements Table (Audit Trail)
```sql
CREATE TABLE stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id),
    branch_id INTEGER NOT NULL REFERENCES branches(id),
    batch_id INTEGER REFERENCES batches(id),
    movement_type VARCHAR(20) NOT NULL 
        CHECK (movement_type IN ('in', 'out', 'transfer', 'adjustment', 'return')),
    quantity INTEGER NOT NULL,
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    reference_type VARCHAR(50), -- 'order', 'purchase_order', 'transfer', etc.
    reference_id INTEGER,
    notes TEXT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_branch_id ON stock_movements(branch_id);
CREATE INDEX idx_stock_movements_batch_id ON stock_movements(batch_id);
CREATE INDEX idx_stock_movements_movement_type ON stock_movements(movement_type);
CREATE INDEX idx_stock_movements_reference ON stock_movements(reference_type, reference_id);
CREATE INDEX idx_stock_movements_created_at ON stock_movements(created_at DESC);
CREATE INDEX idx_stock_movements_product_branch_date ON stock_movements(product_id, branch_id, created_at DESC);
```

### 16. Price Policies Table
```sql
CREATE TABLE price_policies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    product_id INTEGER REFERENCES products(id),
    customer_type VARCHAR(20),
    min_quantity INTEGER,
    discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_price_policies_product_id ON price_policies(product_id);
CREATE INDEX idx_price_policies_customer_type ON price_policies(customer_type);
CREATE INDEX idx_price_policies_dates ON price_policies(start_date, end_date);
CREATE INDEX idx_price_policies_is_active ON price_policies(is_active) WHERE is_active = true;
```

---

## 🔍 INDEXING STRATEGY

### Primary Indexes
- All primary keys (automatic)
- Foreign keys (for joins)
- Unique constraints

### Performance Indexes
- **Search indexes**: Full-text search on product names
- **Filter indexes**: Status, type, date ranges
- **Composite indexes**: Multi-column queries
- **Partial indexes**: Filtered indexes for active records

### Index Maintenance
```sql
-- Analyze tables regularly
ANALYZE products;
ANALYZE inventory;
ANALYZE orders;

-- Reindex if needed
REINDEX TABLE products;
```

---

## 📊 PARTITIONING STRATEGY

### Partitioning Large Tables

#### Stock Movements (by date)
```sql
-- Partition by month
CREATE TABLE stock_movements (
    -- columns
) PARTITION BY RANGE (created_at);

CREATE TABLE stock_movements_2024_01 PARTITION OF stock_movements
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE stock_movements_2024_02 PARTITION OF stock_movements
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
```

#### Orders (by date)
```sql
CREATE TABLE orders (
    -- columns
) PARTITION BY RANGE (created_at);
```

---

## 🔄 MIGRATION SCRIPTS

### Example Migration
```typescript
// database/migrations/001_create_products_table.ts
import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm'

export class CreateProductsTable1700000000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'products',
                columns: [
                    {
                        name: 'id',
                        type: 'SERIAL',
                        isPrimary: true,
                    },
                    {
                        name: 'name',
                        type: 'VARCHAR',
                        length: '255',
                        isNullable: false,
                    },
                    // ... other columns
                ],
            }),
            true,
        )

        await queryRunner.createIndex(
            'products',
            new TableIndex({
                name: 'idx_products_name',
                columnNames: ['name'],
            }),
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('products')
    }
}
```

---

## 🌱 SEED DATA

### Seed Script Example
```typescript
// database/seeds/product-types.seed.ts
import { DataSource } from 'typeorm'
import { ProductType } from '../../modules/products/entities/product-type.entity'

export async function seedProductTypes(dataSource: DataSource) {
    const repository = dataSource.getRepository(ProductType)
    
    const productTypes = [
        { name: 'Gọng kính' },
        { name: 'Hỗ trợ sức khỏe' },
        { name: 'Kem dưỡng mắt' },
        { name: 'Bút kẻ mắt' },
        { name: 'Tẩy trang' },
    ]

    for (const type of productTypes) {
        const exists = await repository.findOne({ where: { name: type.name } })
        if (!exists) {
            await repository.save(repository.create(type))
        }
    }
}
```

---

## ⚡ PERFORMANCE OPTIMIZATION

### Query Optimization
```sql
-- Use EXPLAIN ANALYZE to check query plans
EXPLAIN ANALYZE 
SELECT * FROM products 
WHERE name ILIKE '%kem%' 
ORDER BY created_at DESC 
LIMIT 20;

-- Optimize with proper indexes
CREATE INDEX idx_products_name_search ON products 
USING gin(to_tsvector('vietnamese', name));
```

### Connection Pooling
```typescript
// Use connection pooling
{
  max: 50,
  min: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}
```

### Vacuum and Analyze
```sql
-- Regular maintenance
VACUUM ANALYZE products;
VACUUM ANALYZE inventory;
VACUUM ANALYZE orders;
```

---

## 🔒 SECURITY

### Row Level Security (RLS)
```sql
-- Enable RLS on sensitive tables
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY branch_isolation ON inventory
    FOR ALL
    TO staff
    USING (branch_id = current_setting('app.current_branch_id')::int);
```

---

## 📝 BEST PRACTICES

1. **Naming Conventions**: snake_case for tables and columns
2. **Foreign Keys**: Always define foreign key constraints
3. **Indexes**: Create indexes for frequently queried columns
4. **Constraints**: Use check constraints for data validation
5. **Soft Deletes**: Use deleted_at for important entities
6. **Timestamps**: Always track created_at and updated_at
7. **Audit Trail**: Track created_by and updated_by
8. **Migrations**: Version control all schema changes
9. **Backups**: Regular automated backups
10. **Monitoring**: Monitor query performance and slow queries

---

## ✅ NEXT STEPS

1. Create database
2. Run migrations
3. Seed initial data
4. Setup indexes
5. Configure connection pooling
6. Setup backups
7. Monitor performance
8. Optimize queries

