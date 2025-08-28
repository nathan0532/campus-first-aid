#!/bin/bash

# CERT Simulator For Teens - 停止脚本
echo "🛑 停止 CERT Simulator For Teens..."

# 停止所有相关进程
echo "🔄 停止后端服务器..."
pkill -f "node.*simple-server" && echo "   ✅ 后端已停止" || echo "   ℹ️  后端未运行"

echo "🔄 停止TypeScript进程..."
pkill -f "nodemon" && echo "   ✅ nodemon已停止" || echo "   ℹ️  nodemon未运行"
pkill -f "ts-node" && echo "   ✅ ts-node已停止" || echo "   ℹ️  ts-node未运行"

echo "🔄 停止前端服务器..."
pkill -f "vite" && echo "   ✅ 前端已停止" || echo "   ℹ️  前端未运行"

echo ""
echo "✅ 所有服务已停止"