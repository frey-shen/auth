import userService from '../services/UserService.js';
import { ResponseBuilder } from '../utils/response.js';
import { Validator } from '../utils/validator.js';

/**
 * Lambda Handler - 用户登录
 */
export const handler = async (event, context) => {
    console.log('🔐 Login Lambda invoked');

    try {
        // 解析请求
        const body = typeof event.body === 'string'
            ? JSON.parse(event.body)
            : event.body;

        // 验证参数
        const validation = Validator.validateLoginData(body);
        if (!validation.valid) {
            return ResponseBuilder.error(
                validation.errors.join(', '),
                400,
                'VALIDATION_ERROR'
            );
        }

        // 执行登录
        const result = await userService.login(body.email, body.password);

        return ResponseBuilder.success(result, 'Login successful');

    } catch (error) {
        console.error('❌ Login error:', error);

        if (error.message === 'Invalid email or password') {
            return ResponseBuilder.unauthorized(error.message);
        }

        return ResponseBuilder.serverError('Login failed');
    }
};
