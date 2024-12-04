import { Context } from 'vm';
import { Intent } from '../types';

export interface IContextService {
  getContext(userId: string): Promise<Context | null>;
  updateContext(userId: string, context: Context): Promise<void>;
  saveContext(userId: string, context: Context): Promise<void>;
  clearContext(userId: string): Promise<void>;
}

export interface IAIService {
  classifyIntent(message: string): Promise<Intent>;
  generateResponse(message: string, context: Context): Promise<string>;
}

export interface ICacheService {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
}
