import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initializeDatabase } from './database/init';
import userRoutes from './routes/users';
import trainingRoutes from './routes/training';
import statsRoutes from './routes/stats';
import videoRoutes from './routes/videos';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/videos', videoRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: '校园急救训练系统 API 运行正常',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    console.log('数据库初始化完成');
    
    app.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`);
      console.log(`健康检查: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();