/* eslint-disable class-methods-use-this */
import { v4 as uuidv4 } from 'uuid';
import RedisClient from '../../core/lib/redis/RedisClient';
import { Context, FlowType, Message } from '../../core/types';
import logger from '../../core/lib/logger';
import { IContextService } from '../../core/interfaces';
import { ContextServiceError } from '../../core/errors';

export class ContextService implements IContextService {
  private readonly CONTEXT_EXPIRY = 60 * 60 * 24; // 24 hours

  private readonly KEY_PREFIX = 'msg:';

  private redisClient = RedisClient.getInstance();

  async getContext(userId: string): Promise<Context | null> {
    try {
      const key = this.getContextKey(userId);
      const value = await this.redisClient.get(key);
      if (value) {
        return JSON.parse(value) as Context;
      }
      return null;
    } catch (error) {
      logger.error({ message: 'Error getting context:', error });
      throw new ContextServiceError('Failed to get context', error as Error);
    }
  }

  async saveContext(userId: string, context: Context): Promise<void> {
    try {
      const key = this.getContextKey(userId);
      const value = JSON.stringify(context);
      await this.redisClient.set(key, value);
    } catch (error) {
      logger.error({ message: 'Error saving context:', error });
      throw new ContextServiceError('Failed to save context', error as Error);
    }
  }

  async updateContext(
    userId: string,
    updates: Partial<Context>,
  ): Promise<void> {
    try {
      const context = await this.getContext(userId);
      if (context) {
        const updatedContext = {
          ...context,
          ...updates,
          lastUpdated: new Date(),
        };
        await this.saveContext(userId, updatedContext);
      } else {
        throw new Error('Context not found');
      }
    } catch (error) {
      logger.error({ message: 'Error updating context:', error });
      throw new ContextServiceError('Failed to update context', error as Error);
    }
  }

  async upsertContext(
    userId: string,
    updates: Partial<Context>,
  ): Promise<void> {
    try {
      const context = await this.getContext(userId);
      const updatedContext = {
        ...context,
        ...updates,
        lastUpdated: new Date(),
      };
      await this.saveContext(userId, updatedContext as Context);
    } catch (error) {
      logger.error({ message: 'Error upserting context:', error });
      throw new ContextServiceError('Failed to upsert context', error as Error);
    }
  }

  async clearContext(userId: string): Promise<void> {
    try {
      await Promise.all([
        this.redisClient.del(this.getContextKey(userId)),
        this.redisClient.del(this.getHistoryKey(userId)),
      ]);
    } catch (error) {
      logger.error({ message: 'Error clearing context:', error });
      throw new ContextServiceError('Failed to clear context', error as Error);
    }
  }

  private getContextKey(userId: string): string {
    return `${this.KEY_PREFIX}context:${userId}`;
  }

  private getHistoryKey(userId: string): string {
    return `${this.KEY_PREFIX}history:${userId}`;
  }

  private getDefaultContext(): Context {
    return {
      flow: FlowType.NORMAL,
      lastUpdated: new Date(),
      sessionId: uuidv4(),
    };
  }
}
