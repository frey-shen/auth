import userService from '../services/UserService.js';
import { ResponseBuilder } from '../utils/response.js';

/**
 * Lambda Handler - 获取用户信息
 * 需要认证（从Header获取Token）
 */
export const handler = async (event, context) => {
    console.log('👤 GetUserInfo Lambda invoked');

    try {
        // 从请求头获取Token（API Gateway会传递headers）
        const token = event.headers?.Authorization?.replace('Bearer ', '')
            || event.headers?.authorization?.replace('Bearer ', '');

        if (!token) {
            return ResponseBuilder.unauthorized('Token is required');
        }

        // 通过Token获取用户信息
        const user = await userService.getUserByToken(token);

        return ResponseBuilder.success({ user }, 'User info retrieved');

    } catch (error) {
        console.error('❌ GetUserInfo error:', error);

        if (error.message === 'Invalid or expired token') {
            return ResponseBuilder.unauthorized(error.message);
        }

        return ResponseBuilder.serverError('Failed to get user info');
    }
};
