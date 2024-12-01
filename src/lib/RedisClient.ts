import { Redis } from 'ioredis';
import dotenv from 'dotenv';
import logger from './logger';

dotenv.config();

class RedisClient {
  private static instance: Redis;

  static getInstance(): Redis {
    if (!RedisClient.instance) {
      RedisClient.instance = new Redis({
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      });

      RedisClient.instance.on('error', (err) =>
        logger.error('Redis Client Error', err),
      );
    }
    return RedisClient.instance;
  }
}

export default RedisClient;
