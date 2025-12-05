import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import userService from '../services/UserService';
import { ResponseBuilder } from '../utils/response';

/**
 * Lambda Handler - 获取用户信息
 * 需要认证（从Header获取Token）
 */
export const handler = async (
    event: APIGatewayProxyEvent,
    _context: Context
): Promise<APIGatewayProxyResult> => {
    console.log('👤 GetUserInfo Lambda invoked');

    try {
        // 从请求头获取Token（兼容大小写）
        const authHeader = event.headers?.Authorization || event.headers?.authorization;
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return ResponseBuilder.unauthorized('Token is required');
        }

        // 通过Token获取用户信息
        const user = await userService.getUserByToken(token);

        return ResponseBuilder.success({ user }, 'User info retrieved');

    } catch (error) {
        console.error('❌ GetUserInfo error:', error);

        if (error instanceof Error && error.message === 'Invalid or expired token') {
            return ResponseBuilder.unauthorized(error.message);
        }

        return ResponseBuilder.serverError('Failed to get user info');
    }
};
