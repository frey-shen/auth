import { v4 as uuidv4 } from 'uuid';
import { CONFIG } from '../config.js';

/**
 * 用户服务类
 */
class UserService {
    constructor() {
        // 模拟数据库（内存存储）
        this.mockDatabase = new Map();
        this.mockTokens = new Map();
    }

    /**
     * 简单的密码加密（实际项目用bcrypt）
     */
    hashPassword(password) {
        // 这里只是演示，实际要用bcrypt或AWS Cognito
        return Buffer.from(password).toString('base64');
    }

    /**
     * 验证密码
     */
    verifyPassword(password, hashedPassword) {
        return this.hashPassword(password) === hashedPassword;
    }

    /**
     * 生成Token（实际项目用JWT）
     */
    generateToken(userId) {
        const token = uuidv4();
        this.mockTokens.set(token, {
            userId,
            expiresAt: Date.now() + CONFIG.TOKEN_EXPIRY * 1000
        });
        return token;
    }

    /**
     * 验证Token
     */
    verifyToken(token) {
        const tokenData = this.mockTokens.get(token);
        if (!tokenData) {
            return null;
        }

        if (Date.now() > tokenData.expiresAt) {
            this.mockTokens.delete(token);
            return null;
        }

        return tokenData.userId;
    }

    /**
     * 注册新用户
     */
    async register(userData) {
        const { email, password, username } = userData;

        // 检查邮箱是否已存在
        for (const user of this.mockDatabase.values()) {
            if (user.email === email) {
                throw new Error('Email already exists');
            }
        }

        // 创建新用户
        const userId = uuidv4();
        const user = {
            id: userId,
            email,
            username,
            password: this.hashPassword(password),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.mockDatabase.set(userId, user);

        // 返回用户信息（不包含密码）
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    /**
     * 用户登录
     */
    async login(email, password) {
        // 查找用户
        let foundUser = null;
        for (const user of this.mockDatabase.values()) {
            if (user.email === email) {
                foundUser = user;
                break;
            }
        }

        if (!foundUser) {
            throw new Error('Invalid email or password');
        }

        // 验证密码
        if (!this.verifyPassword(password, foundUser.password)) {
            throw new Error('Invalid email or password');
        }

        // 生成Token
        const token = this.generateToken(foundUser.id);

        // 返回用户信息和Token
        const { password: _, ...userWithoutPassword } = foundUser;
        return {
            user: userWithoutPassword,
            token,
            expiresIn: CONFIG.TOKEN_EXPIRY
        };
    }

    /**
     * 获取用户信息
     */
    async getUserById(userId) {
        const user = this.mockDatabase.get(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    /**
     * 通过Token获取用户
     */
    async getUserByToken(token) {
        const userId = this.verifyToken(token);
        if (!userId) {
            throw new Error('Invalid or expired token');
        }

        return this.getUserById(userId);
    }
}

// 单例模式
export default new UserService();
