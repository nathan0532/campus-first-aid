import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { dbGet, dbAll } from '../database/init';

const router = express.Router();

// 获取总体统计数据（管理员）
router.get('/overview', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    const adminUser = await dbGet('SELECT role FROM users WHERE id = ?', [decoded.userId]) as any;

    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // 总用户数
    const totalUsers = await dbGet('SELECT COUNT(*) as count FROM users WHERE role = "student"') as any;
    
    // 总训练次数
    const totalTrainings = await dbGet('SELECT COUNT(*) as count FROM training_records') as any;
    
    // 平均分数
    const avgScore = await dbGet('SELECT AVG(score) as avg FROM training_records') as any;
    
    // 今日训练数
    const todayTrainings = await dbGet(`
      SELECT COUNT(*) as count FROM training_records 
      WHERE DATE(completed_at) = DATE('now')
    `) as any;

    // 各场景训练分布
    const scenarioStats = await dbAll(`
      SELECT 
        scenario_type,
        COUNT(*) as count,
        AVG(score) as avg_score,
        MAX(score) as max_score,
        MIN(score) as min_score
      FROM training_records 
      GROUP BY scenario_type
    `) as any[];

    // 最近7天的训练趋势
    const weeklyTrend = await dbAll(`
      SELECT 
        DATE(completed_at) as date,
        COUNT(*) as count,
        AVG(score) as avg_score
      FROM training_records 
      WHERE completed_at >= DATE('now', '-7 days')
      GROUP BY DATE(completed_at)
      ORDER BY date
    `) as any[];

    // 用户参与度统计
    const userEngagement = await dbAll(`
      SELECT 
        u.username,
        COUNT(tr.id) as training_count,
        AVG(tr.score) as avg_score,
        MAX(tr.completed_at) as last_training
      FROM users u
      LEFT JOIN training_records tr ON u.id = tr.user_id
      WHERE u.role = 'student'
      GROUP BY u.id
      ORDER BY training_count DESC
      LIMIT 10
    `) as any[];

    res.json({
      overview: {
        totalUsers: totalUsers.count,
        totalTrainings: totalTrainings.count,
        avgScore: Math.round(avgScore.avg || 0),
        todayTrainings: todayTrainings.count
      },
      scenarioStats,
      weeklyTrend,
      topUsers: userEngagement
    });
  } catch (error) {
    console.error('Failed to get statistics data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 获取用户个人统计
router.get('/personal', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;

    // 总训练次数
    const totalTrainings = await dbGet(
      'SELECT COUNT(*) as count FROM training_records WHERE user_id = ?',
      [decoded.userId]
    ) as any;

    // 平均分数
    const avgScore = await dbGet(
      'SELECT AVG(score) as avg FROM training_records WHERE user_id = ?',
      [decoded.userId]
    ) as any;

    // 最高分数
    const bestScore = await dbGet(
      'SELECT MAX(score) as max FROM training_records WHERE user_id = ?',
      [decoded.userId]
    ) as any;

    // 各场景最佳成绩
    const scenarioBest = await dbAll(`
      SELECT 
        scenario_type,
        MAX(score) as best_score,
        COUNT(*) as attempts
      FROM training_records 
      WHERE user_id = ?
      GROUP BY scenario_type
    `, [decoded.userId]) as any[];

    // 最近训练记录
    const recentTrainings = await dbAll(`
      SELECT 
        tr.*,
        s.name as scenario_name
      FROM training_records tr
      LEFT JOIN scenarios s ON tr.scenario_type = s.type
      WHERE tr.user_id = ?
      ORDER BY tr.completed_at DESC
      LIMIT 5
    `, [decoded.userId]) as any[];

    // 学习进度趋势
    const progressTrend = await dbAll(`
      SELECT 
        DATE(completed_at) as date,
        AVG(score) as avg_score,
        scenario_type
      FROM training_records 
      WHERE user_id = ? AND completed_at >= DATE('now', '-30 days')
      GROUP BY DATE(completed_at), scenario_type
      ORDER BY date
    `, [decoded.userId]) as any[];

    res.json({
      summary: {
        totalTrainings: totalTrainings.count,
        avgScore: Math.round(avgScore.avg || 0),
        bestScore: bestScore.max || 0
      },
      scenarioBest,
      recentTrainings: recentTrainings.map(record => ({
        ...record,
        steps_data: JSON.parse(record.steps_data || '[]')
      })),
      progressTrend
    });
  } catch (error) {
    console.error('Failed to get personal statistics:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 获取排行榜
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const scenarioType = req.query.scenario as string;
    const timeframe = req.query.timeframe as string || 'all'; // all, week, month

    let dateFilter = '';
    if (timeframe === 'week') {
      dateFilter = "AND completed_at >= DATE('now', '-7 days')";
    } else if (timeframe === 'month') {
      dateFilter = "AND completed_at >= DATE('now', '-30 days')";
    }

    let scenarioFilter = '';
    if (scenarioType && ['cpr', 'heimlich'].includes(scenarioType)) {
      scenarioFilter = `AND scenario_type = '${scenarioType}'`;
    }

    const leaderboard = await dbAll(`
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
    `) as any[];

    res.json({ leaderboard });
  } catch (error) {
    console.error('Failed to get leaderboard:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;