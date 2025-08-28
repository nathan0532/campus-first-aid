// 简单的测试脚本，验证认证系统
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000/api';

async function testAuth() {
  console.log('🚀 开始测试认证系统...\n');
  
  try {
    // 1. 测试无认证访问训练场景
    console.log('1. 测试未登录访问训练场景...');
    const unAuthResponse = await fetch(`${API_BASE}/training/scenarios`);
    console.log(`   状态码: ${unAuthResponse.status}`);
    console.log(`   期望: 401 (未授权)`);
    console.log(`   结果: ${unAuthResponse.status === 401 ? '✅ 通过' : '❌ 失败'}\n`);
    
    // 2. 登录获取token
    console.log('2. 测试用户登录...');
    const loginResponse = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'demo', password: 'demo123' })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      const token = loginData.token;
      console.log(`   登录成功，获得token: ${token.substring(0, 20)}...`);
      console.log(`   结果: ✅ 通过\n`);
      
      // 3. 使用token访问训练场景
      console.log('3. 测试已登录访问训练场景...');
      const authResponse = await fetch(`${API_BASE}/training/scenarios`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log(`   状态码: ${authResponse.status}`);
      console.log(`   期望: 200 (成功)`);
      console.log(`   结果: ${authResponse.status === 200 ? '✅ 通过' : '❌ 失败'}\n`);
      
    } else {
      console.log(`   登录失败，状态码: ${loginResponse.status}`);
      console.log(`   结果: ❌ 失败\n`);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testAuth();