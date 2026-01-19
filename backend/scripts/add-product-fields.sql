-- Add missing columns to products table
-- Run: psql -U postgres -d cosmetic_db -f scripts/add-product-fields.sql

ALTER TABLE products
ADD COLUMN IF NOT EXISTS "expiryWarningDays" INT,
ADD COLUMN IF NOT EXISTS "warrantyEnabled" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "warrantyPolicy" TEXT;

-- Update existing records to set defaults
UPDATE products 
SET "warrantyEnabled" = false 
WHERE "warrantyEnabled" IS NULL;

SELECT 'Migration completed successfully!' as status;
