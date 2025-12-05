import type { APIGatewayProxyResult } from 'aws-lambda';
import type { ApiResponse } from '../types';

/**
 * Lambda响应工具类
 */
export class ResponseBuilder {
  /**
   * 构建标准响应
   */
  private static buildResponse<T>(
    statusCode: number,
    body: ApiResponse<T>
  ): APIGatewayProxyResult {
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(body)
    };
  }

  /**
   * 成功响应
   */
  static success<T>(data: T, message: string = 'Success'): APIGatewayProxyResult {
    return this.buildResponse(200, {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 错误响应
   */
  static error(
    message: string,
    statusCode: number = 400,
    errorCode?: string
  ): APIGatewayProxyResult {
    return this.buildResponse(statusCode, {
      success: false,
      message,
      errorCode,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 验证失败
   */
  static validationError(message: string): APIGatewayProxyResult {
    return this.error(message, 400, 'VALIDATION_ERROR');
  }

  /**
   * 未授权
   */
  static unauthorized(message: string = 'Unauthorized'): APIGatewayProxyResult {
    return this.error(message, 401, 'UNAUTHORIZED');
  }

  /**
   * 服务器错误
   */
  static serverError(message: string = 'Internal server error'): APIGatewayProxyResult {
    console.error('Server Error:', message);
    return this.error(message, 500, 'INTERNAL_ERROR');
  }
}
