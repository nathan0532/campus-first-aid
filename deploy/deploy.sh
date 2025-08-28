#!/bin/bash

# 🚀 CERT 急救训练模拟器 - 自动化部署脚本
# 使用方法: ./deploy.sh [环境] [域名]
# 示例: ./deploy.sh production cert-simulator.com

set -e

# 配置参数
ENVIRONMENT=${1:-production}
DOMAIN=${2:-localhost}
PROJECT_NAME="cert-simulator"
DEPLOY_PATH="/var/www/$PROJECT_NAME"
BACKUP_PATH="/var/backups/$PROJECT_NAME"

echo "🚀 开始部署 $PROJECT_NAME..."
echo "📍 环境: $ENVIRONMENT"
echo "🌐 域名: $DOMAIN"
echo "📁 部署路径: $DEPLOY_PATH"

# 颜色输出函数
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. 环境检查
check_environment() {
    log_info "检查部署环境..."
    
    # 检查必要软件
    command -v node >/dev/null 2>&1 || { log_error "Node.js 未安装"; exit 1; }
    command -v npm >/dev/null 2>&1 || { log_error "npm 未安装"; exit 1; }
    command -v nginx >/dev/null 2>&1 || { log_error "Nginx 未安装"; exit 1; }
    command -v pm2 >/dev/null 2>&1 || { log_error "PM2 未安装"; exit 1; }
    
    # 检查权限
    if [ "$EUID" -ne 0 ]; then
        log_warning "建议使用 sudo 运行此脚本以确保所有权限"
    fi
    
    log_success "环境检查通过"
}

# 2. 创建部署目录
setup_directories() {
    log_info "创建部署目录结构..."
    
    sudo mkdir -p $DEPLOY_PATH/{frontend,backend,logs,uploads}
    sudo mkdir -p $BACKUP_PATH
    sudo mkdir -p /var/log/pm2
    
    # 设置权限
    sudo chown -R $USER:$USER $DEPLOY_PATH
    sudo chmod -R 755 $DEPLOY_PATH
    
    log_success "目录结构创建完成"
}

# 3. 备份现有版本
backup_current() {
    if [ -d "$DEPLOY_PATH" ]; then
        log_info "备份当前版本..."
        
        BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
        sudo cp -r $DEPLOY_PATH $BACKUP_PATH/$BACKUP_NAME
        
        log_success "备份完成: $BACKUP_PATH/$BACKUP_NAME"
    fi
}

# 4. 部署前端
deploy_frontend() {
    log_info "部署前端应用..."
    
    cd frontend
    
    # 安装依赖
    log_info "安装前端依赖..."
    npm install
    
    # 设置环境变量
    export VITE_API_URL="https://$DOMAIN/api"
    export VITE_APP_ENV="$ENVIRONMENT"
    
    # 构建生产版本
    log_info "构建前端..."
    npm run build
    
    # 复制到部署目录
    sudo cp -r dist/* $DEPLOY_PATH/frontend/
    
    log_success "前端部署完成"
}

# 5. 部署后端
deploy_backend() {
    log_info "部署后端应用..."
    
    cd backend
    
    # 安装生产依赖
    log_info "安装后端依赖..."
    npm install --production
    
    # 复制文件到部署目录
    sudo cp -r . $DEPLOY_PATH/backend/
    
    # 创建环境配置
    log_info "创建生产环境配置..."
    sudo tee $DEPLOY_PATH/backend/.env > /dev/null <<EOF
NODE_ENV=production
PORT=5001
JWT_SECRET=$(openssl rand -base64 32)
DB_PATH=./database/app.db
CORS_ORIGIN=https://$DOMAIN
LOG_LEVEL=info
ADMIN_PASSWORD=Admin123!@#
EOF
    
    log_success "后端部署完成"
}

# 6. 初始化数据库
setup_database() {
    log_info "初始化生产数据库..."
    
    cd $DEPLOY_PATH/backend
    
    # 创建数据库目录
    sudo mkdir -p database
    
    # 运行数据库初始化脚本
    node /var/www/cert-simulator/deploy/init-production-db.js
    
    # 设置数据库权限
    sudo chown -R $USER:$USER database/
    sudo chmod 644 database/app.db
    
    log_success "数据库初始化完成"
}

# 7. 配置并启动服务
start_services() {
    log_info "配置并启动服务..."
    
    # 复制PM2配置
    sudo cp /var/www/cert-simulator/deploy/ecosystem.config.js $DEPLOY_PATH/backend/
    
    # 启动PM2应用
    cd $DEPLOY_PATH/backend
    pm2 delete cert-simulator-backend 2>/dev/null || true
    pm2 start ecosystem.config.js --env production
    pm2 save
    
    # 配置Nginx
    log_info "配置Nginx..."
    sudo cp /var/www/cert-simulator/deploy/nginx.conf /etc/nginx/sites-available/$PROJECT_NAME
    
    # 替换域名占位符
    sudo sed -i "s/your-domain.com/$DOMAIN/g" /etc/nginx/sites-available/$PROJECT_NAME
    
    # 启用站点
    sudo ln -sf /etc/nginx/sites-available/$PROJECT_NAME /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # 测试Nginx配置
    sudo nginx -t
    
    # 重启Nginx
    sudo systemctl restart nginx
    
    log_success "服务启动完成"
}

# 8. 配置SSL证书
setup_ssl() {
    log_info "配置SSL证书..."
    
    if [ "$DOMAIN" != "localhost" ]; then
        # 使用Let's Encrypt获取免费SSL证书
        sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
        
        # 设置自动续期
        (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | sudo crontab -
        
        log_success "SSL证书配置完成"
    else
        log_warning "本地部署跳过SSL配置"
    fi
}

# 9. 设置监控和日志
setup_monitoring() {
    log_info "设置监控和日志..."
    
    # 创建日志轮转配置
    sudo tee /etc/logrotate.d/$PROJECT_NAME > /dev/null <<EOF
/var/log/pm2/*log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    copytruncate
}

/var/log/nginx/*log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 644 nginx nginx
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 \`cat /var/run/nginx.pid\`
        fi
    endscript
}
EOF
    
    # 配置PM2开机自启
    pm2 startup systemd -u $USER --hp $HOME
    
    log_success "监控配置完成"
}

# 10. 健康检查
health_check() {
    log_info "执行健康检查..."
    
    # 等待服务启动
    sleep 10
    
    # 检查后端服务
    if curl -f http://localhost:5001/api/health >/dev/null 2>&1; then
        log_success "后端服务正常"
    else
        log_error "后端服务异常"
        return 1
    fi
    
    # 检查Nginx
    if curl -f http://localhost >/dev/null 2>&1; then
        log_success "前端服务正常"
    else
        log_error "前端服务异常"
        return 1
    fi
    
    # 检查PM2状态
    pm2 status cert-simulator-backend
    
    log_success "所有服务健康检查通过"
}

# 11. 部署报告
deployment_report() {
    echo ""
    echo "🎉 部署完成报告"
    echo "════════════════════════════════════════"
    echo "📅 部署时间: $(date)"
    echo "🌐 访问地址: https://$DOMAIN"
    echo "🔗 API地址: https://$DOMAIN/api"
    echo "📊 健康检查: https://$DOMAIN/health"
    echo "👨‍💼 管理员账户: admin"
    echo "🔐 管理员密码: 请查看 $DEPLOY_PATH/backend/.env 文件"
    echo ""
    echo "📋 常用命令:"
    echo "  查看服务状态: pm2 status"
    echo "  查看日志: pm2 logs cert-simulator-backend"
    echo "  重启服务: pm2 restart cert-simulator-backend"
    echo "  停止服务: pm2 stop cert-simulator-backend"
    echo "  查看Nginx状态: sudo systemctl status nginx"
    echo "  重启Nginx: sudo systemctl restart nginx"
    echo ""
    echo "🔧 故障排除:"
    echo "  后端日志: tail -f /var/log/pm2/cert-simulator-error.log"
    echo "  Nginx日志: tail -f /var/log/nginx/cert-simulator.error.log"
    echo "  数据库位置: $DEPLOY_PATH/backend/database/app.db"
    echo "════════════════════════════════════════"
}

# 主部署流程
main() {
    log_info "开始自动化部署流程"
    
    check_environment
    setup_directories
    backup_current
    deploy_frontend
    deploy_backend
    setup_database
    start_services
    
    if [ "$ENVIRONMENT" = "production" ]; then
        setup_ssl
    fi
    
    setup_monitoring
    health_check
    deployment_report
    
    log_success "🎉 部署流程全部完成!"
}

# 错误处理
trap 'log_error "部署过程中发生错误，请检查日志"; exit 1' ERR

# 运行主函数
main "$@"