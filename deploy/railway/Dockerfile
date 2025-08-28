# Railway专用后端Dockerfile
FROM node:18-alpine

# 设置工作目录
WORKDIR /usr/src/app

# 安装系统依赖
RUN apk add --no-cache \
    sqlite \
    curl \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# 复制package文件并安装依赖
COPY backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 复制应用代码
COPY backend/ ./

# 复制数据库初始化脚本
COPY deploy/init-production-db.js ./

# 创建必要目录
RUN mkdir -p database logs uploads temp

# 设置权限
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /usr/src/app

# 切换到非root用户
USER nodejs

# 暴露端口
EXPOSE $PORT

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:$PORT/api/health || exit 1

# 启动脚本
COPY deploy/railway/start.sh ./start.sh
USER root
RUN chmod +x start.sh
USER nodejs

CMD ["./start.sh"]