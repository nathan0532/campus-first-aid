// Vercel Edge Function - 用户登录
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// 模拟数据库 (生产环境建议使用 Supabase 或 PlanetScale)
const DEMO_USERS = [
  {
    id: 1,
    username: 'demo',
    email: 'demo@lifeskill.app',
    password_hash: '$2a$10$K2NiX5wt2C.XZ5yutOe.jOXDBHCeDm3X.pAAZAz6zVhs/PGoAMt6G',
    role: 'student'
  },
  {
    id: 2,
    username: 'admin',
    email: 'admin@lifeskill.app',
    password_hash: '$2a$10$3DKQo8.x857XkQGKRDb7ce8HHNV7436w7F8G1OYa/jsKMAd6a5xsq',
    role: 'admin'
  }
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '用户名和密码不能为空' });
  }

  // 查找用户
  const user = DEMO_USERS.find(u => u.username === username || u.email === username);
  
  if (!user) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  // 验证密码
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  
  if (!isValidPassword) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  // 生成JWT token
  const token = jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      role: user.role 
    },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '24h' }
  );

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
}