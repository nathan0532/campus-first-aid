// 调试登录问题的脚本
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const bcrypt = require('bcryptjs');

console.log('🔍 开始调试登录问题...\n');

// 1. 检查数据库中的用户
function checkDatabase() {
  return new Promise((resolve, reject) => {
    console.log('📊 检查数据库中的用户...');
    
    const db = new sqlite3.Database('./backend/database/app.db', (err) => {
      if (err) {
        console.error('❌ 无法连接数据库:', err.message);
        reject(err);
        return;
      }
      console.log('✅ 数据库连接成功');
    });

    db.all('SELECT id, username, email, role, created_at FROM users', [], (err, rows) => {
      if (err) {
        console.error('❌ 查询用户失败:', err.message);
        reject(err);
        return;
      }
      
      console.log(`📋 找到 ${rows.length} 个用户:`);
      rows.forEach(row => {
        console.log(`  - ${row.username} (${row.role}) - ${row.email}`);
      });
      
      // 检查demo用户的密码hash
      db.get('SELECT username, password_hash FROM users WHERE username = "demo"', [], (err, row) => {
        if (err) {
          console.error('❌ 查询demo用户失败:', err.message);
          reject(err);
          return;
        }
        
        if (row) {
          console.log('\n🔐 Demo用户密码验证:');
          console.log(`用户名: ${row.username}`);
          console.log(`密码Hash: ${row.password_hash.substring(0, 20)}...`);
          
          // 验证密码
          bcrypt.compare('demo123', row.password_hash, (err, result) => {
            if (err) {
              console.error('❌ 密码验证失败:', err);
            } else {
              console.log(`密码验证结果: ${result ? '✅ 正确' : '❌ 错误'}`);
            }
            db.close();
            resolve(rows);
          });
        } else {
          console.log('❌ 未找到demo用户');
          db.close();
          resolve(rows);
        }
      });
    });
  });
}

// 2. 检查后端服务
async function checkBackend() {
  console.log('\n🌐 检查后端服务...');
  
  try {
    const response = await axios.get('http://localhost:5001/api/health', {
      timeout: 5000
    });
    console.log('✅ 后端服务正常运行');
    console.log('响应:', response.data);
    return true;
  } catch (error) {
    console.error('❌ 后端服务连接失败:');
    if (error.code === 'ECONNREFUSED') {
      console.error('  - 服务器未启动或端口5000未监听');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('  - 连接超时');
    } else {
      console.error('  -', error.message);
    }
    return false;
  }
}

// 3. 测试登录API
async function testLogin() {
  console.log('\n🔑 测试登录API...');
  
  try {
    const response = await axios.post('http://localhost:5001/api/users/login', {
      username: 'demo',
      password: 'demo123'
    }, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ 登录API测试成功');
    console.log('响应数据:', {
      message: response.data.message,
      user: response.data.user,
      token: response.data.token ? `${response.data.token.substring(0, 20)}...` : 'null'
    });
    return true;
  } catch (error) {
    console.error('❌ 登录API测试失败:');
    if (error.response) {
      console.error('  - 状态码:', error.response.status);
      console.error('  - 错误信息:', error.response.data);
    } else {
      console.error('  -', error.message);
    }
    return false;
  }
}

// 执行所有检查
async function runDiagnostics() {
  try {
    await checkDatabase();
    const backendOk = await checkBackend();
    
    if (backendOk) {
      await testLogin();
    }
    
    console.log('\n📋 诊断摘要:');
    console.log('如果以上都显示正常，但前端仍然登录失败，可能的原因:');
    console.log('1. 前端API地址配置错误');
    console.log('2. CORS问题');
    console.log('3. 网络连接问题');
    console.log('4. 浏览器控制台有具体错误信息');
    
  } catch (error) {
    console.error('\n❌ 诊断过程中出现错误:', error.message);
  }
}

runDiagnostics();