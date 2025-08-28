#!/bin/bash

# 🚀 LifeSkill.app - 阿里云Docker部署脚本
# 使用方法: ./aliyun-deploy.sh

set -e

# 配置参数
PROJECT_NAME="lifeskill"
DOMAIN="lifeskill.app"
ALIYUN_REGISTRY="registry.cn-hangzhou.aliyuncs.com"
NAMESPACE="lifeskill"

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
    command -v docker >/dev/null 2>&1 || { log_error "Docker未安装"; exit 1; }
    command -v docker-compose >/dev/null 2>&1 || { log_error "Docker Compose未安装"; exit 1; }
    command -v aliyun >/dev/null 2>&1 || { log_error "阿里云CLI未安装"; exit 1; }
    
    # 检查阿里云认证
    if ! aliyun ecs DescribeRegions >/dev/null 2>&1; then
        log_error "阿里云CLI认证失败，请运行: aliyun configure"
        exit 1
    fi
    
    log_success "环境检查通过"
}

# 2. 创建阿里云资源
create_aliyun_resources() {
    log_info "创建阿里云资源..."
    
    # 创建容器镜像仓库命名空间
    aliyun cr CreateNamespace \
        --NamespaceName $NAMESPACE \
        --Region cn-hangzhou || log_warning "命名空间可能已存在"
    
    # 创建OSS存储桶
    aliyun oss mb oss://${PROJECT_NAME}-assets --region oss-cn-hangzhou || log_warning "存储桶可能已存在"
    aliyun oss mb oss://${PROJECT_NAME}-backups --region oss-cn-hangzhou || log_warning "存储桶可能已存在"
    
    # 配置OSS跨域
    cat > oss-cors.json << EOF
{
  "CORSRule": [
    {
      "AllowedOrigin": ["https://$DOMAIN"],
      "AllowedMethod": ["GET", "POST", "PUT", "DELETE"],
      "AllowedHeader": ["*"],
      "MaxAgeSeconds": 3600
    }
  ]
}
EOF
    
    aliyun oss cors --method put oss://${PROJECT_NAME}-assets oss-cors.json
    
    # 申请SSL证书
    log_info "申请SSL证书..."
    aliyun cas CreateCertificateRequest \
        --Domain $DOMAIN \
        --DomainValidateType DNS \
        --CertificateBrand AliyunSSL
    
    log_success "阿里云资源创建完成"
}

# 3. 构建并推送Docker镜像
build_and_push_images() {
    log_info "构建并推送Docker镜像..."
    
    # 登录阿里云容器镜像服务
    docker login --username=${ALIYUN_USERNAME} --password=${ALIYUN_PASSWORD} $ALIYUN_REGISTRY
    
    # 构建前端镜像
    log_info "构建前端镜像..."
    docker build -f deploy/Dockerfile.frontend -t $ALIYUN_REGISTRY/$NAMESPACE/frontend:latest .
    docker push $ALIYUN_REGISTRY/$NAMESPACE/frontend:latest
    
    # 构建后端镜像
    log_info "构建后端镜像..."
    docker build -f deploy/Dockerfile.backend -t $ALIYUN_REGISTRY/$NAMESPACE/backend:latest .
    docker push $ALIYUN_REGISTRY/$NAMESPACE/backend:latest
    
    log_success "镜像推送完成"
}

# 4. 生成环境配置
generate_env_config() {
    log_info "生成环境配置文件..."
    
    cat > .env << EOF
# 基础配置
NODE_ENV=production
DOMAIN=$DOMAIN

# JWT密钥
JWT_SECRET=$(openssl rand -base64 32)

# Redis配置
REDIS_PASSWORD=$(openssl rand -base64 16)

# 阿里云OSS配置
OSS_ACCESS_KEY=${ALIYUN_ACCESS_KEY}
OSS_SECRET_KEY=${ALIYUN_SECRET_KEY}
OSS_BUCKET=${PROJECT_NAME}-assets
OSS_REGION=oss-cn-hangzhou

# 数据库配置
DB_ENCRYPTION_KEY=$(openssl rand -base64 32)

# 阿里云容器镜像服务
ALIYUN_REGISTRY=$ALIYUN_REGISTRY
ALIYUN_USERNAME=${ALIYUN_USERNAME}
ALIYUN_PASSWORD=${ALIYUN_PASSWORD}
EOF
    
    log_success "环境配置生成完成"
}

# 5. 部署到ECS
deploy_to_ecs() {
    log_info "部署到阿里云ECS..."
    
    # 创建部署目录
    mkdir -p deploy-package
    cp -r deploy/cloud/* deploy-package/
    cp .env deploy-package/
    cp docker-compose.yml deploy-package/
    
    # 打包部署文件
    tar -czf ${PROJECT_NAME}-deploy.tar.gz deploy-package/
    
    # 上传到OSS
    aliyun oss cp ${PROJECT_NAME}-deploy.tar.gz oss://${PROJECT_NAME}-assets/deploy/
    
    # 通过ECS实例部署
    ECS_INSTANCE_ID=$(aliyun ecs DescribeInstances --query 'Instances.Instance[0].InstanceId' --output text)
    
    # 执行远程部署命令
    aliyun ecs RunCommand \
        --Type RunShellScript \
        --InstanceIds "[$ECS_INSTANCE_ID]" \
        --CommandContent "$(base64 -w 0 << 'EOF'
cd /opt/lifeskill
wget https://lifeskill-assets.oss-cn-hangzhou.aliyuncs.com/deploy/lifeskill-deploy.tar.gz
tar -xzf lifeskill-deploy.tar.gz
cd deploy-package
docker-compose down
docker-compose pull
docker-compose up -d
EOF
)"
    
    log_success "ECS部署完成"
}

# 6. 配置CDN和负载均衡
setup_cdn_and_lb() {
    log_info "配置CDN和负载均衡..."
    
    # 创建CDN域名
    aliyun cdn AddCdnDomain \
        --DomainName cdn.$DOMAIN \
        --CdnType web \
        --Sources "oss://${PROJECT_NAME}-assets.oss-cn-hangzhou.aliyuncs.com"
    
    # 配置CDN缓存规则
    aliyun cdn BatchSetCdnDomainConfig \
        --DomainNames cdn.$DOMAIN \
        --Functions '[
          {
            "functionName": "cache",
            "functionArgs": [
              {"argName": "ttl", "argValue": "86400"},
              {"argName": "pathPattern", "argValue": "*.js,*.css,*.png,*.jpg,*.gif"}
            ]
          }
        ]'
    
    # 创建应用负载均衡器
    ALB_ID=$(aliyun alb CreateLoadBalancer \
        --LoadBalancerName ${PROJECT_NAME}-alb \
        --VpcId ${VPC_ID} \
        --AddressType Internet \
        --LoadBalancerBillingConfig '{"PayType":"PostPay"}' \
        --ZoneMappings '[{"VSwitchId":"'${VSWITCH_ID}'","ZoneId":"cn-hangzhou-h"}]' \
        --query LoadBalancerId --output text)
    
    log_success "CDN和负载均衡配置完成"
}

# 7. 健康检查和监控
setup_monitoring() {
    log_info "设置监控和告警..."
    
    # 创建站点监控
    aliyun cms CreateSiteMonitor \
        --TaskName ${PROJECT_NAME}-health-check \
        --Address https://$DOMAIN/health \
        --TaskType HTTP \
        --Interval 60
    
    # 创建告警规则
    aliyun cms PutResourceMetricRule \
        --RuleName ${PROJECT_NAME}-cpu-alert \
        --Namespace acs_ecs_dashboard \
        --MetricName CPUUtilization \
        --Resources '[{"instanceId":"'$ECS_INSTANCE_ID'"}]' \
        --Threshold 80 \
        --ComparisonOperator GreaterThanThreshold \
        --EvaluationCount 2 \
        --ContactGroups '["'${CONTACT_GROUP}'"]'
    
    log_success "监控配置完成"
}

# 8. SSL证书配置
configure_ssl() {
    log_info "配置SSL证书..."
    
    # 下载SSL证书
    CERT_ID=$(aliyun cas DescribeCertificateList --query 'CertificateList[0].CertificateId' --output text)
    
    # 部署到负载均衡器
    aliyun alb CreateListener \
        --LoadBalancerId $ALB_ID \
        --ListenerProtocol HTTPS \
        --ListenerPort 443 \
        --DefaultActions '[{
          "Type": "ForwardGroup",
          "ForwardGroupConfig": {
            "ServerGroupTuples": [{
              "ServerGroupId": "'${SERVER_GROUP_ID}'"
            }]
          }
        }]' \
        --Certificates '[{
          "CertificateId": "'$CERT_ID'"
        }]'
    
    log_success "SSL证书配置完成"
}

# 9. 部署验证
verify_deployment() {
    log_info "验证部署状态..."
    
    # 等待服务启动
    sleep 30
    
    # 健康检查
    if curl -f https://$DOMAIN/health >/dev/null 2>&1; then
        log_success "网站健康检查通过"
    else
        log_error "网站健康检查失败"
        return 1
    fi
    
    # API检查
    if curl -f https://$DOMAIN/api/health >/dev/null 2>&1; then
        log_success "API健康检查通过"
    else
        log_error "API健康检查失败"
        return 1
    fi
    
    log_success "部署验证完成"
}

# 10. 部署报告
deployment_report() {
    echo ""
    echo "🎉 阿里云部署完成报告"
    echo "════════════════════════════════════════"
    echo "📅 部署时间: $(date)"
    echo "🌐 网站地址: https://$DOMAIN"
    echo "🔗 API地址: https://$DOMAIN/api"
    echo "📊 CDN地址: https://cdn.$DOMAIN"
    echo "💾 OSS存储: https://${PROJECT_NAME}-assets.oss-cn-hangzhou.aliyuncs.com"
    echo "🔍 监控地址: https://cms.console.aliyun.com"
    echo ""
    echo "📋 管理命令:"
    echo "  查看容器状态: docker-compose ps"
    echo "  查看日志: docker-compose logs -f"
    echo "  重启服务: docker-compose restart"
    echo "  停止服务: docker-compose down"
    echo ""
    echo "🛠️  阿里云控制台:"
    echo "  ECS控制台: https://ecs.console.aliyun.com"
    echo "  容器镜像: https://cr.console.aliyun.com"
    echo "  CDN控制台: https://cdn.console.aliyun.com"
    echo "  OSS控制台: https://oss.console.aliyun.com"
    echo "════════════════════════════════════════"
}

# 主部署流程
main() {
    log_info "开始阿里云Docker部署流程"
    
    check_environment
    create_aliyun_resources
    generate_env_config
    build_and_push_images
    deploy_to_ecs
    setup_cdn_and_lb
    configure_ssl
    setup_monitoring
    verify_deployment
    deployment_report
    
    log_success "🎉 阿里云部署流程全部完成!"
}

# 错误处理
trap 'log_error "部署过程中发生错误"; exit 1' ERR

# 检查必要的环境变量
if [[ -z "$ALIYUN_ACCESS_KEY" || -z "$ALIYUN_SECRET_KEY" ]]; then
    log_error "请设置阿里云访问密钥环境变量: ALIYUN_ACCESS_KEY, ALIYUN_SECRET_KEY"
    exit 1
fi

# 运行主函数
main "$@"