/* eslint-disable node/no-unsupported-features/node-builtins */
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import RedisClient from '../lib/RedisClient';

class UserService {
  private static redisClient = RedisClient.getInstance();

  private static SECRET_KEY = 'your_secret_key';

  static async registerUser(username: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.redisClient.mset(`user:${username}`, 'password', hashedPassword);
  }

  static async loginUser(username: string, password: string): Promise<string> {
    const storedPasswordArray = await this.redisClient.mget(
      `user:${username}`,
      'password',
    );
    const storedPassword = storedPasswordArray[0];
    if (!storedPassword || !bcrypt.compare(password, storedPassword)) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ username }, this.SECRET_KEY, { expiresIn: '1h' });
    return token;
  }

  static async storeUserTextGeneration(username: string, text: string) {
    await this.redisClient.mset(`user:${username}`, 'recentText', text);
  }
}

export default UserService;
