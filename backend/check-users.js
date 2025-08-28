// 简单检查数据库中的用户
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database/app.db');
console.log('数据库路径:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('无法连接数据库:', err.message);
    return;
  }
  console.log('✅ 数据库连接成功');
});

// 检查用户表是否存在
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
  if (err) {
    console.error('查询表失败:', err.message);
    return;
  }
  
  if (row) {
    console.log('✅ users表存在');
    
    // 查询所有用户
    db.all('SELECT id, username, email, role, created_at FROM users', (err, rows) => {
      if (err) {
        console.error('查询用户失败:', err.message);
        return;
      }
      
      console.log(`📋 找到 ${rows.length} 个用户:`);
      rows.forEach(row => {
        console.log(`  - ID:${row.id} ${row.username} (${row.role}) - ${row.email} [${row.created_at}]`);
      });
      
      if (rows.length === 0) {
        console.log('❌ 数据库中没有用户，需要重新初始化');
      }
      
      db.close();
    });
  } else {
    console.log('❌ users表不存在，需要初始化数据库');
    db.close();
  }
});