import { Context } from 'vm';
import {
  ProcessedMessageResult,
  MessageType,
  Message,
  FlowType,
  FlowResult,
} from '../types';

export interface IMessageService {
  processMessage(
    userId: string,
    content: string,
  ): Promise<ProcessedMessageResult>;
  classifyMessage(content: string): Promise<MessageType>;
  generateResponse(content: string, context: Context): Promise<string>;
}

export interface IContextService {
  getContext(userId: string): Promise<Context>;
  updateContext(userId: string, context: Context): Promise<void>;
  addMessageToHistory(userId: string, message: Message): Promise<void>;
  getMessageHistory(userId: string): Promise<Message[]>;
  clearContext(userId: string): Promise<void>;
}

export interface IFlowService {
  getCurrentFlow(userId: string): Promise<FlowType>;
  startCheckIn(userId: string): Promise<string>;
  handleFlow(
    userId: string,
    message: string,
    type: MessageType,
  ): Promise<FlowResult>;
}

export interface IAIService {
  classifyIntent(message: string): Promise<MessageType>;
  generateResponse(message: string, context: Context): Promise<string>;
}

export interface ICacheService {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
}
