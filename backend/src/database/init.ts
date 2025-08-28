import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const DB_PATH = process.env.DB_PATH || './database/app.db';
const dbDir = path.dirname(DB_PATH);

// 确保数据库目录存在
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new sqlite3.Database(DB_PATH);

// 将数据库方法转换为Promise
export const dbRun = (sql: string, ...params: any[]) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

export const dbGet = (sql: string, ...params: any[]) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const dbAll = (sql: string, ...params: any[]) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const initializeDatabase = async () => {
  try {
    // 用户表
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'student',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 训练记录表
    await dbRun(`
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
    `);

    // 场景配置表
    await dbRun(`
      CREATE TABLE IF NOT EXISTS scenarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(20) NOT NULL,
        description TEXT,
        steps_data TEXT,
        difficulty_level INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 插入默认场景数据
    await insertDefaultScenarios();
    
    // 插入测试用户数据
    await insertTestData();

    console.log('数据库表创建完成');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
};

const insertDefaultScenarios = async () => {
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

  try {
    // 检查是否已存在场景数据
    const existingCPR = await dbGet('SELECT id FROM scenarios WHERE type = "cpr"');
    if (!existingCPR) {
      await dbRun(`
        INSERT INTO scenarios (name, type, description, steps_data, difficulty_level)
        VALUES (?, ?, ?, ?, ?)
      `, 
        cprScenario.name,
        cprScenario.type,
        cprScenario.description,
        JSON.stringify(cprScenario.steps),
        1
      );
    }

    const existingHeim = await dbGet('SELECT id FROM scenarios WHERE type = "heimlich"');
    if (!existingHeim) {
      await dbRun(`
        INSERT INTO scenarios (name, type, description, steps_data, difficulty_level)
        VALUES (?, ?, ?, ?, ?)
      `, 
        heimlichScenario.name,
        heimlichScenario.type,
        heimlichScenario.description,
        JSON.stringify(heimlichScenario.steps),
        1
      );
    }
  } catch (error) {
    console.error('插入默认场景数据失败:', error);
  }
};

const insertTestData = async () => {
  try {
    
    // 定义测试用户数据
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

    for (const user of testUsers) {
      // 检查用户是否已存在
      const existingUser = await dbGet('SELECT id FROM users WHERE username = ?', user.username);
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        await dbRun(`
          INSERT INTO users (username, email, password_hash, role)
          VALUES (?, ?, ?, ?)
        `, user.username, user.email, hashedPassword, user.role);
      }
    }

    console.log('测试用户创建完成');
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
  } catch (error) {
    console.error('插入测试数据失败:', error);
  }
};