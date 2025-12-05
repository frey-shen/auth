import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import userService from '../services/UserService';
import { ResponseBuilder } from '../utils/response';
import { Validator } from '../utils/validator';
import type { LoginRequest } from '../types';

/**
 * Lambda Handler - 用户登录
 */
export const handler = async (
    event: APIGatewayProxyEvent,
    _context: Context
): Promise<APIGatewayProxyResult> => {
    console.log('🔐 Login Lambda invoked');

    try {
        // 解析请求
        let body: Partial<LoginRequest>;

        try {
            body = typeof event.body === 'string'
                ? JSON.parse(event.body)
                : event.body || {};
        } catch (error) {
            return ResponseBuilder.error('Invalid JSON in request body', 400);
        }

        // 验证参数
        const validation = Validator.validateLoginData(body);
        if (!validation.valid) {
            return ResponseBuilder.validationError(validation.errors.join(', '));
        }

        // 执行登录（已验证，可以断言类型）
        const { email, password } = body as LoginRequest;
        const result = await userService.login(email, password);

        return ResponseBuilder.success(result, 'Login successful');

    } catch (error) {
        console.error('❌ Login error:', error);

        if (error instanceof Error && error.message === 'Invalid email or password') {
            return ResponseBuilder.unauthorized(error.message);
        }

        return ResponseBuilder.serverError('Login failed');
    }
};
