/**
 * 本地测试Lambda函数
 * 模拟API Gateway事件
 */
import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { handler as registerHandler } from '../src/handlers/register';
import { handler as loginHandler } from '../src/handlers/login';
import { handler as getUserHandler } from '../src/handlers/getUserInfo';

// 模拟Lambda Context
const mockContext: Context = {
    functionName: 'test-function',
    functionVersion: '1',
    invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:test',
    memoryLimitInMB: '128',
    awsRequestId: 'test-aws-request-id',
    logGroupName: '/aws/lambda/test',
    logStreamName: '2024/01/01/[$LATEST]test',
    getRemainingTimeInMillis: () => 30000,
    done: () => { },
    fail: () => { },
    succeed: () => { },
    callbackWaitsForEmptyEventLoop: true
};

/**
 * 创建模拟的API Gateway事件
 */
function createMockEvent(
    body: Record<string, any>,
    headers: Record<string, string> = {}
): APIGatewayProxyEvent {
    return {
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            ...headers
        },
        multiValueHeaders: {},
        httpMethod: 'POST',
        isBase64Encoded: false,
        path: '/test',
        pathParameters: null,
        queryStringParameters: null,
        multiValueQueryStringParameters: null,
        stageVariables: null,
        requestContext: {
            accountId: '123456789012',
            apiId: 'test-api-id',
            protocol: 'HTTP/1.1',
            httpMethod: 'POST',
            path: '/test',
            stage: 'test',
            requestId: 'test-request-id',
            requestTime: '01/Jan/2024:00:00:00 +0000',
            requestTimeEpoch: Date.now(),
            resourceId: 'test-resource-id',
            resourcePath: '/test',
            identity: {
                accessKey: null,
                accountId: null,
                apiKey: null,
                apiKeyId: null,
                caller: null,
                clientCert: null,
                cognitoAuthenticationProvider: null,
                cognitoAuthenticationType: null,
                cognitoIdentityId: null,
                cognitoIdentityPoolId: null,
                principalOrgId: null,
                sourceIp: '127.0.0.1',
                user: null,
                userAgent: 'test-agent',
                userArn: null
            },
            authorizer: null
        },
        resource: '/test'
    };
}

/**
 * 测试注册
 */
async function testRegister(): Promise<void> {
    console.log('\n========== 测试用户注册 ==========');

    const event = createMockEvent({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser'
    });

    const response = await registerHandler(event, mockContext);
    console.log('Response:', JSON.stringify(JSON.parse(response.body), null, 2));
}

/**
 * 测试登录
 */
async function testLogin(): Promise<string | null> {
    console.log('\n========== 测试用户登录 ==========');

    const event = createMockEvent({
        email: 'test@example.com',
        password: 'password123'
    });

    const response = await loginHandler(event, mockContext);
    const body = JSON.parse(response.body);
    console.log('Response:', JSON.stringify(body, null, 2));

    return body.data?.token || null;
}

/**
 * 测试获取用户信息
 */
async function testGetUser(token: string): Promise<void> {
    console.log('\n========== 测试获取用户信息 ==========');

    const event = createMockEvent({}, {
        'Authorization': `Bearer ${token}`
    });

    const response = await getUserHandler(event, mockContext);
    console.log('Response:', JSON.stringify(JSON.parse(response.body), null, 2));
}

/**
 * 完整流程测试
 */
async function runFullTest(): Promise<void> {
    try {
        // 1. 注册
        await testRegister();

        // 2. 登录获取Token
        const token = await testLogin();

        // 3. 使用Token获取用户信息
        if (token) {
            await testGetUser(token);
        }

        console.log('\n✅ 所有测试完成！');

    } catch (error) {
        console.error('\n❌ 测试失败:', error);
        process.exit(1);
    }
}

// 根据命令行参数运行测试
const testType = process.argv[2] || 'full';

(async () => {
    switch (testType) {
        case 'register':
            await testRegister();
            break;
        case 'login':
            await testRegister();
            await testLogin();
            break;
        case 'getUser':
            await testRegister();
            const token = await testLogin();
            if (token) await testGetUser(token);
            break;
        default:
            await runFullTest();
    }
})();
