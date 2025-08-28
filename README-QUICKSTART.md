# CERT Simulator For Teens - 快速启动指南

## 🚀 一键启动

```bash
# 启动所有服务
./start.sh

# 停止所有服务  
./stop.sh
```

## 📱 访问地址

- **前端应用**: http://localhost:3000
- **后端API**: http://localhost:5001
- **健康检查**: http://localhost:5001/api/health

## 🔐 测试账号

### 学生账号
- `demo` / `demo123` (原始学生账号)
- `student1` / `student123`
- `student2` / `student123` 
- `student3` / `student123`
- `alex` / `alex123`
- `emily` / `emily123`
- `mike` / `mike123`
- `sarah` / `sarah123`

### 管理员账号
- `admin` / `admin123`

## 🎯 快速体验流程

1. 运行 `./start.sh` 启动系统
2. 打开浏览器访问 http://localhost:3000
3. 点击 "Student Demo" 按钮或手动输入账号登录
4. 体验知识问答 → 操作指导 → 模拟训练的完整流程

## 📁 项目结构

```
campus-first-aid/
├── start.sh           # 启动脚本
├── stop.sh            # 停止脚本
├── backend/
│   ├── simple-server.js    # 后端服务器
│   ├── database/app.db     # SQLite数据库
│   └── init-db.js          # 数据库初始化
├── frontend/           # React前端应用
└── logs/              # 运行日志
    ├── backend.log
    └── frontend.log
```

## 🔧 手动启动（如需要）

### 后端
```bash
cd backend
node simple-server.js
```

### 前端
```bash
cd frontend
npm run dev
```

## 📊 系统功能

- ✅ 用户登录认证
- ✅ CPR心肺复苏训练
- ✅ 海姆立克急救训练  
- ✅ 知识问答（5秒计时）
- ✅ 操作指导展示
- ✅ 模拟训练评分
- ✅ 整体时间限制（CPR 5分钟，海姆立克 7分钟）

## 🆘 故障排除

如果遇到问题：
1. 检查日志: `tail -f logs/backend.log` 或 `tail -f logs/frontend.log`
2. 重启服务: `./stop.sh && ./start.sh`
3. 检查端口占用: `lsof -i :5001` 或 `lsof -i :3001`