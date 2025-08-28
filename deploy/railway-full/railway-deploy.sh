#!/bin/bash

# 🚀 LifeSkill.app - Railway 一体化Docker部署脚本
# Railway支持Docker，简单高效，成本低廉

set -e

PROJECT_NAME="lifeskill"
DOMAIN="lifeskill.app"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 1. 环境检查
check_environment() {
    log_info "检查部署环境..."
    
    command -v node >/dev/null 2>&1 || { log_error "Node.js未安装"; exit 1; }
    command -v railway >/dev/null 2>&1 || { 
        log_info "安装Railway CLI..."
        npm install -g @railway/cli
    }
    
    log_success "环境检查通过"
}

# 2. 创建单体Docker配置
create_unified_dockerfile() {
    log_info "创建一体化Docker配置..."
    
    cat > Dockerfile << 'EOF'
# 多阶段构建 - 前端
FROM node:18-alpine as frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# 多阶段构建 - 后端
FROM node:18-alpine as backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ ./

# 生产环境 - 合并前后端
FROM node:18-alpine
WORKDIR /usr/src/app

# 安装系统依赖
RUN apk add --no-cache \
    sqlite \
    curl \
    nginx \
    && rm -rf /var/cache/apk/*

# 复制后端代码
COPY --from=backend-builder /app/backend ./
COPY deploy/init-production-db.js ./

# 复制前端构建产物
COPY --from=frontend-builder /app/frontend/dist ./public

# 创建nginx配置
RUN mkdir -p /etc/nginx/http.d
COPY deploy/railway-full/nginx.conf /etc/nginx/http.d/default.conf

# 创建启动脚本
COPY deploy/railway-full/start-unified.sh ./start.sh
RUN chmod +x start.sh

# 创建必要目录
RUN mkdir -p database logs uploads

# 设置权限
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /usr/src/app

USER nodejs

# 暴露端口
EXPOSE $PORT

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:$PORT/health || exit 1

CMD ["./start.sh"]
EOF

    log_success "Docker配置创建完成"
}

# 3. 创建统一启动脚本
create_start_script() {
    log_info "创建启动脚本..."
    
    mkdir -p deploy/railway-full
    
    cat > deploy/railway-full/start-unified.sh << 'EOF'
#!/bin/sh

echo "🚀 启动LifeSkill一体化服务..."

# 设置环境变量
export PORT=${PORT:-3000}

# 初始化数据库
if [ ! -f "./database/app.db" ]; then
    echo "📄 初始化数据库..."
    node init-production-db.js
fi

# 启动Nginx (前端静态文件服务)
echo "🌐 启动前端服务..."
nginx &

# 启动Node.js后端
echo "⚡ 启动后端API服务..."
exec node simple-server.js
EOF
    
    # Nginx配置文件
    cat > deploy/railway-full/nginx.conf << 'EOF'
server {
    listen 8080;
    server_name localhost;
    root /usr/src/app/public;
    index index.html;

    # 前端路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api/ {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
    
    chmod +x deploy/railway-full/start-unified.sh
    
    log_success "启动脚本创建完成"
}

# 4. Railway部署
deploy_to_railway() {
    log_info "部署到Railway..."
    
    # 登录Railway
    if ! railway status >/dev/null 2>&1; then
        log_info "请登录Railway..."
        railway login
    fi
    
    # 创建项目
    railway init --name $PROJECT_NAME
    
    # 设置环境变量
    log_info "设置环境变量..."
    railway variables set NODE_ENV=production
    railway variables set JWT_SECRET=$(openssl rand -base64 32)
    railway variables set CORS_ORIGIN=https://$DOMAIN
    railway variables set DB_PATH=./database/app.db
    
    # 部署
    log_info "开始部署..."
    railway up --detach
    
    # 获取分配的URL
    sleep 30
    RAILWAY_URL=$(railway status --json | jq -r '.deployments[0].url' 2>/dev/null || echo "https://$PROJECT_NAME.up.railway.app")
    
    log_success "Railway部署完成: $RAILWAY_URL"
    echo "RAILWAY_URL=$RAILWAY_URL" > .env.railway
}

# 5. 配置自定义域名
setup_domain() {
    log_info "配置自定义域名..."
    
    if [ "$DOMAIN" != "localhost" ]; then
        railway domain $DOMAIN
        
        log_info "请在DNS提供商处添加以下CNAME记录:"
        echo "类型: CNAME"
        echo "名称: $DOMAIN"
        echo "值: gateway.railway.app"
        
        read -p "DNS配置完成后按回车继续..." -r
    fi
    
    log_success "域名配置完成"
}

# 6. 健康检查
health_check() {
    log_info "执行健康检查..."
    
    source .env.railway
    
    # 等待服务完全启动
    sleep 60
    
    # 检查健康状态
    if curl -f ${RAILWAY_URL}/api/health >/dev/null 2>&1; then
        log_success "API服务正常"
    else
        log_error "API服务异常"
        railway logs --tail 50
        return 1
    fi
    
    # 检查前端
    if curl -f ${RAILWAY_URL} >/dev/null 2>&1; then
        log_success "前端服务正常" 
    else
        log_error "前端服务异常"
        return 1
    fi
    
    log_success "健康检查通过"
}

# 7. 部署报告
deployment_report() {
    source .env.railway 2>/dev/null || RAILWAY_URL="https://$PROJECT_NAME.up.railway.app"
    
    echo ""
    echo "🎉 Railway一体化部署完成报告"
    echo "════════════════════════════════════════"
    echo "📅 部署时间: $(date)"
    echo "🌐 网站地址: $RAILWAY_URL"
    echo "🔗 API地址: $RAILWAY_URL/api"
    echo "📊 健康检查: $RAILWAY_URL/api/health"
    echo "🛠️  Railway控制台: https://railway.app/dashboard"
    echo ""
    echo "📋 管理命令:"
    echo "  查看服务状态: railway status"
    echo "  查看日志: railway logs"
    echo "  重新部署: railway up --detach"
    echo "  开启shell: railway shell"
    echo "  查看变量: railway variables"
    echo ""
    echo "💰 成本预估:"
    echo "  Railway: $5/月起 (512MB内存)"
    echo "  自定义域名: 免费"
    echo "  SSL证书: 免费自动配置"
    echo "  CDN加速: 包含"
    echo "  总计: $5/月 (约¥35/月)"
    echo ""
    echo "🔧 特色优势:"
    echo "  ✅ 一键Docker部署"
    echo "  ✅ 自动SSL证书"
    echo "  ✅ 自动扩容"
    echo "  ✅ 内置监控"
    echo "  ✅ GitHub自动部署"
    echo "════════════════════════════════════════"
}

# 主部署流程
main() {
    log_info "开始Railway一体化Docker部署"
    
    check_environment
    create_unified_dockerfile
    create_start_script
    deploy_to_railway
    setup_domain
    health_check
    deployment_report
    
    log_success "🎉 Railway部署流程完成!"
}

# 错误处理
trap 'log_error "部署过程中发生错误"; exit 1' ERR

# 运行主函数
main "$@"