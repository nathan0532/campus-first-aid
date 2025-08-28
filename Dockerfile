# Railway 一体化部署 Dockerfile
FROM node:18-alpine

# 安装系统依赖
RUN apk add --no-cache \
    sqlite \
    curl \
    nginx \
    supervisor \
    && rm -rf /var/cache/apk/*

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# 安装依赖
RUN cd frontend && npm ci && cd ../backend && npm ci --only=production

# 复制应用代码
COPY frontend/ ./frontend/
COPY backend/ ./backend/
COPY deploy/ ./deploy/

# 构建前端
WORKDIR /app/frontend
RUN npm run build

# 回到根目录
WORKDIR /app

# 复制前端构建产物到后端public目录
RUN cp -r frontend/dist/* backend/public/ 2>/dev/null || mkdir -p backend/public && cp -r frontend/dist/* backend/public/

# 设置工作目录为后端
WORKDIR /app/backend

# 创建必要目录
RUN mkdir -p database logs uploads temp

# 复制配置文件
COPY deploy/railway-github/nginx.conf /etc/nginx/http.d/default.conf
COPY deploy/railway-github/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY deploy/railway-github/start.sh ./start.sh
COPY deploy/init-production-db.js ./init-db.js

# 设置权限
RUN chmod +x start.sh && \
    addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001 && \
    chown -R appuser:appuser /app

# 切换用户
USER appuser

# 暴露端口
EXPOSE $PORT

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:$PORT/api/health || exit 1

# 启动命令
CMD ["./start.sh"]