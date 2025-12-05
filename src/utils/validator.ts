import type { ValidationResult, RegisterRequest, LoginRequest } from '../types';

/**
 * 参数验证工具
 */
export class Validator {
    /**
     * 验证邮箱格式
     */
    static isValidEmail(email: string): boolean {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    /**
     * 验证密码强度
     */
    static isValidPassword(password: string, minLength: number = 6): boolean {
        return Boolean(password) && password.length >= minLength;
    }

    /**
     * 验证用户名
     */
    static isValidUsername(username: string): boolean {
        return Boolean(username) && username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
    }

    /**
     * 验证注册数据
     */
    static validateRegisterData(data: Partial<RegisterRequest>): ValidationResult {
        const errors: string[] = [];

        if (!data.email) {
            errors.push('Email is required');
        } else if (!this.isValidEmail(data.email)) {
            errors.push('Invalid email format');
        }

        if (!data.password) {
            errors.push('Password is required');
        } else if (!this.isValidPassword(data.password)) {
            errors.push('Password must be at least 6 characters');
        }

        if (!data.username) {
            errors.push('Username is required');
        } else if (!this.isValidUsername(data.username)) {
            errors.push('Username must be at least 3 characters and contain only letters, numbers, and underscores');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * 验证登录数据
     */
    static validateLoginData(data: Partial<LoginRequest>): ValidationResult {
        const errors: string[] = [];

        if (!data.email) {
            errors.push('Email is required');
        } else if (!this.isValidEmail(data.email)) {
            errors.push('Invalid email format');
        }

        if (!data.password) {
            errors.push('Password is required');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}
