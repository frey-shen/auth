import type { AppConfig } from './types/lambda';

export const CONFIG: AppConfig = {
  // 环境变量（在Lambda中从process.env读取）
  REGION: process.env.AWS_REGION || 'us-east-1',
  TABLE_NAME: process.env.USERS_TABLE || 'Users',

  // 应用配置
  PASSWORD_MIN_LENGTH: 6,
  TOKEN_EXPIRY: 3600, // 1小时（秒）

  // 模拟模式（本地测试用）
  MOCK_MODE: process.env.MOCK_MODE === 'true'
};
