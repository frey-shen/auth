import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

/**
 * Lambda相关类型定义
 */

// 标准API响应体
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    errorCode?: string;
    timestamp: string;
}

// Lambda Handler类型（已定义返回类型）
export type LambdaHandler = (
    event: APIGatewayProxyEvent,
    context: any
) => Promise<APIGatewayProxyResult>;

// 验证结果
export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

// 配置类型
export interface AppConfig {
    REGION: string;
    TABLE_NAME: string;
    PASSWORD_MIN_LENGTH: number;
    TOKEN_EXPIRY: number;
    MOCK_MODE: boolean;
}
