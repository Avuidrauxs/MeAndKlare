import request from 'supertest';
import { Redis } from 'ioredis';
import { faker } from '@faker-js/faker';
import { ContextService } from '../context/service';
import LLMService from '../../core/infrastructure/llm/service';
import { JWTPayload } from '../../core/types';
import KlareChatBotController from './controller';
import app from '../..';
import RedisClient from '../../lib/RedisClient';

jest.mock('../../core/infrastructure/llm/service');

describe('KlareChatBotController Routes', () => {
  let contextService: ContextService;
  let redisClient: Redis;
  let token: string;
  let userId: string;

  beforeAll(async () => {
    contextService = new ContextService();
    KlareChatBotController.contextService = contextService;
    redisClient = RedisClient.getInstance();

    // Register and login a user to get a token
    const username = faker.internet.displayName();
    const password = faker.internet.password();
    contextService = new ContextService();

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

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    redisClient.quit();
  });

  it('should handle sendMessage correctly', async () => {
    const mockResponse = {
      answer: 'Test response',
      context: [],
      chat_history: [],
    };

    jest.spyOn(LLMService, 'classifyMessageAndResponse').mockResolvedValueOnce({
      invoke: jest.fn().mockResolvedValueOnce(mockResponse),
    } as any);

    const response = await request(app)
      .post('/api/v1/message/sendMessage')
      .set('Authorization', `Bearer ${token}`)
      .send({ input: 'Hello' });

    expect(response.status).toBe(200);
    expect(response.text).toBe('Test response');
  });

  it('should handle initiateCheckIn correctly', async () => {
    const mockResponse = {
      answer: 'Check-in response',
      context: [],
      chat_history: [],
    };

    jest.spyOn(LLMService, 'klareConversationAgent').mockResolvedValueOnce({
      invoke: jest.fn().mockResolvedValueOnce(mockResponse),
    } as any);

    const response = await request(app)
      .post('/api/v1/message/initiateCheckIn')
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.text).toBe('Check-in response');
    // expect(contextService.upsertContext).toHaveBeenCalledWith('test-user-id', expect.any(Object));
  });
});
