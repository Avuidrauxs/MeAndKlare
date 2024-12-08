import { Redis } from 'ioredis';
import RedisClient from './RedisClient';

describe('RedisClient', () => {
  let redisClient: Redis;

  beforeAll(() => {
    redisClient = RedisClient.getInstance();
  });

  afterAll(() => {
    redisClient.disconnect();
  });

  it('should return the existing Redis instance if already created', () => {
    const firstInstance = RedisClient.getInstance();
    const secondInstance = RedisClient.getInstance();
    expect(firstInstance).toBe(secondInstance);
  });

  it('should set and get a value from Redis', async () => {
    const key = 'test-key';
    const value = 'test-value';

    await redisClient.set(key, value);
    const result = await redisClient.get(key);

    expect(result).toBe(value);
  });
});
