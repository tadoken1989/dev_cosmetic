#!/bin/bash

# Script tạo file .env trực tiếp (không cần .env.example)

echo "📝 Đang tạo file .env..."

# Tạo JWT Secret random
JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || echo "CHANGE-THIS-TO-RANDOM-STRING-MIN-32-CHARACTERS")

# Tạo file .env
cat > .env <<EOF
# ============================================
# APPLICATION CONFIGURATION
# ============================================
NODE_ENV=production
PORT=3000
API_PREFIX=api/v1

# ============================================
# DATABASE CONFIGURATION
# ⚠️ THAY ĐỔI DB_PASSWORD THÀNH MẬT KHẨU POSTGRESQL CỦA BẠN!
# ============================================
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password_here
DB_NAME=cosmetic_db

# ============================================
# JWT CONFIGURATION
# ⚠️ JWT_SECRET đã được tạo random, nhưng bạn có thể đổi
# ============================================
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=24h

# ============================================
# FRONTEND URL
# ============================================
FRONTEND_URL=https://dev.giatlacapy.vn

# ============================================
# LOGGING
# ============================================
LOG_LEVEL=info
EOF

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ File .env đã được tạo!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  VUI LÒNG CHỈNH SỬA CÁC THÔNG TIN SAU:"
echo ""
echo "1. DB_PASSWORD - Mật khẩu PostgreSQL của bạn"
echo "   (Nếu chưa có, chạy: sudo -u postgres psql -c \"ALTER USER postgres WITH PASSWORD 'your_password';\")"
echo ""
echo "2. JWT_SECRET - Đã được tạo random: $JWT_SECRET"
echo "   (Bạn có thể giữ nguyên hoặc đổi)"
echo ""
echo "3. FRONTEND_URL - URL frontend của bạn"
echo ""
echo "Chỉnh sửa: nano .env"
echo ""

