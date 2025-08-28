#!/bin/bash

# 简化版启动脚本 - 避免TypeScript问题
echo "🚀 启动 CERT Simulator For Teens (简化版)..."

# 清理旧进程
pkill -9 -f "node.*simple-server" || true
pkill -9 -f "npm.*dev" || true  
pkill -9 -f "nodemon" || true
pkill -9 -f "vite" || true
sleep 2

# 启动后端 (JavaScript版本)
echo "📡 启动后端服务器..."
cd /Volumes/MySSD/Project_Vincent/campus-first-aid/backend
nohup node simple-server.js > /dev/null 2>&1 &
echo "   后端启动中..."

# 启动前端
echo "🎨 启动前端服务器..."  
cd /Volumes/MySSD/Project_Vincent/campus-first-aid/frontend
nohup npm run dev > /dev/null 2>&1 &
echo "   前端启动中..."

# 等待服务启动
sleep 5

echo ""
echo "🎉 启动完成!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 前端地址: http://localhost:3000"
echo "🔧 后端地址: http://localhost:5001" 
echo ""
echo "🔐 测试账号: demo / demo123"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"