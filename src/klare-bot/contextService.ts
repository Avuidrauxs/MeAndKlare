/* eslint-disable class-methods-use-this */
import RedisClient from '../lib/RedisClient';
import { Context, FlowType, Message } from '../core/types';
import logger from '../lib/logger';
import { IContextService } from '../core/interfaces';

export class ContextService {
  private readonly CONTEXT_EXPIRY = 60 * 60 * 24; // 24 hours

  private readonly HISTORY_LIMIT = 10;

  private readonly KEY_PREFIX = 'msg:';

  private redisClient = RedisClient.getInstance();

  async getContext(userId: string): Promise<Context> {
    try {
      const key = this.getContextKey(userId);
      const context = await this.redisClient.get(key);
      return context ? JSON.parse(context) : this.getDefaultContext();
    } catch (error) {
      logger.error({ message: 'Error getting context:', error });
      return this.getDefaultContext();
    }
  }

  async updateContext(userId: string, context: Context): Promise<void> {
    try {
      const key = this.getContextKey(userId);
      const sanitizedContext = this.sanitizeContext(context);
      await this.redisClient.setex(
        key,
        this.CONTEXT_EXPIRY,
        JSON.stringify(sanitizedContext),
      );
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

  private sanitizeContext(context: Context): Context {
    return {
      ...context,
      lastUpdated: new Date(),
      // Remove any undefined or null values
      // eslint-disable-next-line node/no-unsupported-features/es-builtins
      ...Object.fromEntries(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        Object.entries(context).filter(([_, v]) => v != null),
      ),
    };
  }

  private sanitizeMessage(message: Message): Message {
    return {
      ...message,
      content: message.content.trim(),
      timestamp: new Date(message.timestamp),
    };
  }
}
