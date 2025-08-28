// Vercel Edge Function - 健康检查
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.status(200).json({
    status: 'OK',
    message: 'LifeSkill API 运行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
}