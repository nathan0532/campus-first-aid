import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { dbGet } from '../database/init';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface AuthRequest extends Request {
  user?: User;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    // 验证用户是否仍然存在
    const user = await dbGet(
      'SELECT id, username, email, role FROM users WHERE id = ?',
      decoded.userId
    ) as User | null;

    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin privileges required.' });
  }

  next();
};