const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || './database/app.db';

console.log('🗄️  正在初始化生产数据库...');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ 数据库连接失败:', err.message);
    process.exit(1);
  }
  console.log('✅ 数据库连接成功');
});

// 创建表结构
const createTables = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 用户表
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(20) DEFAULT 'student',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 训练记录表
      db.run(`
        CREATE TABLE IF NOT EXISTS training_records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          scenario_type VARCHAR(20) NOT NULL,
          score INTEGER NOT NULL,
          duration INTEGER NOT NULL,
          steps_data TEXT,
          completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
      `);

      // 场景表
      db.run(`
        CREATE TABLE IF NOT EXISTS scenarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name VARCHAR(100) NOT NULL,
          type VARCHAR(20) NOT NULL,
          description TEXT,
          steps_data TEXT,
          difficulty_level INTEGER DEFAULT 1,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 系统日志表
      db.run(`
        CREATE TABLE IF NOT EXISTS system_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          level VARCHAR(20) NOT NULL,
          message TEXT NOT NULL,
          user_id INTEGER,
          ip_address VARCHAR(45),
          user_agent TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });
};

// 创建默认管理员账户
const createAdminUser = async () => {
  return new Promise((resolve, reject) => {
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!@#';
    
    bcrypt.hash(adminPassword, 10, (err, hash) => {
      if (err) {
        reject(err);
        return;
      }

      db.run(`
        INSERT OR IGNORE INTO users (username, email, password_hash, role)
        VALUES (?, ?, ?, ?)
      `, ['admin', 'admin@cert-simulator.com', hash, 'admin'], (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ 管理员账户创建成功');
          console.log(`   用户名: admin`);
          console.log(`   密码: ${adminPassword}`);
          resolve();
        }
      });
    });
  });
};

// 插入默认场景数据
const insertDefaultScenarios = () => {
  return new Promise((resolve, reject) => {
    const scenarios = [
      {
        name: 'CPR基础训练',
        type: 'cpr',
        description: '学习标准心肺复苏术操作',
        difficulty_level: 1
      },
      {
        name: 'CPR高级训练', 
        type: 'cpr',
        description: '复杂情况下的CPR操作',
        difficulty_level: 2
      },
      {
        name: '海姆立克基础训练',
        type: 'heimlich',
        description: '学习处理气道异物阻塞',
        difficulty_level: 1
      },
      {
        name: '海姆立克高级训练',
        type: 'heimlich', 
        description: '特殊人群的海姆立克急救',
        difficulty_level: 2
      }
    ];

    let completed = 0;
    scenarios.forEach((scenario, index) => {
      db.run(`
        INSERT OR IGNORE INTO scenarios (name, type, description, difficulty_level)
        VALUES (?, ?, ?, ?)
      `, [scenario.name, scenario.type, scenario.description, scenario.difficulty_level], (err) => {
        if (err) {
          reject(err);
        } else {
          completed++;
          if (completed === scenarios.length) {
            console.log('✅ 默认场景数据插入成功');
            resolve();
          }
        }
      });
    });
  });
};

// 主初始化函数
async function initializeDatabase() {
  try {
    await createTables();
    console.log('✅ 数据表创建成功');
    
    await createAdminUser();
    await insertDefaultScenarios();
    
    console.log('🎉 生产数据库初始化完成！');
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

initializeDatabase();