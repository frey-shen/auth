/**
 * 本地测试Lambda函数
 * 模拟API Gateway事件
 */
import { handler as registerHandler } from '../src/handlers/register.js';
import { handler as loginHandler } from '../src/handlers/login.js';
import { handler as getUserHandler } from '../src/handlers/getUserInfo.js';

// 模拟Lambda Context
const mockContext = {
    functionName: 'test-function',
    requestId: 'test-request-id',
    awsRequestId: 'test-aws-request-id'
};

/**
 * 创建模拟的API Gateway事件
 */
function createMockEvent(body, headers = {}) {
    return {
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            ...headers
        },
        httpMethod: 'POST',
        path: '/test',
        queryStringParameters: null,
        isBase64Encoded: false
    };
}

/**
 * 测试注册
 */
async function testRegister() {
    console.log('\n========== 测试用户注册 ==========');

    const event = createMockEvent({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser'
    });

    const response = await registerHandler(event, mockContext);
    console.log('Response:', JSON.stringify(JSON.parse(response.body), null, 2));

    return response;
}

/**
 * 测试登录
 */
async function testLogin() {
    console.log('\n========== 测试用户登录 ==========');

    const event = createMockEvent({
        email: 'test@example.com',
        password: 'password123'
    });

    const response = await loginHandler(event, mockContext);
    const body = JSON.parse(response.body);
    console.log('Response:', JSON.stringify(body, null, 2));

    return body.data?.token;
}

/**
 * 测试获取用户信息
 */
async function testGetUser(token) {
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
async function runFullTest() {
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
    }
}

// 根据命令行参数运行测试
const testType = process.argv[2] || 'full';

switch (testType) {
    case 'register':
        testRegister();
        break;
    case 'login':
        testRegister().then(testLogin);
        break;
    case 'getUser':
        testRegister().then(testLogin).then(testGetUser);
        break;
    default:
        runFullTest();
}
