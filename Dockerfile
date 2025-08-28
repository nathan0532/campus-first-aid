# Railway 部署 Dockerfile - 轻量化版本
# 阶段1: 构建前端
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY frontend/ ./
RUN npm run build

# 阶段2: 后端构建
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY backend/ ./
RUN npm run build

# 阶段3: 最终运行镜像
FROM node:18-alpine

# 只安装运行时需要的包
RUN apk add --no-cache sqlite3 curl

# 设置工作目录
WORKDIR /app

# 复制构建好的后端代码
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/package*.json ./

# 从前端构建阶段复制构建产物到 public 目录
COPY --from=frontend-builder /app/frontend/dist ./public

# 复制数据库初始化脚本
COPY deploy/init-production-db.js ./init-db.js

# 创建必要目录
RUN mkdir -p database logs uploads temp

# 设置权限
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001 && \
    chown -R appuser:appuser /app

# 切换用户
USER appuser

# 暴露端口
EXPOSE $PORT

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:$PORT/api/health || exit 1

# 初始化数据库
RUN node init-db.js

# 启动命令 - 直接启动编译后的服务器
CMD ["node", "dist/server.js"]