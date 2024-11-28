import { createClient } from 'redis';
import RedisClient from './RedisClient';

jest.mock('redis', () => {
  const mClient = {
    connect: jest.fn(),
    on: jest.fn(),
  };
  return {
    createClient: jest.fn(() => mClient),
  };
});

describe('RedisClient', () => {
  it('should create a new Redis client instance', () => {
    const client = RedisClient.getInstance();
    expect(createClient).toHaveBeenCalledTimes(1);
    expect(client.connect).toHaveBeenCalled();
  });

  it('should return the same instance on subsequent calls', () => {
    const client1 = RedisClient.getInstance();
    const client2 = RedisClient.getInstance();
    expect(client1).toBe(client2);
  });
});
