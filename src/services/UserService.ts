import { v4 as uuidv4 } from 'uuid';
import { CONFIG } from '../config';
import type { User, UserInDB, RegisterRequest, LoginResponse, TokenData } from '../types';

/**
 * 用户服务类
 */
class UserService {
    // 模拟数据库（内存存储）
    private mockDatabase: Map<string, UserInDB>;
    private mockTokens: Map<string, TokenData>;

    constructor() {
        this.mockDatabase = new Map();
        this.mockTokens = new Map();
    }

    /**
     * 简单的密码加密（实际项目用bcrypt）
     */
    private hashPassword(password: string): string {
        // 这里只是演示，实际要用bcrypt或AWS Cognito
        return Buffer.from(password).toString('base64');
    }

    /**
     * 验证密码
     */
    private verifyPassword(password: string, hashedPassword: string): boolean {
        return this.hashPassword(password) === hashedPassword;
    }

    /**
     * 生成Token（实际项目用JWT）
     */
    private generateToken(userId: string): string {
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
    private verifyToken(token: string): string | null {
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
     * 移除密码字段
     */
    private removePassword(user: UserInDB): User {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    /**
     * 注册新用户
     */
    async register(userData: RegisterRequest): Promise<User> {
        const { email, password, username } = userData;

        // 检查邮箱是否已存在
        for (const user of this.mockDatabase.values()) {
            if (user.email === email) {
                throw new Error('Email already exists');
            }
        }

        // 创建新用户
        const userId = uuidv4();
        const now = new Date().toISOString();

        const user: UserInDB = {
            id: userId,
            email,
            username,
            password: this.hashPassword(password),
            createdAt: now,
            updatedAt: now
        };

        this.mockDatabase.set(userId, user);

        // 返回用户信息（不包含密码）
        return this.removePassword(user);
    }

    /**
     * 用户登录
     */
    async login(email: string, password: string): Promise<LoginResponse> {
        // 查找用户
        let foundUser: UserInDB | null = null;

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
        return {
            user: this.removePassword(foundUser),
            token,
            expiresIn: CONFIG.TOKEN_EXPIRY
        };
    }

    /**
     * 获取用户信息
     */
    async getUserById(userId: string): Promise<User> {
        const user = this.mockDatabase.get(userId);

        if (!user) {
            throw new Error('User not found');
        }

        return this.removePassword(user);
    }

    /**
     * 通过Token获取用户
     */
    async getUserByToken(token: string): Promise<User> {
        const userId = this.verifyToken(token);

        if (!userId) {
            throw new Error('Invalid or expired token');
        }

        return this.getUserById(userId);
    }
}

// 单例模式
export default new UserService();
