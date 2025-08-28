# 🚀 LifeSkill Emergency Training - Railway部署指南

## 📋 一键部署步骤

### 前置要求
```bash
# 1. 安装必要工具
node -v    # 需要 18+
git --version
npm install -g @railway/cli
```

### 🎯 方法一：一键部署脚本 (推荐)

```bash
# 1. 克隆项目 (如果还没有)
git clone https://github.com/your-username/campus-first-aid.git
cd campus-first-aid

# 2. 运行一键部署
chmod +x deploy-to-railway.sh
./deploy-to-railway.sh

# 3. 设置自定义域名 (可选)
./deploy-to-railway.sh your-domain.com
```

### 🛠️ 方法二：手动部署

```bash
# 1. 登录Railway
railway login

# 2. 创建项目
railway init --name lifeskill-emergency-app

# 3. 设置环境变量
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=$(openssl rand -base64 32)
railway variables set CORS_ORIGIN=https://your-domain.com

# 4. 连接GitHub并部署
railway connect  # 连接GitHub仓库
railway up       # 触发部署

# 5. 获取URL
railway domain
```

### 🔧 方法三：GitHub Actions自动部署

```bash
# 1. 在GitHub仓库设置中添加Secrets
RAILWAY_TOKEN=your_railway_token

# 2. 推送代码到main分支
git add .
git commit -m "Deploy to Railway"
git push origin main

# 3. GitHub Actions会自动部署
# 查看进度: https://github.com/your-repo/actions
```

## 🌐 部署后配置

### 自定义域名设置
```bash
# 1. Railway添加域名
railway domain add your-domain.com

# 2. 在DNS提供商添加CNAME记录
# 名称: your-domain.com
# 值: gateway.railway.app

# 3. 等待DNS生效 (5-10分钟)
```

### 环境变量管理
```bash
# 查看所有变量
railway variables

# 设置新变量
railway variables set KEY=VALUE

# 删除变量
railway variables delete KEY
```

## 📊 管理和监控

### 常用命令
```bash
# 查看服务状态
railway status

# 查看实时日志
railway logs

# 重新部署
railway up --detach

# 开启远程shell
railway shell

# 查看服务指标
railway metrics
```

### 数据库管理
```bash
# 连接数据库
railway shell
sqlite3 database/app.db

# 备份数据库
railway shell
cp database/app.db /tmp/backup-$(date +%Y%m%d).db
```

## 🛡️ 安全配置

### 环境变量加密
```bash
# 生成安全的JWT密钥
railway variables set JWT_SECRET=$(openssl rand -base64 32)

# 设置管理员密码
railway variables set ADMIN_PASSWORD="your-secure-password"

# 设置CORS来源
railway variables set CORS_ORIGIN="https://your-domain.com"
```

## 🔧 故障排除

### 常见问题

**部署失败:**
```bash
# 查看构建日志
railway logs --tail 100

# 检查Dockerfile语法
docker build -t test .
```

**服务无响应:**
```bash
# 重启服务
railway restart

# 检查环境变量
railway variables
```

**数据库问题:**
```bash
# 进入容器
railway shell

# 检查数据库文件
ls -la database/
sqlite3 database/app.db ".tables"
```

**域名解析问题:**
```bash
# 检查DNS设置
nslookup your-domain.com

# 重新添加域名
railway domain remove your-domain.com
railway domain add your-domain.com
```

## 📈 扩容和优化

### 性能优化
```bash
# 升级实例规格
# 在Railway控制台中升级到更高配置

# 启用Redis缓存 (通过Railway插件)
railway add redis

# 配置CDN (推荐Cloudflare)
# 在DNS设置中启用Cloudflare代理
```

### 监控告警
```bash
# 设置健康检查监控 (推荐UptimeRobot)
# URL: https://your-app.railway.app/api/health
# 间隔: 5分钟

# 日志监控
railway logs --follow | grep "ERROR"
```

## 💡 最佳实践

### 代码管理
- 使用Git分支管理功能开发
- main分支触发生产部署
- 通过PR进行代码审查

### 安全管理  
- 定期轮换JWT密钥
- 监控异常登录活动
- 备份重要数据

### 成本控制
- 监控资源使用情况
- 根据流量调整实例配置
- 使用Railway的休眠功能节省成本

---

🎊 **恭喜！** 你的急救训练应用已经可以通过Railway轻松部署了！

需要帮助？查看 [Railway文档](https://docs.railway.app) 或提交Issue。