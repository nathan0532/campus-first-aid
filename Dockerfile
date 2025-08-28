# Railway 部署 Dockerfile - 简化单阶段构建
FROM node:18-alpine

# 安装系统依赖
RUN apk add --no-cache sqlite curl

# 设置工作目录
WORKDIR /app

# 先复制 package 文件
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# 安装依赖（分步进行以减少内存使用）
RUN cd frontend && npm ci --only=production
RUN cd backend && npm ci --only=production

# 复制源码
COPY frontend/ ./frontend/
COPY backend/ ./backend/
COPY deploy/init-production-db.js ./init-db.js

# 构建前端
RUN cd frontend && npm run build

# 构建后端
RUN cd backend && npm run build

# 复制前端构建产物到后端 public 目录
RUN mkdir -p backend/public && cp -r frontend/dist/* backend/public/

# 切换到后端目录
WORKDIR /app/backend

# 创建必要目录
RUN mkdir -p database logs uploads temp

# 初始化数据库
RUN node ../init-db.js

# 暴露端口
EXPOSE $PORT

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:$PORT/api/health || exit 1

# 启动命令
CMD ["npm", "start"]