import { Redis } from 'ioredis';
import { ContextService } from './service'; // Adjust the import path as necessary
import { Context, FlowType } from '../../core/types'; // Adjust the import path as necessary
import { ContextServiceError } from '../../core/errors';
import RedisClient from '../../core/lib/redis/RedisClient';

describe('ContextService', () => {
  let contextService: ContextService;
  let redisClient: Redis;

  beforeAll(async () => {
    redisClient = await RedisClient.getInstance();
    contextService = new ContextService();
    contextService['redisClient'] = redisClient;
  });

  it('should save and get context', async () => {
    const userId = 'test-user-id';
    const context: Context = {
      userId,
      flow: FlowType.NORMAL,
      lastMessage: 'Hello',
      lastResponse: 'Hi',
      mood: 'happy',
      lastUpdated: new Date().toISOString(),
      sessionId: 'test-session-id',
    };

    await contextService.saveContext(userId, context);
    const retrievedContext = await contextService.getContext(userId);

    expect(retrievedContext).toEqual(context);
  });

  it('should update context', async () => {
    const userId = 'test-user-id';
    const initialContext: Context = {
      userId,
      flow: FlowType.NORMAL,
      lastMessage: 'Hello',
      lastResponse: 'Hi',
      mood: 'happy',
      lastUpdated: new Date(),
      sessionId: 'test-session-id',
    };

    await contextService.saveContext(userId, initialContext);

    const updates = {
      lastMessage: 'Updated message',
      mood: 'excited',
    };

    await contextService.updateContext(userId, updates);
    const updatedContext = await contextService.getContext(userId);

    expect(updatedContext?.lastMessage).toBe(updates.lastMessage);
    expect(updatedContext?.mood).toBe(updates.mood);
  });

  it('should upsert context', async () => {
    const userId = 'test-user-id';
    const updates = {
      lastMessage: 'Upserted message',
      mood: 'curious',
    };

    await contextService.upsertContext(userId, updates);
    const upsertedContext = await contextService.getContext(userId);

    expect(upsertedContext?.lastMessage).toBe(updates.lastMessage);
    expect(upsertedContext?.mood).toBe(updates.mood);
  });

  it('should clear context', async () => {
    const userId = 'test-user-id';
    const context: Context = {
      userId,
      flow: FlowType.NORMAL,
      lastMessage: 'Hello',
      lastResponse: 'Hi',
      mood: 'happy',
      lastUpdated: new Date(),
      sessionId: 'test-session-id',
    };

    await contextService.saveContext(userId, context);
    await contextService.clearContext(userId);
    const clearedContext = await contextService.getContext(userId);

    expect(clearedContext).toBeNull();
  });
  it('should handle errors when getting context', async () => {
    const userId = 'test-user-id';

    // Simulate an error by using an invalid key
    jest.spyOn(redisClient, 'get').mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    await expect(contextService.getContext(userId)).rejects.toThrow(ContextServiceError);
  });
  it('should handle errors when saving context', async () => {
    const userId = 'test-user-id';
    const context: Context = {
      userId,
      flow: FlowType.NORMAL,
      lastMessage: 'Hello',
      lastResponse: 'Hi',
      mood: 'happy',
      lastUpdated: new Date().toISOString(),
      sessionId: 'test-session-id',
    };

    // Simulate an error by using an invalid key
    jest.spyOn(redisClient, 'set').mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    await expect(contextService.saveContext(userId, context)).rejects.toThrow(ContextServiceError);
  });

  it('should handle errors when updating context', async () => {
    const userId = 'test-user-id';
    const updates = {
      lastMessage: 'Updated message',
      mood: 'excited',
    };

    // Simulate an error by using an invalid key
    jest.spyOn(contextService, 'getContext').mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    await expect(contextService.updateContext(userId, updates)).rejects.toThrow(ContextServiceError);
  });

  it('should handle errors when upserting context', async () => {
    const userId = 'test-user-id';
    const updates = {
      lastMessage: 'Upserted message',
      mood: 'curious',
    };

    // Simulate an error by using an invalid key
    jest.spyOn(contextService, 'getContext').mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    await expect(contextService.upsertContext(userId, updates)).rejects.toThrow(ContextServiceError);
  });

  it('should handle errors when clearing context', async () => {
    const userId = 'test-user-id';

    // Simulate an error by using an invalid key
    jest.spyOn(redisClient, 'del').mockImplementationOnce(() => {
      throw new Error('Test error');
    });

    await expect(contextService.clearContext(userId)).rejects.toThrow(ContextServiceError);
  });
});