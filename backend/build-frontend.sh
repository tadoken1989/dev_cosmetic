#!/bin/bash

# Script build frontend và copy vào backend/dist
# Chạy từ thư mục root của project

set -e

# Màu sắc
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Đường dẫn
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="${ROOT_DIR}/frontend"
BACKEND_DIST="${ROOT_DIR}/backend/dist"

echo "=========================================="
echo "BUILD FRONTEND VÀ COPY VÀO BACKEND/DIST"
echo "=========================================="
echo ""

echo "Root directory: $ROOT_DIR"
echo "Frontend directory: $FRONTEND_DIR"
echo "Backend dist directory: $BACKEND_DIST"
echo ""

# Kiểm tra frontend directory
if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}✗ Không tìm thấy frontend directory${NC}"
    exit 1
fi

# Kiểm tra package.json
if [ ! -f "${FRONTEND_DIR}/package.json" ]; then
    echo -e "${RED}✗ Không tìm thấy frontend/package.json${NC}"
    exit 1
fi

# Tạo thư mục backend/dist nếu chưa có
mkdir -p "$BACKEND_DIST"

echo "Bước 1: Build frontend..."
cd "$FRONTEND_DIR"

# Cài đặt dependencies nếu chưa có node_modules
if [ ! -d "node_modules" ]; then
    echo "   Cài đặt dependencies..."
    npm install
fi

# Build frontend
echo "   Đang build frontend..."
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}✗ Build frontend thất bại - không tìm thấy dist/${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build frontend thành công${NC}"
echo ""

echo "Bước 2: Copy frontend build vào backend/dist..."
# Xóa nội dung cũ trong backend/dist
rm -rf "${BACKEND_DIST}"/*

# Copy tất cả từ frontend/dist vào backend/dist
cp -r "${FRONTEND_DIR}/dist"/* "$BACKEND_DIST/"

echo -e "${GREEN}✓ Đã copy frontend build vào backend/dist${NC}"
echo ""

echo "Bước 3: Kiểm tra files..."
if [ -f "${BACKEND_DIST}/index.html" ]; then
    echo -e "${GREEN}✓ index.html có trong backend/dist${NC}"
else
    echo -e "${RED}✗ index.html KHÔNG có trong backend/dist${NC}"
    exit 1
fi

if [ -d "${BACKEND_DIST}/assets" ]; then
    ASSET_COUNT=$(find "${BACKEND_DIST}/assets" -type f | wc -l)
    echo -e "${GREEN}✓ assets/ có trong backend/dist ($ASSET_COUNT files)${NC}"
else
    echo -e "${YELLOW}⚠ assets/ không có trong backend/dist${NC}"
fi
echo ""

echo "=========================================="
echo -e "${GREEN}HOÀN TẤT!${NC}"
echo "=========================================="
echo ""
echo "Frontend đã được build và copy vào backend/dist/"
echo "Backend sẽ tự động serve frontend từ thư mục này"
echo ""
echo "Bước tiếp theo:"
echo "  1. Build backend: cd backend && npm run build"
echo "  2. Start backend: npm run start:prod"
echo ""

