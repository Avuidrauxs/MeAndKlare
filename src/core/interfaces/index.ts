import { Context } from 'vm';
import { Intent } from '../types';

export interface IContextService {
  getContext(userId: string): Promise<Context | null>;
  updateContext(userId: string, context: Context): Promise<void>;
  saveContext(userId: string, context: Context): Promise<void>;
  clearContext(userId: string): Promise<void>;
}

export interface IAiService {
  getGPTInstance(input: string): unknown;
}
