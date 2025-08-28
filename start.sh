#!/bin/bash

# CERT Simulator For Teens - 快速启动脚本
echo "🚀 启动 CERT Simulator For Teens..."

# 检查并创建日志目录
mkdir -p logs

# 停止可能存在的旧进程
echo "🔄 清理旧进程..."
pkill -f "node.*simple-server" || true
pkill -f "nodemon" || true
pkill -f "ts-node" || true
pkill -f "vite" || true
sleep 3

# 启动后端服务器
echo "📡 启动后端服务器..."
cd backend
nohup node simple-server.js > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "   后端PID: $BACKEND_PID"
cd ..

# 等待后端启动
echo "⏳ 等待后端服务启动..."
sleep 3

# 检查后端是否启动成功
if curl -s http://localhost:5001/api/health > /dev/null; then
    echo "✅ 后端服务启动成功"
else
    echo "❌ 后端服务启动失败"
    exit 1
fi

# 启动前端服务器
echo "🎨 启动前端服务器..."
cd frontend
nohup npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   前端PID: $FRONTEND_PID"
cd ..

# 等待前端启动
echo "⏳ 等待前端服务启动..."
sleep 5

echo ""
echo "🎉 启动完成!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 前端地址: http://localhost:3000"
echo "🔧 后端地址: http://localhost:5001"
echo "📊 健康检查: http://localhost:5001/api/health"
echo ""
echo "🔐 测试账号:"
echo "   学生账号: demo / demo123"
echo "   学生账号: student1 / student123"
echo "   管理员:   admin / admin123"
echo ""
echo "📝 日志文件:"
echo "   后端日志: logs/backend.log"
echo "   前端日志: logs/frontend.log"
echo ""
echo "⏹️  停止服务: ./stop.sh"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"