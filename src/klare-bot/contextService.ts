/* eslint-disable class-methods-use-this */
import RedisClient from '../lib/RedisClient';
import { Context, FlowType, Message } from '../core/types';
import logger from '../lib/logger';
import { IContextService } from '../core/interfaces';

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
      return this.getDefaultContext();
    } catch (error) {
      logger.error({ message: 'Error getting context:', error });
      return null;
    }
  }

  async saveContext(userId: string, context: Context): Promise<void> {
    try {
      const key = this.getContextKey(userId);
      const value = JSON.stringify(context);
      await this.redisClient.set(key, value);
    } catch (error) {
      logger.error({ message: 'Error saving context:', error });
      throw new Error('Failed to save context');
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
      throw new Error('Failed to update context');
    }
  }

  async addMessageToHistory(userId: string, message: string): Promise<void> {
    try {
      const key = this.getHistoryKey(userId);

      await this.redisClient.rpush(key, message);
    } catch (error) {
      logger.error({ message: 'Error adding message to history:', error });
      throw new Error('Failed to add message to history');
    }
  }

  async getMessageHistory(userId: string) {
    try {
      const key = this.getHistoryKey(userId);
      const history = await this.redisClient.lrange(key, 0, -1);
      return history.map((entry, idx) => `User: ${entry}`).join('\n');
    } catch (error) {
      logger.error({ message: 'Error getting message history:', error });
      return [];
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
      throw new Error('Failed to clear context');
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
    };
  }
}
