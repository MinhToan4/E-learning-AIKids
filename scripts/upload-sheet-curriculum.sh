#!/bin/bash
set -e

BACKEND_DIR="/Users/imam/storymee/2-MCP-Core/core-lms-api"
echo "=================================================="
echo "🚀 Bắt đầu nạp Giáo trình Mười Quy Tắc lên Backend"
echo "=================================================="

cd "$BACKEND_DIR"
export PATH="/opt/homebrew/bin:$PATH"

npm run import:aiki-rules -- --publish

echo "=================================================="
echo "✅ Đã nạp và công khai (published) thành công!"
echo "👉 Kiểm tra Vùng học tại: http://localhost:5173"
echo "=================================================="
