#!/bin/bash

# Excel Import Script
# Usage: bash scripts/import-from-excel.sh

set -e  # Exit on error

echo "========================================"
echo "🚀 Excel Import Tool"
echo "========================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Paths
EXCEL_DIR="/home/admin/domains/dev.giatlacapy.vn/public_html"
PRODUCTS_FILE="$EXCEL_DIR/products.xlsx"
INVENTORY_FILE="$EXCEL_DIR/inventory.xlsx"
BACKEND_DIR="/home/admin/domains/dev.giatlacapy.vn/public_html/backend"

echo ""
echo "📂 Checking files..."

# Check if products.xlsx exists
if [ ! -f "$PRODUCTS_FILE" ]; then
    echo -e "${RED}❌ File not found: $PRODUCTS_FILE${NC}"
    echo "   Please upload products.xlsx to $EXCEL_DIR"
    exit 1
fi
echo -e "${GREEN}✅ Found: products.xlsx${NC}"

# Check if inventory.xlsx exists
if [ ! -f "$INVENTORY_FILE" ]; then
    echo -e "${RED}❌ File not found: $INVENTORY_FILE${NC}"
    echo "   Please upload inventory.xlsx to $EXCEL_DIR"
    exit 1
fi
echo -e "${GREEN}✅ Found: inventory.xlsx${NC}"

# Change to backend directory
cd "$BACKEND_DIR"

echo ""
echo "📦 Installing dependencies..."
npm install --silent

echo ""
echo "🔨 Building backend..."
npm run build

echo ""
echo "🗄️  Ensuring database schema..."
psql -U postgres -d cosmetic_db -f scripts/add-product-fields.sql

echo ""
echo "📊 Running import..."
npm run import:excel

echo ""
echo "========================================"
echo -e "${GREEN}🎉 Import completed successfully!${NC}"
echo "========================================"
echo ""
echo "Next steps:"
echo "  1. Restart backend: pm2 restart all"
echo "  2. Check logs: pm2 logs"
echo ""
