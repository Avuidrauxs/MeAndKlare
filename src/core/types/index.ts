import { AIMessage, HumanMessage } from '@langchain/core/messages';

export enum Intent {
  NORMAL = 'NORMAL',
  FAQ = 'FAQ',
  SUICIDE_RISK = 'SUICIDE_RISK',
}

export enum FlowType {
  NORMAL = 'NORMAL',
  CHECK_IN = 'CHECK_IN',
}

export interface Message {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
  intent: Intent;
}

export type MessageArray = (HumanMessage | AIMessage)[];

export interface Context {
  userId?: string;
  sessionId: string;
  flow: FlowType;
  mood?: string;
  lastMessage?: string;
  lastResponse?: string;
  intent?: Intent;
  lastUpdated: Date;
  llmContext?: unknown[];
  chatHistory?: MessageArray;
  metadata?: Record<string, unknown>;
}

export interface User {
  id: string;
  username: string;
  password: string;
  sessionId: string;
  [key: string]: unknown;
}

export interface JWTPayload {
  userId: string;
  sessionId: string;
  username?: string;
  iat?: number;
  exp?: number;
}
