/**
 * 用户相关类型定义
 */

// 用户基础信息
export interface User {
    id: string;
    email: string;
    username: string;
    createdAt: string;
    updatedAt: string;
}

// 数据库中的用户（包含密码）
export interface UserInDB extends User {
    password: string;
}

// 用户注册请求
export interface RegisterRequest {
    email: string;
    password: string;
    username: string;
}

// 用户登录请求
export interface LoginRequest {
    email: string;
    password: string;
}

// 登录响应
export interface LoginResponse {
    user: User;
    token: string;
    expiresIn: number;
}

// Token数据
export interface TokenData {
    userId: string;
    expiresAt: number;
}
