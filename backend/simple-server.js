// Simple JavaScript server for testing login
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Database connection
const db = new sqlite3.Database('./database/app.db', (err) => {
  if (err) {
    console.error('无法连接数据库:', err.message);
    process.exit(1);
  }
  console.log('✅ 数据库连接成功');
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'CERT Simulator For Teens API 运行正常',
    timestamp: new Date().toISOString()
  });
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Get user profile
app.get('/api/users/me', authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  db.get(
    'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
    [userId],
    (err, user) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ error: 'Server error' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user });
    }
  );
});

// Get personal stats
app.get('/api/stats/personal', authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  // Get training count
  db.get(
    'SELECT COUNT(*) as count FROM training_records WHERE user_id = ?',
    [userId],
    (err, totalTrainings) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ error: 'Server error' });
      }

      // Get average score
      db.get(
        'SELECT AVG(score) as avg FROM training_records WHERE user_id = ?',
        [userId],
        (err, avgScore) => {
          if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ error: 'Server error' });
          }

          // Get best score
          db.get(
            'SELECT MAX(score) as max FROM training_records WHERE user_id = ?',
            [userId],
            (err, bestScore) => {
              if (err) {
                console.error('Database query error:', err);
                return res.status(500).json({ error: 'Server error' });
              }

              // Get scenario counts
              db.all(
                `SELECT 
                   scenario_type,
                   COUNT(*) as attempts,
                   MAX(score) as best_score
                 FROM training_records 
                 WHERE user_id = ? 
                 GROUP BY scenario_type`,
                [userId],
                (err, scenarioBest) => {
                  if (err) {
                    console.error('Database query error:', err);
                    return res.status(500).json({ error: 'Server error' });
                  }

                  // Get recent trainings
                  db.all(
                    `SELECT * FROM training_records 
                     WHERE user_id = ? 
                     ORDER BY completed_at DESC 
                     LIMIT 5`,
                    [userId],
                    (err, recentTrainings) => {
                      if (err) {
                        console.error('Database query error:', err);
                        return res.status(500).json({ error: 'Server error' });
                      }

                      res.json({
                        summary: {
                          totalTrainings: totalTrainings.count,
                          avgScore: Math.round(avgScore.avg || 0),
                          bestScore: bestScore.max || 0
                        },
                        scenarioBest: scenarioBest || [],
                        recentTrainings: recentTrainings || []
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
});

// Login route
app.post('/api/users/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }

  // Find user in database
  db.get(
    'SELECT id, username, email, password_hash, role FROM users WHERE username = ?',
    [username],
    (err, user) => {
      if (err) {
        console.error('数据库查询错误:', err);
        return res.status(500).json({ error: '服务器错误' });
      }

      if (!user) {
        return res.status(401).json({ error: '用户名或密码错误' });
      }

      // Verify password
      bcrypt.compare(password, user.password_hash, (err, isValid) => {
        if (err) {
          console.error('密码验证错误:', err);
          return res.status(500).json({ error: '服务器错误' });
        }

        if (!isValid) {
          return res.status(401).json({ error: '用户名或密码错误' });
        }

        // Generate JWT token
        const token = jwt.sign(
          { 
            id: user.id, 
            username: user.username, 
            role: user.role 
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        // Return user data and token
        res.json({
          message: '登录成功',
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
          },
          token
        });

        console.log(`✅ 用户 ${username} 登录成功`);
      });
    }
  );
});

// Register route
app.post('/api/users/register', (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  // Check if user already exists
  db.get(
    'SELECT id FROM users WHERE username = ? OR email = ?',
    [username, email],
    (err, existingUser) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ error: 'Server error' });
      }

      if (existingUser) {
        return res.status(400).json({ error: 'Username or email already exists' });
      }

      // Hash password and create user
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          console.error('Password hashing error:', err);
          return res.status(500).json({ error: 'Server error' });
        }

        db.run(
          'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
          [username, email, hash],
          function(err) {
            if (err) {
              console.error('User creation error:', err);
              return res.status(500).json({ error: 'Failed to create user' });
            }

            // Generate JWT token
            const token = jwt.sign(
              { 
                id: this.lastID, 
                username: username, 
                role: 'student' 
              },
              JWT_SECRET,
              { expiresIn: '24h' }
            );

            // Return user data and token
            res.status(201).json({
              message: 'Registration successful',
              user: {
                id: this.lastID,
                username: username,
                email: email,
                role: 'student'
              },
              token
            });

            console.log(`✅ 用户 ${username} 注册成功`);
          }
        );
      });
    }
  );
});

// Submit training result
app.post('/api/training/submit', authenticateToken, (req, res) => {
  const { scenarioType, score, duration, stepsData } = req.body;
  const userId = req.user.id;

  if (!scenarioType || score === undefined || !duration) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    'INSERT INTO training_records (user_id, scenario_type, score, duration, steps_data) VALUES (?, ?, ?, ?, ?)',
    [userId, scenarioType, score, duration, JSON.stringify(stepsData || {})],
    function(err) {
      if (err) {
        console.error('Training record creation error:', err);
        return res.status(500).json({ error: 'Failed to save training record' });
      }

      res.status(201).json({
        message: 'Training result saved successfully',
        recordId: this.lastID
      });

      console.log(`✅ 用户 ${req.user.username} 完成 ${scenarioType} 训练，得分: ${score}`);
    }
  );
});

// Get training scenarios
app.get('/api/training/scenarios', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM scenarios ORDER BY type, difficulty_level',
    [],
    (err, scenarios) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ error: 'Server error' });
      }

      // If no scenarios in database, return default ones
      if (!scenarios || scenarios.length === 0) {
        const defaultScenarios = [
          {
            id: 1,
            name: 'CPR Training',
            type: 'cpr',
            description: 'Learn cardiopulmonary resuscitation techniques',
            difficulty_level: 1
          },
          {
            id: 2,
            name: 'Heimlich Maneuver',
            type: 'heimlich',
            description: 'Learn choking emergency response',
            difficulty_level: 1
          }
        ];
        return res.json({ scenarios: defaultScenarios });
      }

      res.json({ scenarios });
    }
  );
});

// Get leaderboard
app.get('/api/stats/leaderboard', (req, res) => {
  const { scenario, timeframe } = req.query;
  
  let dateFilter = '';
  if (timeframe === 'week') {
    dateFilter = "AND completed_at >= DATE('now', '-7 days')";
  } else if (timeframe === 'month') {
    dateFilter = "AND completed_at >= DATE('now', '-30 days')";
  }

  let scenarioFilter = '';
  if (scenario && ['cpr', 'heimlich'].includes(scenario)) {
    scenarioFilter = `AND scenario_type = '${scenario}'`;
  }

  db.all(`
    SELECT 
      u.username,
      MAX(tr.score) as best_score,
      AVG(tr.score) as avg_score,
      COUNT(tr.id) as training_count,
      tr.scenario_type
    FROM users u
    JOIN training_records tr ON u.id = tr.user_id
    WHERE u.role = 'student' ${dateFilter} ${scenarioFilter}
    GROUP BY u.id, tr.scenario_type
    ORDER BY best_score DESC, avg_score DESC
    LIMIT 20
  `, [], (err, leaderboard) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    res.json({ leaderboard: leaderboard || [] });
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`);
  console.log(`💚 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`🔑 登录接口: http://localhost:${PORT}/api/users/login`);
});