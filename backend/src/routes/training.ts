import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { dbRun, dbGet, dbAll } from '../database/init';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// 获取场景列表 - 需要认证
router.get('/scenarios', authenticateToken, async (req: Request, res: Response) => {
  try {
    const scenarios = await dbAll('SELECT * FROM scenarios ORDER BY type') as any[];
    
    const formattedScenarios = scenarios.map((scenario: any) => ({
      ...scenario,
      steps_data: JSON.parse(scenario.steps_data || '[]')
    }));

    res.json({ scenarios: formattedScenarios });
  } catch (error) {
    console.error('Failed to get scenario list:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 获取特定场景信息 - 需要认证
router.get('/scenarios/:type', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    
    if (!['cpr', 'heimlich'].includes(type)) {
      return res.status(400).json({ error: 'Invalid scenario type' });
    }

    const scenario = await dbGet('SELECT * FROM scenarios WHERE type = ?', [type]) as any;
    
    if (!scenario) {
      return res.status(404).json({ error: 'Scenario does not exist' });
    }

    const formattedScenario = {
      ...scenario,
      steps_data: JSON.parse(scenario.steps_data || '[]')
    };

    res.json({ scenario: formattedScenario });
  } catch (error) {
    console.error('Failed to get scenario info:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 提交训练记录 - 需要认证
router.post('/submit', authenticateToken, [
  body('scenarioType').isIn(['cpr', 'heimlich']).withMessage('Invalid scenario type'),
  body('score').isInt({ min: 0, max: 100 }).withMessage('Score must be between 0-100'),
  body('duration').isInt({ min: 1 }).withMessage('Training duration must be greater than 0'),
  body('stepsData').isArray().withMessage('Steps data must be an array')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { scenarioType, score, duration, stepsData } = req.body;
    const user = (req as any).user;

    // 插入训练记录
    const result = await dbRun(`
      INSERT INTO training_records (user_id, scenario_type, score, duration, steps_data)
      VALUES (?, ?, ?, ?, ?)
    `, [user.id, scenarioType, score, duration, JSON.stringify(stepsData)]) as any;

    res.status(201).json({
      message: 'Training record submitted successfully',
      recordId: result.lastID
    });
  } catch (error) {
    console.error('Failed to submit training record:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 获取用户训练记录 - 需要认证
router.get('/records', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const records = await dbAll(`
      SELECT 
        tr.*,
        s.name as scenario_name
      FROM training_records tr
      LEFT JOIN scenarios s ON tr.scenario_type = s.type
      WHERE tr.user_id = ?
      ORDER BY tr.completed_at DESC
      LIMIT ? OFFSET ?
    `, [user.id, limit, offset]) as any[];

    const total = await dbGet(
      'SELECT COUNT(*) as count FROM training_records WHERE user_id = ?',
      [user.id]
    ) as any;

    const formattedRecords = records.map((record: any) => ({
      ...record,
      steps_data: JSON.parse(record.steps_data || '[]')
    }));

    res.json({
      records: formattedRecords,
      pagination: {
        page,
        limit,
        total: total.count,
        pages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    console.error('Failed to get training records:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 获取用户最佳成绩 - 需要认证
router.get('/best-scores', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const bestScores = await dbAll(`
      SELECT 
        scenario_type,
        MAX(score) as best_score,
        MIN(duration) as best_time,
        COUNT(*) as attempts,
        AVG(score) as avg_score
      FROM training_records 
      WHERE user_id = ?
      GROUP BY scenario_type
    `, [user.id]);

    res.json({ bestScores });
  } catch (error) {
    console.error('Failed to get best scores:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 获取所有训练记录（管理员）- 需要管理员权限
router.get('/all-records', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const records = await dbAll(`
      SELECT 
        tr.*,
        u.username,
        s.name as scenario_name
      FROM training_records tr
      JOIN users u ON tr.user_id = u.id
      LEFT JOIN scenarios s ON tr.scenario_type = s.type
      ORDER BY tr.completed_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]) as any[];

    const total = await dbGet('SELECT COUNT(*) as count FROM training_records') as any;

    const formattedRecords = records.map((record: any) => ({
      ...record,
      steps_data: JSON.parse(record.steps_data || '[]')
    }));

    res.json({
      records: formattedRecords,
      pagination: {
        page,
        limit,
        total: total.count,
        pages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    console.error('Failed to get all training records:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;