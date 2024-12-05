import request from 'supertest';
import { faker } from '@faker-js/faker';
import { Redis } from 'ioredis';
import app from '../index';
import RedisClient from '../lib/RedisClient';
import { ContextService } from './contextService';
import { Context, FlowType } from '../core/types';

describe('Context Routes', () => {
  let redisClient: Redis;
  let token: string;
  let userId: string;
  let contextService: ContextService;

  beforeAll(async () => {
    redisClient = RedisClient.getInstance();

    // Register and login a user to get a token
    const username = faker.internet.displayName();
    const password = faker.internet.password();
    contextService = new ContextService();

    await request(app)
      .post('/api/register')
      .send({ username, password });

    const loginResponse = await request(app)
      .post('/api/login')
      .send({ username, password });

    token = loginResponse.body.token;
    const usernameKey = `username:${username}`;
    userId = await redisClient.get(usernameKey) || '';
  });

  afterAll(() => {
    redisClient.quit();
  });

  it('should retrieve the user context', async () => {
    // Set up initial context in Redis
    const initialContext: Context = {
      userId,
      flow: FlowType.NORMAL,
      sessionId: '123',
      lastMessage: 'Hello',
      lastResponse: 'Hi',
      mood: 'happy',
      lastUpdated: new Date(),
      llmContext: [],
      chatHistory: [],
      metadata: {},
    };
    await contextService.saveContext(userId, initialContext);

    const response = await request(app)
      .get('/api/retrieveContext')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(JSON.stringify(response.body.context)).toEqual(JSON.stringify(initialContext));
  });

  it('should update the user context', async () => {
    const updates = {
      lastMessage: 'Updated message',
      mood: 'excited',
    };

    const response = await request(app)
      .put('/api/updateContext')
      .set('Authorization', `Bearer ${token}`)
      .send({
        updates: {
                mood: updates.mood,
                lastMessage: updates.lastMessage
                }
        });

    expect(response.status).toBe(200);
    expect(response.text).toBe('Context updated');

    const updatedContext = await contextService.getContext(userId);

    expect(updatedContext?.lastMessage).toBe(updates.lastMessage);
    expect(updatedContext?.mood).toBe(updates.mood);
  });
});