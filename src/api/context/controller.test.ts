import request from 'supertest';
import { faker } from '@faker-js/faker';
import { Redis } from 'ioredis';
import app from '../../index';
import RedisClient from '../../core/lib/redis/RedisClient';
import { ContextService } from './service';
import { Context, FlowType } from '../../core/types';
import { ContextServiceError } from '../../core/errors';
import KlareChatBotController from '../klare-chat-bot/controller';

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
    contextService['redisClient'] = redisClient;

    await request(app)
      .post('/api/v1/user/register')
      .send({ username, password });

    const loginResponse = await request(app)
      .post('/api/v1/user/login')
      .send({ username, password });

    token = loginResponse.body.token;
    const usernameKey = `username:${username}`;
    userId = (await redisClient.get(usernameKey)) || '';
  });

  afterAll(() => {
    redisClient.quit();
  });

  afterEach(() => {
    jest.clearAllMocks();
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
      lastUpdated: new Date().toISOString(),
      llmContext: [],
      chatHistory: [],
      metadata: {},
    };
    await contextService.saveContext(userId, initialContext);

    const response = await request(app)
      .get('/api/v1/context/retrieveContext')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(JSON.stringify(response.body.context)).toEqual(
      JSON.stringify(initialContext),
    );
  });

  
  it('should handle errors when retrieving the user context', async () => {
     // Simulate an error by using an invalid key
     jest.spyOn(redisClient, 'get').mockImplementationOnce(() => {
      throw new Error('Test error');
    });
    // Set up initial context in Redis
    const initialContext: Context = {
      userId,
      flow: FlowType.NORMAL,
      sessionId: '123',
      lastMessage: 'Hello',
      lastResponse: 'Hi',
      mood: 'happy',
      lastUpdated: new Date().toISOString(),
      llmContext: [],
      chatHistory: [],
      metadata: {},
    };
    await contextService.saveContext(userId, initialContext);

    const response = await request(app)
      .get('/api/v1/context/retrieveContext')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.text).toBe('{\"message\":\"Failed to get context\"}');
    
  });

  it('should handle errors when updating the user context', async () => {
    // Simulate an error by using an invalid key
    jest.spyOn(redisClient, 'set').mockImplementationOnce(() => {
      throw new Error('Test error');
    });
    const updates = {
      lastMessage: 'Updated message',
      mood: 'excited',
    };

    const response = await request(app)
      .put('/api/v1/context/updateContext')
      .set('Authorization', `Bearer ${token}`)
      .send({
        updates: {
          mood: updates.mood,
          lastMessage: updates.lastMessage,
        },
      });

      expect(response.status).toBe(400);
      expect(response.text).toBe('{\"message\":\"Failed to update context\"}');
  });

  it('should update the user context', async () => {
    const updates = {
      lastMessage: 'Updated message',
      mood: 'excited',
    };

    const response = await request(app)
      .put('/api/v1/context/updateContext')
      .set('Authorization', `Bearer ${token}`)
      .send({
        updates: {
          mood: updates.mood,
          lastMessage: updates.lastMessage,
        },
      });

    expect(response.status).toBe(200);
    expect(response.text).toBe('Context updated');

    const updatedContext = await contextService.getContext(userId);

    expect(updatedContext?.lastMessage).toBe(updates.lastMessage);
    expect(updatedContext?.mood).toBe(updates.mood);
  });
});
