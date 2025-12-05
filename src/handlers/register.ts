import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import userService from '../services/UserService';
import { ResponseBuilder } from '../utils/response';
import { Validator } from '../utils/validator';
import type { RegisterRequest } from '../types';

/**
 * Lambda Handler - 用户注册
 */
export const handler = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    console.log('📝 Register Lambda invoked');
    console.log('Event:', JSON.stringify(event, null, 2));
    console.log('Context:', context);

    try {
        // 1. 解析请求体
        let body: Partial<RegisterRequest>;

        try {
            body = typeof event.body === 'string'
                ? JSON.parse(event.body)
                : event.body || {};
        } catch (error) {
            return ResponseBuilder.error('Invalid JSON in request body', 400);
        }

        // 2. 参数验证
        const validation = Validator.validateRegisterData(body);
        if (!validation.valid) {
            return ResponseBuilder.validationError(validation.errors.join(', '));
        }

        // 3. 调用服务层注册用户（此时已验证，可以断言类型）
        const user = await userService.register(body as RegisterRequest);

        // 4. 返回成功响应
        return ResponseBuilder.success({ user }, 'User registered successfully');

    } catch (error) {
        console.error('❌ Registration error:', error);

        // 业务错误
        if (error instanceof Error && error.message === 'Email already exists') {
            return ResponseBuilder.error(error.message, 409, 'EMAIL_EXISTS');
        }

        // 未知错误
        return ResponseBuilder.serverError('Registration failed');
    }
};
