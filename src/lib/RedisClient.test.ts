import { Redis } from 'ioredis';
import RedisClient from './RedisClient';

jest.mock('ioredis');
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));
jest.mock('./logger', () => ({
  error: jest.fn(),
}));

describe('RedisClient', () => {
  let redisInstanceMock: jest.Mocked<Redis>;

  beforeEach(() => {
    redisInstanceMock = new Redis() as jest.Mocked<Redis>;
    (Redis as unknown as jest.Mock).mockReturnValue(redisInstanceMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new Redis instance if not already created', () => {
    const instance = RedisClient.getInstance();
    expect(instance).toBe(redisInstanceMock);
    expect(Redis).toHaveBeenCalledWith({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    });
  });

  it('should return the existing Redis instance if already created', () => {
    const firstInstance = RedisClient.getInstance();
    const secondInstance = RedisClient.getInstance();
    expect(firstInstance).toBe(secondInstance);
    expect(Redis).toHaveBeenCalledTimes(1);
  });
});
