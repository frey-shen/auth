/**
 * Lambda响应工具类
 */
export class ResponseBuilder {
  /**
   * 成功响应
   */
  static success(data, message = 'Success') {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // CORS
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
      })
    };
  }

  /**
   * 错误响应
   */
  static error(message, statusCode = 400, errorCode = null) {
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        message,
        errorCode,
        timestamp: new Date().toISOString()
      })
    };
  }

  /**
   * 验证失败
   */
  static validationError(errors) {
    return this.error('Validation failed', 400, 'VALIDATION_ERROR');
  }

  /**
   * 未授权
   */
  static unauthorized(message = 'Unauthorized') {
    return this.error(message, 401, 'UNAUTHORIZED');
  }

  /**
   * 服务器错误
   */
  static serverError(message = 'Internal server error') {
    console.error('Server Error:', message);
    return this.error(message, 500, 'INTERNAL_ERROR');
  }
}
