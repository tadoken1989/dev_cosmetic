-- ============================================================
-- PRODUCTION DATABASE INDEXES
-- Target: 1-5 million orders, 1000-2000 concurrent users
-- 
-- IMPORTANT: Run these during maintenance window
-- Estimated time: 10-30 minutes depending on data size
-- ============================================================

-- ================== ORDERS TABLE ==================

-- Primary lookup indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_staff_id ON orders(staff_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_branch_id ON orders(branch_id);

-- Date-based queries (critical for reports)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_delivered_at ON orders(delivered_at DESC) WHERE delivered_at IS NOT NULL;

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status_created 
  ON orders(status, created_at DESC);
  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_customer_created 
  ON orders(customer_id, created_at DESC) WHERE customer_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_branch_status 
  ON orders(branch_id, status);

-- Full-text search on order code (faster than LIKE)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_code_gin 
  ON orders USING gin(order_code gin_trgm_ops);

-- Packaging status for order processing
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_packaging 
  ON orders(packaging_status) WHERE packaging_status IS NOT NULL;

-- ================== ORDER ITEMS TABLE ==================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Composite for inventory reports
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_product_order 
  ON order_items(product_id, order_id);

-- ================== PRODUCTS TABLE ==================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_sku ON products(sku) WHERE sku IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_barcode ON products(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_type_id ON products(product_type_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_active ON products(is_active) WHERE is_active = true;

-- Full-text search on product name
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_name_gin 
  ON products USING gin(name gin_trgm_ops);

-- Stock queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_stock 
  ON products(stock_quantity) WHERE stock_quantity > 0;

-- ================== INVENTORY TABLE ==================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_product_branch 
  ON inventory(product_id, branch_id);
  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_low_stock 
  ON inventory(quantity) WHERE quantity <= 10;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_available 
  ON inventory(available) WHERE available > 0;

-- ================== CUSTOMERS TABLE ==================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_phone ON customers(phone) WHERE phone IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_email ON customers(email) WHERE email IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_group_id ON customers(customer_group_id);

-- Full-text search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_name_gin 
  ON customers USING gin(name gin_trgm_ops);

-- ================== ORDER RETURNS TABLE ==================

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_returns_order_id ON order_returns(order_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_returns_status ON order_returns(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_returns_created_at ON order_returns(created_at DESC);

-- ================== ENABLE EXTENSIONS ==================

-- Required for gin_trgm_ops (fuzzy search)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- For UUID generation (if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================== TABLE PARTITIONING (for 5M+ orders) ==================

-- Uncomment when you reach 1M+ orders
-- This creates monthly partitions for the orders table

/*
-- Step 1: Create partitioned table
CREATE TABLE orders_partitioned (
  LIKE orders INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Step 2: Create partitions for each month
CREATE TABLE orders_y2024m01 PARTITION OF orders_partitioned
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
  
CREATE TABLE orders_y2024m02 PARTITION OF orders_partitioned
  FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
  
-- ... create more partitions as needed

-- Step 3: Migrate data (during maintenance window)
INSERT INTO orders_partitioned SELECT * FROM orders;

-- Step 4: Swap tables
ALTER TABLE orders RENAME TO orders_old;
ALTER TABLE orders_partitioned RENAME TO orders;

-- Step 5: Create function for auto-partitioning
CREATE OR REPLACE FUNCTION create_orders_partition()
RETURNS void AS $$
DECLARE
  partition_date DATE;
  partition_name TEXT;
  start_date DATE;
  end_date DATE;
BEGIN
  partition_date := DATE_TRUNC('month', NOW() + INTERVAL '1 month');
  partition_name := 'orders_y' || TO_CHAR(partition_date, 'YYYY') || 'm' || TO_CHAR(partition_date, 'MM');
  start_date := partition_date;
  end_date := partition_date + INTERVAL '1 month';
  
  EXECUTE format(
    'CREATE TABLE IF NOT EXISTS %I PARTITION OF orders FOR VALUES FROM (%L) TO (%L)',
    partition_name, start_date, end_date
  );
END;
$$ LANGUAGE plpgsql;

-- Schedule monthly partition creation
-- Run via cron or pg_cron extension
*/

-- ================== ANALYZE TABLES ==================

ANALYZE orders;
ANALYZE order_items;
ANALYZE products;
ANALYZE inventory;
ANALYZE customers;
ANALYZE order_returns;

-- ================== VACUUM (run during low-traffic) ==================

-- VACUUM ANALYZE orders;
-- VACUUM ANALYZE order_items;
