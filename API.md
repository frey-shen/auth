# 用户注册API文档

## 概述
这是一个基于AWS Lambda的用户注册服务，支持用户注册、输入验证和密码加密。

## API端点

### 注册用户
创建新的用户账户。

**端点:** `POST /register`

**请求头:**
```
Content-Type: application/json
```

**请求体:**
```json
{
  "username": "张三",
  "email": "zhangsan@example.com",
  "password": "password123"
}
```

**字段说明:**
- `username` (必填): 用户名，至少3个字符
- `email` (必填): 邮箱地址，必须是有效的邮箱格式
- `password` (必填): 密码，至少6个字符

**成功响应 (201 Created):**
```json
{
  "success": true,
  "message": "用户注册成功",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "username": "张三",
    "email": "zhangsan@example.com",
    "createdAt": "2023-11-25T08:00:00.000Z",
    "updatedAt": "2023-11-25T08:00:00.000Z"
  }
}
```

**错误响应:**

*验证失败 (400 Bad Request):*
```json
{
  "success": false,
  "message": "输入验证失败",
  "errors": [
    "用户名必须至少3个字符",
    "邮箱格式不正确"
  ]
}
```

*方法不允许 (405 Method Not Allowed):*
```json
{
  "success": false,
  "message": "仅支持POST方法"
}
```

*用户已存在 (409 Conflict):*
```json
{
  "success": false,
  "message": "用户名或邮箱已存在"
}
```

*服务器错误 (500 Internal Server Error):*
```json
{
  "success": false,
  "message": "注册失败，请稍后重试"
}
```

## 测试示例

### 使用curl
```bash
curl -X POST https://your-api-gateway-url/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "张三",
    "email": "zhangsan@example.com",
    "password": "password123"
  }'
```

### 使用JavaScript (fetch)
```javascript
const registerUser = async (userData) => {
  const response = await fetch('https://your-api-gateway-url/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  
  const data = await response.json();
  return data;
};

// 使用示例
registerUser({
  username: '张三',
  email: 'zhangsan@example.com',
  password: 'password123'
})
.then(response => console.log(response))
.catch(error => console.error(error));
```

### 使用Python (requests)
```python
import requests
import json

url = 'https://your-api-gateway-url/register'
headers = {'Content-Type': 'application/json'}
data = {
    'username': '张三',
    'email': 'zhangsan@example.com',
    'password': 'password123'
}

response = requests.post(url, headers=headers, data=json.dumps(data))
print(response.json())
```

## 安全特性

1. **密码加密**: 使用bcrypt算法加密存储密码
2. **输入验证**: 严格的输入验证防止无效数据
3. **CORS支持**: 配置了CORS以支持跨域请求
4. **去敏感信息**: 响应中不包含密码字段

## 注意事项

1. 密码必须至少6个字符（实际生产环境建议更长）
2. 邮箱地址必须唯一
3. 用户名必须至少3个字符
4. 所有敏感信息（如密码）都经过加密处理
