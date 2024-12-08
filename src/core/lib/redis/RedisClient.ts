import { Redis } from 'ioredis';
import logger from '../logger';
import { config } from '../../config';

class RedisClient {
  private static instance: Redis;

  static getInstance(): Redis {
    const { host, port } = config.redis;

    if (!RedisClient.instance) {
      RedisClient.instance = new Redis({
        host,
        port: Number(port),
      });

      RedisClient.instance.on('error', (err) =>
        logger.error('Redis Client Error', err),
      );
    }
    return RedisClient.instance;
  }
}

export default RedisClient;
