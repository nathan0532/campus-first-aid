#!/bin/bash

# 🚀 LifeSkill.app - Vercel + Railway 一键部署脚本
# 使用方法: ./vercel-railway-deploy.sh

set -e

# 配置参数
PROJECT_NAME="lifeskill"
DOMAIN="lifeskill.app"
VERCEL_PROJECT="lifeskill-frontend"
RAILWAY_PROJECT="lifeskill-backend"

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
    
    # 检查必要工具
    command -v node >/dev/null 2>&1 || { log_error "Node.js未安装"; exit 1; }
    command -v npm >/dev/null 2>&1 || { log_error "npm未安装"; exit 1; }
    command -v vercel >/dev/null 2>&1 || { 
        log_info "安装Vercel CLI..."
        npm install -g vercel
    }
    command -v railway >/dev/null 2>&1 || { 
        log_info "安装Railway CLI..."
        npm install -g @railway/cli
    }
    
    log_success "环境检查通过"
}

# 2. 登录验证
login_services() {
    log_info "登录云服务..."
    
    # Vercel登录
    if ! vercel --version >/dev/null 2>&1; then
        log_info "请登录Vercel..."
        vercel login
    fi
    
    # Railway登录
    if ! railway status >/dev/null 2>&1; then
        log_info "请登录Railway..."
        railway login
    fi
    
    log_success "服务登录完成"
}

# 3. 准备前端部署
prepare_frontend() {
    log_info "准备前端部署..."
    
    cd frontend
    
    # 安装依赖
    log_info "安装前端依赖..."
    npm install
    
    # 创建环境变量文件
    cat > .env.production << EOF
NODE_ENV=production
VITE_API_URL=https://${RAILWAY_PROJECT}.up.railway.app/api
VITE_APP_NAME=LifeSkill Emergency Training
VITE_CDN_URL=https://${DOMAIN}
EOF
    
    # 构建测试
    log_info "构建前端..."
    npm run build
    
    cd ..
    log_success "前端准备完成"
}

# 4. 部署后端到Railway
deploy_backend() {
    log_info "部署后端到Railway..."
    
    # 创建Railway项目
    if ! railway status >/dev/null 2>&1; then
        log_info "创建Railway项目..."
        railway init --name $RAILWAY_PROJECT
    fi
    
    # 设置环境变量
    log_info "设置后端环境变量..."
    railway variables set NODE_ENV=production
    railway variables set JWT_SECRET=$(openssl rand -base64 32)
    railway variables set CORS_ORIGIN=https://$DOMAIN
    railway variables set DB_PATH=./database/app.db
    
    # 复制Railway配置
    cp deploy/railway/* backend/ 2>/dev/null || true
    
    # 部署
    log_info "推送代码到Railway..."
    railway up --detach
    
    # 等待部署完成
    log_info "等待后端部署完成..."
    sleep 60
    
    # 获取后端URL
    BACKEND_URL=$(railway domain | grep -o 'https://[^[:space:]]*')
    if [ -z "$BACKEND_URL" ]; then
        BACKEND_URL="https://${RAILWAY_PROJECT}.up.railway.app"
    fi
    
    log_success "后端部署完成: $BACKEND_URL"
    echo "BACKEND_URL=$BACKEND_URL" > .env.backend
}

# 5. 部署前端到Vercel
deploy_frontend() {
    log_info "部署前端到Vercel..."
    
    # 读取后端URL
    source .env.backend
    
    # 更新前端环境变量
    cd frontend
    cat > .env.production << EOF
NODE_ENV=production
VITE_API_URL=${BACKEND_URL}/api
VITE_APP_NAME=LifeSkill Emergency Training
VITE_CDN_URL=https://${DOMAIN}
EOF
    
    # 复制Vercel配置
    cp ../deploy/vercel/vercel.json ./
    
    # 更新vercel.json中的后端URL
    sed -i.bak "s|https://lifeskill-backend.up.railway.app|$BACKEND_URL|g" vercel.json
    
    # 部署到Vercel
    log_info "推送前端到Vercel..."
    vercel --prod --confirm
    
    cd ..
    log_success "前端部署完成"
}

# 6. 配置自定义域名
setup_custom_domain() {
    log_info "配置自定义域名..."
    
    # Vercel域名配置
    if [ "$DOMAIN" != "localhost" ]; then
        vercel domains add $DOMAIN --cwd frontend
        vercel domains add www.$DOMAIN --cwd frontend
        
        log_info "请在DNS提供商处添加以下记录:"
        echo "类型: CNAME"
        echo "名称: $DOMAIN"
        echo "值: cname.vercel-dns.com"
        echo ""
        echo "类型: CNAME" 
        echo "名称: www.$DOMAIN"
        echo "值: cname.vercel-dns.com"
        
        read -p "DNS配置完成后按回车继续..." -r
    fi
    
    log_success "域名配置完成"
}

# 7. 健康检查
health_check() {
    log_info "执行健康检查..."
    
    # 读取后端URL
    source .env.backend
    
    # 等待服务启动
    sleep 30
    
    # 检查后端服务
    if curl -f ${BACKEND_URL}/api/health >/dev/null 2>&1; then
        log_success "后端服务正常"
    else
        log_error "后端服务异常"
        railway logs --tail 50
        return 1
    fi
    
    # 检查前端服务
    if curl -f https://$DOMAIN >/dev/null 2>&1; then
        log_success "前端服务正常"
    else
        log_warning "前端服务可能还在部署中，请稍后检查"
    fi
    
    log_success "健康检查完成"
}

# 8. 设置CI/CD
setup_cicd() {
    log_info "设置CI/CD自动部署..."
    
    # GitHub Actions配置
    mkdir -p .github/workflows
    cat > .github/workflows/deploy.yml << 'EOF'
name: 部署到Vercel和Railway

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: 部署到Railway
      run: |
        npm install -g @railway/cli
        railway login --token ${{ secrets.RAILWAY_TOKEN }}
        railway up --detach
      working-directory: ./backend

  deploy-frontend:
    needs: deploy-backend
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: 设置Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    - name: 部署到Vercel
      run: |
        npm install -g vercel
        cd frontend
        npm install
        vercel --prod --token ${{ secrets.VERCEL_TOKEN }} --confirm
EOF
    
    log_info "请在GitHub仓库的Secrets中添加:"
    echo "VERCEL_TOKEN: $(vercel token create)"
    echo "RAILWAY_TOKEN: $(railway token)"
    
    log_success "CI/CD配置完成"
}

# 9. 监控设置
setup_monitoring() {
    log_info "设置监控服务..."
    
    # 创建监控脚本
    cat > monitor.sh << 'EOF'
#!/bin/bash
# 简单的服务监控脚本

check_service() {
    local url=$1
    local name=$2
    
    if curl -f "$url" >/dev/null 2>&1; then
        echo "✅ $name 正常"
    else
        echo "❌ $name 异常"
        # 发送通知 (可接入钉钉、企业微信等)
    fi
}

echo "📊 $(date) - 服务状态检查"
check_service "https://lifeskill.app" "前端服务"
check_service "https://lifeskill-backend.up.railway.app/api/health" "后端服务"
EOF
    
    chmod +x monitor.sh
    
    log_success "监控脚本创建完成"
}

# 10. 部署报告
deployment_report() {
    source .env.backend 2>/dev/null || BACKEND_URL="https://${RAILWAY_PROJECT}.up.railway.app"
    
    echo ""
    echo "🎉 Vercel + Railway 部署完成报告"
    echo "════════════════════════════════════════"
    echo "📅 部署时间: $(date)"
    echo "🌐 前端地址: https://$DOMAIN"
    echo "🔗 后端地址: $BACKEND_URL"
    echo "📊 健康检查: $BACKEND_URL/api/health"
    echo ""
    echo "🛠️  管理控制台:"
    echo "  Vercel控制台: https://vercel.com/dashboard"
    echo "  Railway控制台: https://railway.app/dashboard"
    echo ""
    echo "📋 常用命令:"
    echo "  查看前端日志: vercel logs --cwd frontend"
    echo "  查看后端日志: railway logs"
    echo "  重新部署前端: vercel --prod --cwd frontend"
    echo "  重新部署后端: railway up --detach"
    echo "  监控服务状态: ./monitor.sh"
    echo ""
    echo "💰 成本预估:"
    echo "  Vercel: 免费额度 (100GB带宽/月)"
    echo "  Railway: $5/月 (512MB内存, 1GB磁盘)"
    echo "  总计: ~$5/月 (约¥35/月)"
    echo "════════════════════════════════════════"
}

# 主部署流程
main() {
    log_info "开始 Vercel + Railway 部署流程"
    
    check_environment
    login_services
    prepare_frontend
    deploy_backend
    deploy_frontend
    setup_custom_domain
    health_check
    setup_cicd
    setup_monitoring
    deployment_report
    
    log_success "🎉 部署流程全部完成!"
}

# 错误处理
trap 'log_error "部署过程中发生错误"; exit 1' ERR

# 运行主函数
main "$@"