#!/bin/bash

# 🚀 GitHub -> Railway 一键部署脚本
# LifeSkill Emergency Training App

set -e

# 配置参数
PROJECT_NAME="lifeskill-emergency-app"
GITHUB_REPO="your-username/campus-first-aid"
DOMAIN="lifeskill.app"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${PURPLE}[STEP]${NC} $1"; }

print_banner() {
    echo ""
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    🚑 LifeSkill App                          ║"
    echo "║              GitHub -> Railway 一键部署                       ║"
    echo "║                Emergency Training Simulator                   ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# 1. 环境检查
check_environment() {
    log_step "1/8 检查部署环境"
    
    # 检查必要工具
    command -v node >/dev/null 2>&1 || { log_error "请先安装 Node.js"; exit 1; }
    command -v git >/dev/null 2>&1 || { log_error "请先安装 Git"; exit 1; }
    
    # 检查Railway CLI
    if ! command -v railway >/dev/null 2>&1; then
        log_info "安装 Railway CLI..."
        npm install -g @railway/cli
    fi
    
    # 检查gh CLI (可选)
    if ! command -v gh >/dev/null 2>&1; then
        log_warning "建议安装 GitHub CLI: brew install gh"
    fi
    
    log_success "环境检查完成"
}

# 2. GitHub仓库检查
check_github_repo() {
    log_step "2/8 检查GitHub仓库"
    
    # 检查是否在git仓库中
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_info "初始化Git仓库..."
        git init
        git add .
        git commit -m "Initial commit: LifeSkill Emergency Training App"
    fi
    
    # 检查remote origin
    if ! git remote get-url origin >/dev/null 2>&1; then
        log_warning "请添加GitHub远程仓库:"
        echo "git remote add origin https://github.com/$GITHUB_REPO.git"
        read -p "添加完成后按回车继续..." -r
    fi
    
    # 推送到GitHub
    log_info "推送代码到GitHub..."
    git add .
    git commit -m "Prepare for Railway deployment" || echo "没有新的改动"
    git push origin main || git push origin master
    
    log_success "GitHub仓库准备完成"
}

# 3. Railway登录
login_railway() {
    log_step "3/8 登录Railway"
    
    if ! railway status >/dev/null 2>&1; then
        log_info "请登录Railway..."
        railway login
    else
        log_info "Railway已登录"
    fi
    
    log_success "Railway登录完成"
}

# 4. 创建Railway项目
create_railway_project() {
    log_step "4/8 创建Railway项目"
    
    # 检查项目是否已存在
    if railway status >/dev/null 2>&1; then
        log_info "Railway项目已存在，跳过创建"
    else
        log_info "创建新的Railway项目..."
        railway init --name $PROJECT_NAME
    fi
    
    log_success "Railway项目准备完成"
}

# 5. 连接GitHub仓库
connect_github() {
    log_step "5/8 连接GitHub仓库"
    
    # 获取当前Git远程URL
    REPO_URL=$(git remote get-url origin)
    
    log_info "连接GitHub仓库: $REPO_URL"
    log_info "请在Railway控制台中手动连接GitHub仓库"
    log_info "1. 访问 https://railway.app/dashboard"
    log_info "2. 选择项目 '$PROJECT_NAME'"
    log_info "3. 点击 'Connect GitHub Repo'"
    log_info "4. 选择仓库: $GITHUB_REPO"
    
    read -p "GitHub连接完成后按回车继续..." -r
    
    log_success "GitHub连接完成"
}

# 6. 设置环境变量
setup_environment_variables() {
    log_step "6/8 设置环境变量"
    
    log_info "设置Railway环境变量..."
    
    # 基础配置
    railway variables set NODE_ENV=production
    railway variables set JWT_SECRET=$(openssl rand -base64 32)
    railway variables set CORS_ORIGIN=https://$DOMAIN
    railway variables set DB_PATH=./database/app.db
    
    # 管理员密码
    ADMIN_PASSWORD=$(openssl rand -base64 12)
    railway variables set ADMIN_PASSWORD=$ADMIN_PASSWORD
    
    log_success "环境变量设置完成"
    echo "🔐 管理员密码: $ADMIN_PASSWORD (请妥善保存)"
}

# 7. 触发部署
trigger_deployment() {
    log_step "7/8 触发部署"
    
    log_info "推送最新代码触发自动部署..."
    
    # 确保所有文件已提交
    git add .
    git commit -m "Deploy to Railway: $(date)" || echo "没有新的改动"
    git push origin main 2>/dev/null || git push origin master
    
    log_info "等待Railway自动部署..."
    log_info "可以在Railway控制台查看部署进度: https://railway.app/dashboard"
    
    # 等待部署完成
    sleep 90
    
    log_success "部署已触发"
}

# 8. 验证部署
verify_deployment() {
    log_step "8/8 验证部署"
    
    # 获取Railway分配的URL
    log_info "获取应用URL..."
    
    # 尝试获取域名
    RAILWAY_URL=""
    for i in {1..5}; do
        RAILWAY_URL=$(railway domain 2>/dev/null | head -1 || echo "")
        if [ -n "$RAILWAY_URL" ]; then
            break
        fi
        log_info "等待获取域名... ($i/5)"
        sleep 10
    done
    
    if [ -z "$RAILWAY_URL" ]; then
        RAILWAY_URL="https://$PROJECT_NAME.up.railway.app"
        log_warning "使用默认URL: $RAILWAY_URL"
    fi
    
    # 健康检查
    log_info "执行健康检查..."
    sleep 30
    
    for i in {1..10}; do
        if curl -f ${RAILWAY_URL}/api/health >/dev/null 2>&1; then
            log_success "✅ API服务正常响应"
            break
        elif [ $i -eq 10 ]; then
            log_error "❌ API服务检查失败"
            log_info "请检查Railway部署日志: railway logs"
            return 1
        else
            log_info "等待服务启动... ($i/10)"
            sleep 15
        fi
    done
    
    # 检查前端
    if curl -f ${RAILWAY_URL} >/dev/null 2>&1; then
        log_success "✅ 前端服务正常"
    else
        log_warning "⚠️  前端服务可能有问题"
    fi
    
    echo "RAILWAY_URL=$RAILWAY_URL" > .railway-deployment
    log_success "部署验证完成"
}

# 9. 设置自定义域名 (可选)
setup_custom_domain() {
    if [ "$DOMAIN" != "localhost" ] && [ "$DOMAIN" != "lifeskill.app" ]; then
        log_info "设置自定义域名: $DOMAIN"
        
        railway domain add $DOMAIN
        
        log_info "请在DNS提供商处添加以下记录:"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "类型: CNAME"
        echo "名称: $DOMAIN"  
        echo "值: gateway.railway.app"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        
        read -p "DNS配置完成后按回车..." -r
    fi
}

# 10. 部署完成报告
deployment_report() {
    source .railway-deployment 2>/dev/null || RAILWAY_URL="https://$PROJECT_NAME.up.railway.app"
    
    clear
    echo ""
    echo -e "${GREEN}"
    echo "🎉🎉🎉 LifeSkill 部署成功! 🎉🎉🎉"
    echo -e "${NC}"
    echo "════════════════════════════════════════════════════════════════"
    echo "📅 部署时间: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "🌐 应用地址: $RAILWAY_URL"
    echo "🔗 API地址: $RAILWAY_URL/api"
    echo "📊 健康检查: $RAILWAY_URL/api/health"
    echo "🛠️  Railway控制台: https://railway.app/dashboard"
    echo ""
    echo "🎯 测试账户:"
    echo "  👤 普通用户: demo / demo123"
    echo "  🔧 管理员: admin / admin123"
    echo ""
    echo "📋 管理命令:"
    echo "  查看状态: railway status"
    echo "  查看日志: railway logs"
    echo "  重新部署: git push origin main"
    echo "  开启shell: railway shell"
    echo "  环境变量: railway variables"
    echo ""
    echo "💰 成本信息:"
    echo "  📦 Railway: \$5/月 (512MB内存)"
    echo "  🌐 自定义域名: 免费"
    echo "  🔒 SSL证书: 免费自动配置"
    echo "  📊 监控日志: 包含"
    echo "  💾 数据库存储: 1GB (包含)"
    echo ""
    echo "🚀 下次部署:"
    echo "  只需要 git push，Railway会自动重新部署！"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo -e "${GREEN}🎊 恭喜！你的急救训练应用已成功部署上线！${NC}"
    echo ""
}

# 主函数
main() {
    print_banner
    
    log_info "开始 GitHub -> Railway 一键部署流程"
    echo ""
    
    check_environment
    check_github_repo  
    login_railway
    create_railway_project
    connect_github
    setup_environment_variables
    trigger_deployment
    verify_deployment
    setup_custom_domain
    deployment_report
    
    log_success "🎉 一键部署流程全部完成!"
}

# 错误处理
trap 'log_error "部署过程中发生错误，请检查上方日志"; exit 1' ERR

# 检查参数
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "使用方法:"
    echo "  $0                    # 使用默认配置部署"
    echo "  $0 your-domain.com    # 指定自定义域名"
    echo ""
    echo "环境要求:"
    echo "  - Node.js 18+"
    echo "  - Git"
    echo "  - Railway CLI"
    echo ""
    echo "部署步骤:"
    echo "  1. 将代码推送到GitHub"
    echo "  2. 连接GitHub到Railway"
    echo "  3. 自动构建和部署Docker容器"
    echo "  4. 配置环境变量和域名"
    echo "  5. 验证服务健康状态"
    exit 0
fi

# 设置自定义域名
if [ -n "$1" ]; then
    DOMAIN="$1"
    log_info "使用自定义域名: $DOMAIN"
fi

# 运行部署
main