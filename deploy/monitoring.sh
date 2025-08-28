#!/bin/bash

# 系统健康监控脚本
# 使用方法: ./monitoring.sh

# 检查服务状态
check_services() {
    echo "🔍 检查服务状态..."
    
    # 检查PM2进程
    if pm2 list | grep -q "cert-simulator-backend.*online"; then
        echo "✅ 后端服务正常运行"
    else
        echo "❌ 后端服务异常"
        pm2 restart cert-simulator-backend
    fi
    
    # 检查Nginx
    if systemctl is-active --quiet nginx; then
        echo "✅ Nginx服务正常运行"
    else
        echo "❌ Nginx服务异常"
        sudo systemctl restart nginx
    fi
    
    # 检查磁盘使用率
    DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ $DISK_USAGE -gt 80 ]; then
        echo "⚠️  磁盘使用率过高: ${DISK_USAGE}%"
    else
        echo "✅ 磁盘使用率正常: ${DISK_USAGE}%"
    fi
    
    # 检查内存使用率
    MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    if [ $MEMORY_USAGE -gt 80 ]; then
        echo "⚠️  内存使用率过高: ${MEMORY_USAGE}%"
    else
        echo "✅ 内存使用率正常: ${MEMORY_USAGE}%"
    fi
}

# 检查API健康状态
check_api() {
    echo "🌐 检查API健康状态..."
    
    if curl -f http://localhost:5001/api/health >/dev/null 2>&1; then
        echo "✅ API服务响应正常"
    else
        echo "❌ API服务无响应"
        return 1
    fi
}

# 清理日志
cleanup_logs() {
    echo "🧹 清理旧日志..."
    
    # 清理PM2日志
    find /var/log/pm2/ -name "*.log" -mtime +7 -delete
    
    # 清理Nginx日志
    find /var/log/nginx/ -name "*.log.*" -mtime +14 -delete
    
    echo "✅ 日志清理完成"
}

# 数据库维护
maintain_database() {
    echo "🗄️  数据库维护..."
    
    # 数据库优化
    sqlite3 /var/www/cert-simulator/backend/database/app.db "VACUUM;"
    
    # 清理过期会话
    sqlite3 /var/www/cert-simulator/backend/database/app.db "DELETE FROM sessions WHERE expires_at < datetime('now');"
    
    echo "✅ 数据库维护完成"
}

# 生成监控报告
generate_report() {
    echo ""
    echo "📊 系统监控报告 - $(date)"
    echo "═══════════════════════════════════════"
    
    # 系统信息
    echo "🖥️  系统负载: $(uptime | awk -F'load average:' '{print $2}')"
    echo "💾 内存使用: $(free -h | awk 'NR==2{printf "%s/%s (%.2f%%)", $3,$2,$3*100/$2}')"
    echo "💿 磁盘使用: $(df -h / | awk 'NR==2{printf "%s/%s (%s)", $3,$2,$5}')"
    
    # 服务状态
    echo ""
    echo "🔧 服务状态:"
    pm2 jlist | jq -r '.[] | "  " + .name + ": " + .pm2_env.status'
    
    # 访问统计
    echo ""
    echo "📈 今日访问统计:"
    TODAY=$(date +%d/%b/%Y)
    NGINX_LOG="/var/log/nginx/cert-simulator.access.log"
    if [ -f "$NGINX_LOG" ]; then
        TOTAL_VISITS=$(grep "$TODAY" "$NGINX_LOG" | wc -l)
        UNIQUE_IPS=$(grep "$TODAY" "$NGINX_LOG" | awk '{print $1}' | sort -u | wc -l)
        echo "  总访问量: $TOTAL_VISITS"
        echo "  独立IP: $UNIQUE_IPS"
    fi
    
    echo "═══════════════════════════════════════"
}

# 主函数
main() {
    check_services
    check_api
    cleanup_logs
    maintain_database
    generate_report
}

# 运行监控
main