import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { dbRun, dbGet, dbAll } from '../database/init';

// 定义用户类型
interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role: string;
  created_at: string;
}

interface DatabaseResult {
  lastID: number;
  changes: number;
}

const router = express.Router();

// 注册
router.post('/register', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Please enter a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // 检查用户是否已存在
    const existingUser = await dbGet(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      username, email
    );

    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const result = await dbRun(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      username, email, hashedPassword
    ) as DatabaseResult;

    // 生成JWT token
    const token = jwt.sign(
      { userId: result.lastID, username },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: result.lastID,
        username,
        email,
        role: 'student'
      }
    });
  } catch (error) {
    console.error('Registration failed:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 登录
router.post('/login', [
  body('username').notEmpty().withMessage('Username cannot be empty'),
  body('password').notEmpty().withMessage('Password cannot be empty')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // 查找用户
    const user = await dbGet(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      username, username
    ) as User | null;

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // 生成JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 获取用户信息
router.get('/me', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    const user = await dbGet('SELECT id, username, email, role, created_at FROM users WHERE id = ?', decoded.userId) as User | null;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Failed to get user info:', error);
    res.status(401).json({ error: 'Invalid authentication token' });
  }
});

// 获取所有用户（管理员）
router.get('/', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    const adminUser = await dbGet('SELECT role FROM users WHERE id = ?', decoded.userId) as User | null;

    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const users = await dbAll(`
      SELECT 
        u.id, u.username, u.email, u.role, u.created_at,
        COUNT(tr.id) as training_count,
        AVG(tr.score) as avg_score,
        MAX(tr.completed_at) as last_training
      FROM users u
      LEFT JOIN training_records tr ON u.id = tr.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    res.json({ users });
  } catch (error) {
    console.error('Failed to get user list:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;