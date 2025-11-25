# 部署指南

本指南将帮助您将用户注册Lambda函数部署到AWS。

## 前置要求

1. AWS账户
2. Node.js 18.x或更高版本
3. AWS CLI或Serverless Framework

## 方法一：使用Serverless Framework（推荐）

### 1. 安装Serverless Framework

```bash
npm install -g serverless
```

### 2. 配置AWS凭证

```bash
serverless config credentials --provider aws --key YOUR_ACCESS_KEY --secret YOUR_SECRET_KEY
```

或者配置AWS CLI：
```bash
aws configure
```

### 3. 安装项目依赖

```bash
npm install
```

### 4. 部署到AWS

```bash
# 部署到开发环境
serverless deploy

# 部署到生产环境
serverless deploy --stage prod

# 部署到特定区域
serverless deploy --region us-west-2
```

### 5. 查看部署信息

部署成功后，您将看到类似输出：
```
Service Information
service: auth-service
stage: dev
region: us-east-1
stack: auth-service-dev
api keys:
  None
endpoints:
  POST - https://abc123.execute-api.us-east-1.amazonaws.com/dev/register
functions:
  register: auth-service-dev-register
```

### 6. 测试部署的API

```bash
curl -X POST https://YOUR_API_ENDPOINT/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "测试用户",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 7. 查看日志

```bash
serverless logs -f register -t
```

### 8. 删除部署（如需要）

```bash
serverless remove
```

## 方法二：使用AWS CLI和Lambda控制台

### 1. 准备部署包

```bash
# 安装依赖
npm install

# 创建部署包
zip -r function.zip index.js node_modules/ package.json
```

### 2. 创建IAM角色

创建一个Lambda执行角色，附加以下策略：
- AWSLambdaBasicExecutionRole
- AmazonDynamoDBFullAccess（如果使用DynamoDB）

### 3. 创建Lambda函数

```bash
aws lambda create-function \
  --function-name user-registration \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --timeout 30 \
  --memory-size 256
```

### 4. 创建API Gateway

通过AWS控制台创建API Gateway：
1. 创建REST API
2. 创建资源 `/register`
3. 创建POST方法
4. 集成Lambda函数
5. 启用CORS
6. 部署API

### 5. 创建DynamoDB表（如使用DynamoDB版本）

```bash
aws dynamodb create-table \
  --table-name auth-service-dev-users \
  --attribute-definitions \
    AttributeName=userId,AttributeType=S \
    AttributeName=email,AttributeType=S \
  --key-schema \
    AttributeName=userId,KeyType=HASH \
  --global-secondary-indexes \
    "[{\"IndexName\":\"EmailIndex\",\"KeySchema\":[{\"AttributeName\":\"email\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":1,\"WriteCapacityUnits\":1}}]" \
  --provisioned-throughput \
    ReadCapacityUnits=1,WriteCapacityUnits=1
```

## 方法三：使用AWS SAM

### 1. 安装AWS SAM CLI

参考：https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html

### 2. 创建SAM模板（template.yaml）

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: User Registration Lambda Function

Globals:
  Function:
    Timeout: 30
    Runtime: nodejs18.x

Resources:
  RegisterFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: ./
      Handler: index.handler
      Events:
        RegisterApi:
          Type: Api
          Properties:
            Path: /register
            Method: post
```

### 3. 部署

```bash
# 构建
sam build

# 部署
sam deploy --guided
```

## 环境变量配置

如果使用DynamoDB版本，需要设置以下环境变量：

```yaml
# 在serverless.yml中
provider:
  environment:
    DYNAMODB_TABLE: ${self:service}-${self:provider.stage}-users
```

或在Lambda控制台中手动设置：
- `DYNAMODB_TABLE`: DynamoDB表名

## 监控和日志

### CloudWatch日志
所有Lambda执行日志都会自动发送到CloudWatch Logs。

查看日志：
```bash
# 使用Serverless Framework
serverless logs -f register -t

# 使用AWS CLI
aws logs tail /aws/lambda/user-registration --follow
```

### CloudWatch指标
监控以下指标：
- 调用次数
- 错误率
- 持续时间
- 并发执行数

## 成本估算

基于AWS免费套餐：
- Lambda: 前100万次请求/月免费
- DynamoDB: 25GB存储 + 25个读写单位免费
- API Gateway: 前100万次API调用/月免费

预计月度成本（超出免费额度后）：
- 小规模使用（<10万用户/月）：$0-5
- 中等规模使用（10-100万用户/月）：$5-50

## 安全建议

1. **启用API密钥或认证**：在生产环境中添加API Gateway的认证
2. **限流**：配置API Gateway的使用计划和限流
3. **加密**：启用DynamoDB表的加密
4. **VPC**：将Lambda放入VPC中（如有需要）
5. **最小权限**：为Lambda角色配置最小必需权限

## 故障排查

### 常见问题

**问题1：部署失败 - 权限不足**
```
解决方案：确保AWS凭证具有足够权限，包括Lambda、API Gateway、DynamoDB和CloudFormation
```

**问题2：Lambda超时**
```
解决方案：增加Lambda超时时间（默认3秒，建议设置为30秒）
```

**问题3：CORS错误**
```
解决方案：确保API Gateway和Lambda响应都正确设置了CORS头
```

**问题4：无法连接DynamoDB**
```
解决方案：检查Lambda执行角色是否有DynamoDB权限，确认表名和环境变量是否正确
```

## 更新部署

### 更新代码
```bash
serverless deploy
```

### 仅更新函数代码（更快）
```bash
serverless deploy function -f register
```

### 回滚到上一个版本
```bash
serverless rollback -t TIMESTAMP
```

## 参考资源

- [AWS Lambda文档](https://docs.aws.amazon.com/lambda/)
- [Serverless Framework文档](https://www.serverless.com/framework/docs/)
- [API Gateway文档](https://docs.aws.amazon.com/apigateway/)
- [DynamoDB文档](https://docs.aws.amazon.com/dynamodb/)
