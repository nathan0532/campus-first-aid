#!/bin/bash

echo "启动青少年CERT模拟训练系统开发环境..."

# 检查是否安装了 Node.js
if ! command -v node &> /dev/null; then
    echo "错误: 未找到 Node.js，请先安装 Node.js"
    exit 1
fi

# 检查是否安装了 npm
if ! command -v npm &> /dev/null; then
    echo "错误: 未找到 npm，请先安装 npm"
    exit 1
fi

# 安装后端依赖
echo "安装后端依赖..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
fi

# 启动后端服务（后台运行）
echo "启动后端服务..."
npm run dev &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 安装前端依赖
echo "安装前端依赖..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    npm install
fi

# 启动前端服务
echo "启动前端服务..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "====================================="
echo "系统启动完成!"
echo "前端地址: http://localhost:3000"
echo "后端地址: http://localhost:5000"
echo "管理后台: http://localhost:3000/admin"
echo ""
echo "演示账号:"
echo "=== 学生测试账号 ==="
echo "原始学生账号: demo / demo123"
echo "新学生账号: student1 / student123"
echo "新学生账号: student2 / student123"
echo "新学生账号: student3 / student123"
echo "学生账号: alex / alex123"
echo "学生账号: emily / emily123"
echo "学生账号: mike / mike123"
echo "学生账号: sarah / sarah123"
echo "=== 管理员账号 ==="
echo "管理员账号: admin / admin123"
echo ""
echo "按 Ctrl+C 停止服务"
echo "====================================="

# 等待用户中断
wait $FRONTEND_PID $BACKEND_PID