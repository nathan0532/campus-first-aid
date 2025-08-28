#!/bin/sh

# Railway启动脚本
echo "🚀 正在启动LifeSkill后端服务..."

# 设置默认端口
export PORT=${PORT:-5001}

# 检查数据库是否存在，不存在则初始化
if [ ! -f "./database/app.db" ]; then
    echo "📄 初始化数据库..."
    node init-production-db.js
fi

# 数据库权限检查
if [ ! -w "./database/app.db" ]; then
    echo "⚠️  数据库文件权限问题，尝试修复..."
    chmod 664 ./database/app.db 2>/dev/null || true
fi

# 启动服务
echo "✅ 数据库准备就绪"
echo "🌐 服务将在端口 $PORT 启动"
echo "🔗 健康检查端点: http://localhost:$PORT/api/health"

exec node simple-server.js