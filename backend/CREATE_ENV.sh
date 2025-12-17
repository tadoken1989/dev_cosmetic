#!/bin/bash

# Script tạo file .env tự động với các giá trị mặc định

echo "📝 Đang tạo file .env..."

# Tạo file .env từ .env.example
if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "✅ Đã tạo file .env từ .env.example"
else
    echo "❌ Không tìm thấy file .env.example"
    exit 1
fi

# Tạo JWT Secret random
JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" 2>/dev/null || echo "CHANGE-THIS-TO-RANDOM-STRING-MIN-32-CHARACTERS")

# Cập nhật JWT_SECRET
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
else
    # Linux
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ File .env đã được tạo!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  VUI LÒNG CHỈNH SỬA CÁC THÔNG TIN SAU:"
echo ""
echo "1. DB_PASSWORD - Mật khẩu PostgreSQL của bạn"
echo "2. JWT_SECRET - Đã được tạo random, nhưng bạn có thể đổi"
echo "3. FRONTEND_URL - URL frontend của bạn"
echo ""
echo "Chỉnh sửa: nano .env"
echo ""

