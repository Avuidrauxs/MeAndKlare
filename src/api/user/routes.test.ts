import request from 'supertest';
import { faker } from '@faker-js/faker';
import { Redis } from 'ioredis';
import app from '../../index';
import RedisClient from '../../lib/RedisClient';

describe('User Routes', () => {
  let redisClient: Redis;

  beforeAll(() => {
    redisClient = RedisClient.getInstance();
  });

  afterAll(() => {
    redisClient.disconnect();
  });

  it('should register a new user', async () => {
    const username = faker.internet.displayName();
    const password = faker.internet.password();

    const response = await request(app)
      .post('/api/v1/user/register')
      .send({ username, password });

    expect(response.status).toBe(200);
    expect(response.text).toBe('User registered successfully');

    const userId = await redisClient.get(`username:${username}`);
    expect(userId).toBeDefined();

    const userKey = `user:${userId}`;
    const userValue = await redisClient.get(userKey);
    expect(userValue).toBeDefined();

    const user = JSON.parse(userValue || '');
    expect(user.username).toBe(username);
  });

  it('should not register a new user with no username', async () => {
    const username = '';
    const password = faker.internet.password();

    const response = await request(app)
      .post('/api/v1/user/register')
      .send({ username, password });

    expect(response.status).toBe(400);
    expect(response.text).toBe(
      '{"message":"Validation failed: username should not be empty"}',
    );
  });

  it('should login an existing user', async () => {
    const username = faker.internet.displayName();
    const password = faker.internet.password();

    // Register the user first
    await request(app)
      .post('/api/v1/user/register')
      .send({ username, password });

    // Login the user
    const response = await request(app)
      .post('/api/v1/user/login')
      .send({ username, password });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');

    const { token } = response.body;
    expect(token).toBeDefined();
  });

  it('should not login with invalid credentials', async () => {
    const username = faker.internet.displayName();
    const password = faker.internet.password();

    const response = await request(app)
      .post('/api/v1/user/login')
      .send({ username, password });

    expect(response.status).toBe(401);
    expect(response.text).toBe('Invalid credentials');
  });

  it('should not login a new user with no username', async () => {
    const username = '';
    const password = faker.internet.password();

    const response = await request(app)
      .post('/api/v1/user/login')
      .send({ username, password });

    expect(response.status).toBe(400);
    expect(response.text).toBe(
      '{"message":"Validation failed: username should not be empty"}',
    );
  });
});
