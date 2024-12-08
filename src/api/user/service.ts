import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import RedisClient from '../../core/lib/redis/RedisClient';
import { User } from '../../core/types';
import { config } from '../../core/config';
import { UserServiceError } from '../../core/errors';

class UserService {
  private static redisClient = RedisClient.getInstance();

  private static SECRET_KEY = config.auth.jwtSecret;

  static async registerUser(username: string, password: string): Promise<void> {
    const id = uuidv4();
    const sessionId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    const user: User = {
      id,
      username,
      password: hashedPassword,
      sessionId,
    };

    const userKey = `user:${id}`;
    const usernameKey = `username:${username}`;
    const value = JSON.stringify(user);

    await this.redisClient.set(userKey, value);
    await this.redisClient.set(usernameKey, id);
  }

  static async loginUser(username: string, password: string): Promise<string> {
    const usernameKey = `username:${username}`;
    const userId = await this.redisClient.get(usernameKey);

    if (!userId) {
      throw new UserServiceError('Invalid credentials');
    }

    const userKey = `user:${userId}`;
    const userValue = await this.redisClient.get(userKey);

    if (!userValue) {
      throw new UserServiceError('Invalid credentials');
    }

    const user = JSON.parse(userValue) as User;
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UserServiceError('Invalid credentials');
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        sessionId: user.sessionId,
      },
      this.SECRET_KEY,
      {
        expiresIn: '1h',
      },
    );

    return token;
  }

  static async getUser(userId: string): Promise<User | null> {
    const key = `user:${userId}`;
    const value = await this.redisClient.get(key);
    if (value) {
      return JSON.parse(value) as User;
    }
    return null;
  }
}

export default UserService;
