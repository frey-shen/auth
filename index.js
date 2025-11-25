const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// 模拟数据库存储（实际应用中应使用DynamoDB）
const users = new Map();

/**
 * 验证用户输入
 * @param {Object} userData - 用户数据
 * @returns {Object} - 验证结果
 */
function validateUserInput(userData) {
  const errors = [];
  
  // 获取实际字符数（而非字节数）
  const usernameLength = userData.username ? [...userData.username.trim()].length : 0;
  
  if (!userData.username || usernameLength < 2) {
    errors.push('用户名必须至少2个字符');
  }
  
  if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
    errors.push('邮箱格式不正确');
  }
  
  if (!userData.password || userData.password.length < 6) {
    errors.push('密码必须至少6个字符');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 检查用户是否已存在
 * @param {string} username - 用户名
 * @param {string} email - 邮箱
 * @returns {boolean} - 用户是否已存在
 */
function checkUserExists(username, email) {
  for (const user of users.values()) {
    if (user.username === username || user.email === email) {
      return true;
    }
  }
  return false;
}

/**
 * 注册新用户
 * @param {Object} userData - 用户数据
 * @returns {Promise<Object>} - 注册结果
 */
async function registerUser(userData) {
  const { username, email, password } = userData;
  
  // 检查用户是否已存在
  if (checkUserExists(username, email)) {
    throw new Error('用户名或邮箱已存在');
  }
  
  // 密码加密
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  // 创建用户对象
  const userId = uuidv4();
  const newUser = {
    userId,
    username,
    email,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // 保存到"数据库"
  users.set(userId, newUser);
  
  // 返回用户信息（不包含密码）
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
}

/**
 * AWS Lambda处理函数
 * @param {Object} event - Lambda事件对象
 * @returns {Promise<Object>} - HTTP响应
 */
exports.handler = async (event) => {
  // 设置CORS头
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
  
  try {
    // 处理OPTIONS请求（CORS预检）
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'OK' })
      };
    }
    
    // 只接受POST请求
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ 
          success: false,
          message: '仅支持POST方法' 
        })
      };
    }
    
    // 解析请求体
    const userData = JSON.parse(event.body);
    
    // 验证输入
    const validation = validateUserInput(userData);
    if (!validation.isValid) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: '输入验证失败',
          errors: validation.errors
        })
      };
    }
    
    // 注册用户
    const newUser = await registerUser(userData);
    
    // 返回成功响应
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        message: '用户注册成功',
        data: newUser
      })
    };
    
  } catch (error) {
    console.error('注册错误:', error);
    
    // 返回错误响应
    return {
      statusCode: error.message.includes('已存在') ? 409 : 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: error.message || '注册失败，请稍后重试'
      })
    };
  }
};
