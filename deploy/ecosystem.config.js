// PM2 生产环境配置
module.exports = {
  apps: [{
    name: 'cert-simulator-backend',
    script: './simple-server.js',
    cwd: '/var/www/cert-simulator/backend',
    
    // 实例配置
    instances: 2,
    exec_mode: 'cluster',
    
    // 环境变量
    env: {
      NODE_ENV: 'development',
      PORT: 5001,
      JWT_SECRET: 'dev-secret'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5001,
      JWT_SECRET: process.env.JWT_SECRET || 'production-secret-key',
      DB_PATH: './database/app.db',
      CORS_ORIGIN: 'https://your-domain.com'
    },
    
    // 日志配置
    log_file: '/var/log/pm2/cert-simulator-combined.log',
    out_file: '/var/log/pm2/cert-simulator-out.log',
    error_file: '/var/log/pm2/cert-simulator-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // 自动重启配置
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '500M',
    
    // 监控配置
    watch: false,
    ignore_watch: ['node_modules', 'logs', '*.log'],
    
    // 健康检查
    health_check_grace_period: 3000,
    health_check_fatal_exceptions: true,
    
    // 优雅退出
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 3000
  }]
};