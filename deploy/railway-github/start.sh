#!/bin/sh

# Railway启动脚本
echo "🚀 正在启动LifeSkill Emergency Training App..."

# 设置默认端口
export PORT=${PORT:-3000}

# 环境变量检查
echo "📋 环境配置:"
echo "   NODE_ENV: ${NODE_ENV:-development}"
echo "   PORT: $PORT"
echo "   CORS_ORIGIN: ${CORS_ORIGIN:-*}"

# 初始化数据库
if [ ! -f "./database/app.db" ]; then
    echo "📄 初始化数据库..."
    node init-db.js
else
    echo "✅ 数据库已存在"
fi

# 数据库权限检查
chmod 644 ./database/app.db 2>/dev/null || echo "⚠️  数据库权限设置失败，继续..."

# 更新simple-server.js以同时服务前端和后端
cat > app.js << 'EOF'
const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'railway-secret-key';

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());

// 静态文件服务 (前端)
app.use(express.static(path.join(__dirname, 'public')));

// 数据库连接
const db = new sqlite3.Database('./database/app.db', (err) => {
  if (err) {
    console.error('❌ 数据库连接失败:', err.message);
  } else {
    console.log('✅ 数据库连接成功');
  }
});

// JWT认证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// API路由
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'LifeSkill API 运行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.post('/api/users/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }

  db.get(
    'SELECT id, username, email, password_hash, role FROM users WHERE username = ?',
    [username],
    (err, user) => {
      if (err || !user) {
        return res.status(401).json({ error: '用户名或密码错误' });
      }

      bcrypt.compare(password, user.password_hash, (err, isValid) => {
        if (err || !isValid) {
          return res.status(401).json({ error: '用户名或密码错误' });
        }

        const token = jwt.sign(
          { id: user.id, username: user.username, role: user.role },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.json({
          message: '登录成功',
          user: { id: user.id, username: user.username, email: user.email, role: user.role },
          token
        });
      });
    }
  );
});

app.post('/api/users/register', (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).json({ error: 'Server error' });

    db.run(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, hash],
      function(err) {
        if (err) {
          return res.status(400).json({ error: 'Username or email already exists' });
        }

        const token = jwt.sign(
          { id: this.lastID, username: username, role: 'student' },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.status(201).json({
          message: 'Registration successful',
          user: { id: this.lastID, username, email, role: 'student' },
          token
        });
      }
    );
  });
});

app.get('/api/users/me', authenticateToken, (req, res) => {
  db.get(
    'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err || !user) return res.status(404).json({ error: 'User not found' });
      res.json({ user });
    }
  );
});

app.get('/api/stats/personal', authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  db.get('SELECT COUNT(*) as count FROM training_records WHERE user_id = ?', [userId], (err, total) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    
    db.get('SELECT AVG(score) as avg FROM training_records WHERE user_id = ?', [userId], (err, avg) => {
      if (err) return res.status(500).json({ error: 'Server error' });
      
      db.get('SELECT MAX(score) as max FROM training_records WHERE user_id = ?', [userId], (err, best) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        
        db.all('SELECT * FROM training_records WHERE user_id = ? ORDER BY completed_at DESC LIMIT 5', [userId], (err, recent) => {
          if (err) return res.status(500).json({ error: 'Server error' });
          
          res.json({
            summary: {
              totalTrainings: total.count,
              avgScore: Math.round(avg.avg || 0),
              bestScore: best.max || 0
            },
            recentTrainings: recent || []
          });
        });
      });
    });
  });
});

app.post('/api/training/submit', authenticateToken, (req, res) => {
  const { scenarioType, score, duration, stepsData } = req.body;
  
  db.run(
    'INSERT INTO training_records (user_id, scenario_type, score, duration, steps_data) VALUES (?, ?, ?, ?, ?)',
    [req.user.id, scenarioType, score, duration, JSON.stringify(stepsData || {})],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to save training record' });
      
      res.status(201).json({
        message: 'Training result saved successfully',
        recordId: this.lastID
      });
    }
  );
});

// 前端路由处理 - 所有非API请求返回index.html
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 LifeSkill服务器运行在端口 ${PORT}`);
  console.log(`💚 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`🌐 前端页面: http://localhost:${PORT}`);
});
EOF

# 启动应用
echo "🌐 服务启动在端口 $PORT"
echo "✅ 前端: http://localhost:$PORT"
echo "✅ API: http://localhost:$PORT/api"

exec node app.js