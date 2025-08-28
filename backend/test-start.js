// 简单的测试脚本来检查后端是否能启动
const express = require('express');

console.log('测试基本Express服务器...');

const app = express();
const PORT = 5001; // 使用不同的端口避免冲突

app.get('/test', (req, res) => {
  res.json({ status: 'OK', message: '测试服务器运行正常' });
});

app.listen(PORT, () => {
  console.log(`测试服务器运行在端口 ${PORT}`);
  console.log(`访问: http://localhost:${PORT}/test`);
  setTimeout(() => {
    console.log('测试完成，停止服务器...');
    process.exit(0);
  }, 2000);
});