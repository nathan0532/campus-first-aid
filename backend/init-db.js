// Simple database initialization script in JavaScript
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const DB_PATH = './database/app.db';
const dbDir = path.dirname(DB_PATH);

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

console.log('正在初始化数据库...');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('无法连接数据库:', err.message);
    process.exit(1);
  }
  console.log('✅ 数据库连接成功');
});

// Create tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'student',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('创建用户表失败:', err);
      return;
    }
    console.log('✅ 用户表创建成功');
  });

  // Training records table
  db.run(`
    CREATE TABLE IF NOT EXISTS training_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      scenario_type VARCHAR(20) NOT NULL,
      score INTEGER NOT NULL,
      duration INTEGER NOT NULL,
      steps_data TEXT,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `, (err) => {
    if (err) {
      console.error('创建训练记录表失败:', err);
      return;
    }
    console.log('✅ 训练记录表创建成功');
  });

  // Scenarios table
  db.run(`
    CREATE TABLE IF NOT EXISTS scenarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      type VARCHAR(20) NOT NULL,
      description TEXT,
      steps_data TEXT,
      difficulty_level INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('创建场景表失败:', err);
      return;
    }
    console.log('✅ 场景表创建成功');
    
    // Insert default scenarios
    insertDefaultScenarios();
  });
});

function insertDefaultScenarios() {
  const cprScenario = {
    name: '心肺复苏 (CPR)',
    type: 'cpr',
    description: '标准心肺复苏操作训练',
    steps: [
      { id: 'check-consciousness', name: '检查意识', points: 20 },
      { id: 'call-help', name: '呼救', points: 20 },
      { id: 'position', name: '摆放体位', points: 20 },
      { id: 'compression', name: '胸外按压', points: 25 },
      { id: 'ventilation', name: '人工呼吸', points: 15 }
    ]
  };

  const heimlichScenario = {
    name: '海姆立克急救法',
    type: 'heimlich',
    description: '窒息急救操作训练',
    steps: [
      { id: 'identify-choking', name: '识别窒息', points: 25 },
      { id: 'position-behind', name: '站立定位', points: 25 },
      { id: 'hand-position', name: '手部定位', points: 25 },
      { id: 'abdominal-thrust', name: '腹部冲击', points: 25 }
    ]
  };

  // Check and insert CPR scenario
  db.get('SELECT id FROM scenarios WHERE type = "cpr"', (err, row) => {
    if (err) {
      console.error('检查CPR场景失败:', err);
      return;
    }
    
    if (!row) {
      db.run(`
        INSERT INTO scenarios (name, type, description, steps_data, difficulty_level)
        VALUES (?, ?, ?, ?, ?)
      `, [
        cprScenario.name,
        cprScenario.type,
        cprScenario.description,
        JSON.stringify(cprScenario.steps),
        1
      ], (err) => {
        if (err) {
          console.error('插入CPR场景失败:', err);
        } else {
          console.log('✅ CPR场景数据插入成功');
        }
      });
    }
  });

  // Check and insert Heimlich scenario
  db.get('SELECT id FROM scenarios WHERE type = "heimlich"', (err, row) => {
    if (err) {
      console.error('检查海姆立克场景失败:', err);
      return;
    }
    
    if (!row) {
      db.run(`
        INSERT INTO scenarios (name, type, description, steps_data, difficulty_level)
        VALUES (?, ?, ?, ?, ?)
      `, [
        heimlichScenario.name,
        heimlichScenario.type,
        heimlichScenario.description,
        JSON.stringify(heimlichScenario.steps),
        1
      ], (err) => {
        if (err) {
          console.error('插入海姆立克场景失败:', err);
        } else {
          console.log('✅ 海姆立克场景数据插入成功');
        }
      });
    }
  });

  // Insert test users after scenarios
  setTimeout(() => {
    insertTestUsers();
  }, 1000);
}

function insertTestUsers() {
  console.log('🔐 创建测试用户...');
  
  const testUsers = [
    { username: 'demo', email: 'demo@example.com', password: 'demo123', role: 'student' },
    { username: 'student1', email: 'student1@example.com', password: 'student123', role: 'student' },
    { username: 'student2', email: 'student2@example.com', password: 'student123', role: 'student' },
    { username: 'student3', email: 'student3@example.com', password: 'student123', role: 'student' },
    { username: 'alex', email: 'alex@example.com', password: 'alex123', role: 'student' },
    { username: 'emily', email: 'emily@example.com', password: 'emily123', role: 'student' },
    { username: 'mike', email: 'mike@example.com', password: 'mike123', role: 'student' },
    { username: 'sarah', email: 'sarah@example.com', password: 'sarah123', role: 'student' },
    { username: 'admin', email: 'admin@example.com', password: 'admin123', role: 'admin' }
  ];

  let usersCreated = 0;
  let totalUsers = testUsers.length;

  testUsers.forEach((user) => {
    // Check if user already exists
    db.get('SELECT id FROM users WHERE username = ?', [user.username], (err, row) => {
      if (err) {
        console.error(`检查用户 ${user.username} 失败:`, err);
        return;
      }
      
      if (!row) {
        // Hash password and create user
        bcrypt.hash(user.password, 10, (err, hashedPassword) => {
          if (err) {
            console.error(`加密密码失败 ${user.username}:`, err);
            return;
          }
          
          db.run(`
            INSERT INTO users (username, email, password_hash, role)
            VALUES (?, ?, ?, ?)
          `, [user.username, user.email, hashedPassword, user.role], (err) => {
            if (err) {
              console.error(`创建用户 ${user.username} 失败:`, err);
            } else {
              console.log(`✅ 用户 ${user.username} 创建成功`);
            }
            
            usersCreated++;
            if (usersCreated === totalUsers) {
              // All done
              console.log('\\n🎉 数据库初始化完成!');
              console.log('=== 学生测试账号 ===');
              console.log('原始学生账号: demo / demo123');
              console.log('新学生账号1: student1 / student123');
              console.log('新学生账号2: student2 / student123');
              console.log('新学生账号3: student3 / student123');
              console.log('学生账号: alex / alex123');
              console.log('学生账号: emily / emily123');
              console.log('学生账号: mike / mike123');
              console.log('学生账号: sarah / sarah123');
              console.log('=== 管理员账号 ===');
              console.log('管理员账号: admin / admin123');
              
              db.close((err) => {
                if (err) {
                  console.error('关闭数据库连接失败:', err.message);
                } else {
                  console.log('✅ 数据库连接已关闭');
                }
                process.exit(0);
              });
            }
          });
        });
      } else {
        console.log(`ℹ️  用户 ${user.username} 已存在，跳过创建`);
        usersCreated++;
        if (usersCreated === totalUsers) {
          // All done
          console.log('\\n🎉 数据库检查完成!');
          db.close();
          process.exit(0);
        }
      }
    });
  });
}