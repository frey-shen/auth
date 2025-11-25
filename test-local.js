/**
 * 本地测试脚本
 * 用于测试Lambda函数的各种场景
 */

const { handler } = require('./index');

// 测试用例
const testCases = [
  {
    name: '成功注册用户',
    event: {
      httpMethod: 'POST',
      body: JSON.stringify({
        username: '张三',
        email: 'zhangsan@example.com',
        password: 'password123'
      })
    }
  },
  {
    name: '重复注册（应失败）',
    event: {
      httpMethod: 'POST',
      body: JSON.stringify({
        username: '张三',
        email: 'zhangsan@example.com',
        password: 'password456'
      })
    }
  },
  {
    name: '用户名太短（应失败）',
    event: {
      httpMethod: 'POST',
      body: JSON.stringify({
        username: 'a',
        email: 'test@example.com',
        password: 'password123'
      })
    }
  },
  {
    name: '邮箱格式错误（应失败）',
    event: {
      httpMethod: 'POST',
      body: JSON.stringify({
        username: '李四',
        email: 'invalid-email',
        password: 'password123'
      })
    }
  },
  {
    name: '密码太短（应失败）',
    event: {
      httpMethod: 'POST',
      body: JSON.stringify({
        username: '王五',
        email: 'wangwu@example.com',
        password: '12345'
      })
    }
  },
  {
    name: 'GET请求（应失败）',
    event: {
      httpMethod: 'GET',
      body: '{}'
    }
  },
  {
    name: 'OPTIONS请求（CORS预检）',
    event: {
      httpMethod: 'OPTIONS',
      body: '{}'
    }
  }
];

// 运行测试
async function runTests() {
  console.log('='.repeat(60));
  console.log('开始运行Lambda函数测试');
  console.log('='.repeat(60));
  
  for (let i = 0; i < testCases.length; i++) {
    const test = testCases[i];
    console.log(`\n测试 ${i + 1}: ${test.name}`);
    console.log('-'.repeat(60));
    
    try {
      const result = await handler(test.event);
      console.log('状态码:', result.statusCode);
      console.log('响应:', JSON.parse(result.body));
    } catch (error) {
      console.error('错误:', error.message);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('测试完成');
  console.log('='.repeat(60));
}

// 执行测试
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
