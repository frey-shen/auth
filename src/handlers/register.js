import userService from '../services/UserService.js';
import { ResponseBuilder } from '../utils/response.js';
import { Validator } from '../utils/validator.js';

/**
 * Lambda Handler - 用户注册
 * 
 * @param {Object} event - API Gateway事件对象
 * @param {Object} context - Lambda上下文
 * @returns {Object} API Gateway响应
 */
export const handler = async (event, context) => {
    // Lambda日志（会显示在CloudWatch）
    console.log('📝 Register Lambda invoked');
    console.log('Event:', JSON.stringify(event, null, 2));
    console.log('Context:', context);

    try {
        // 1. 解析请求体（API Gateway会把body作为字符串传递）
        let body;
        try {
            body = typeof event.body === 'string'
                ? JSON.parse(event.body)
                : event.body;
        } catch (error) {
            return ResponseBuilder.error('Invalid JSON in request body', 400);
        }

        // 2. 参数验证
        const validation = Validator.validateRegisterData(body);
        if (!validation.valid) {
            return ResponseBuilder.error(
                validation.errors.join(', '),
                400,
                'VALIDATION_ERROR'
            );
        }

        // 3. 调用服务层注册用户
        const user = await userService.register({
            email: body.email,
            password: body.password,
            username: body.username
        });

        // 4. 返回成功响应
        return ResponseBuilder.success(
            { user },
            'User registered successfully'
        );

    } catch (error) {
        // 错误处理
        console.error('❌ Registration error:', error);

        // 业务错误
        if (error.message === 'Email already exists') {
            return ResponseBuilder.error(error.message, 409, 'EMAIL_EXISTS');
        }

        // 未知错误
        return ResponseBuilder.serverError('Registration failed');
    }
};
