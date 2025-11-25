# Auth - AWS Lambda用户注册服务

基于AWS Lambda的用户注册服务，实现了完整的用户注册功能，包括输入验证、密码加密和数据存储。

## 功能特性

- ✅ 用户注册API
- ✅ 输入验证（用户名、邮箱、密码）
- ✅ 密码加密（bcrypt）
- ✅ 唯一性检查（防止重复注册）
- ✅ CORS支持
- ✅ 完整的错误处理
- ✅ DynamoDB集成（可选）
- ✅ 内存存储模式（用于测试）

## 项目结构

```
Auth/
├── index.js              # Lambda主处理函数（内存存储版本）
├── dynamodb-handler.js   # DynamoDB集成版本
├── serverless.yml        # Serverless Framework配置
├── test-local.js         # 本地测试脚本
├── package.json          # Node.js依赖配置
├── API.md               # API文档
├── DEPLOYMENT.md        # 部署指南
└── README.md            # 项目说明
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 本地测试

```bash
node test-local.js
```

### 3. 部署到AWS

#### 使用Serverless Framework

```bash
# 安装Serverless Framework
npm install -g serverless

# 配置AWS凭证
serverless config credentials --provider aws --key YOUR_KEY --secret YOUR_SECRET

# 部署
serverless deploy
```

部署成功后，您将获得API Gateway端点URL。

## API使用

### 注册新用户

```bash
curl -X POST https://your-api-gateway-url/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "张三",
    "email": "zhangsan@example.com",
    "password": "password123"
  }'
```

**成功响应:**
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

详细的API文档请查看 [API.md](./API.md)

## 验证规则

- **用户名**: 至少2个字符
- **邮箱**: 有效的邮箱格式
- **密码**: 至少6个字符

## 两种实现方式

### 1. 内存存储版本 (index.js)
- 适合开发和测试
- 使用JavaScript Map存储用户数据
- 无需配置AWS服务
- Lambda实例重启后数据丢失

### 2. DynamoDB版本 (dynamodb-handler.js)
- 适合生产环境
- 持久化存储
- 支持高并发
- 需要配置DynamoDB表

要使用DynamoDB版本，请修改 `serverless.yml` 中的handler配置：
```yaml
functions:
  register:
    handler: dynamodb-handler.handler  # 改用DynamoDB版本
```

## 安全特性

1. **密码加密**: 使用bcrypt算法（成本因子10）
2. **输入验证**: 严格的前置验证
3. **唯一性约束**: 防止重复注册
4. **错误处理**: 不泄露敏感信息
5. **CORS配置**: 支持跨域请求

## 本地开发

### 运行测试
```bash
node test-local.js
```

测试脚本包含多个场景：
- ✅ 成功注册
- ✅ 重复注册检测
- ✅ 输入验证（用户名、邮箱、密码）
- ✅ HTTP方法验证
- ✅ CORS预检请求

## 环境要求

- Node.js 18.x 或更高版本
- AWS账户（用于部署）
- AWS CLI（可选，用于手动部署）

## 部署指南

详细的部署步骤请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 许可证

ISC
