import { createClient, RedisClientType } from 'redis';

class RedisClient {
  private static instance: RedisClientType;

  static getInstance(): RedisClientType {
    if (!RedisClient.instance) {
      RedisClient.instance = createClient({
        url: 'redis://redis:6379',
      });
      RedisClient.instance.on('error', (err) =>
        console.error('Redis Client Error', err),
      );
      RedisClient.instance.connect();
    }
    return RedisClient.instance;
  }
}

export default RedisClient;
