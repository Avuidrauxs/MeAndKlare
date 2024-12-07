import { Document } from '@langchain/core/documents';
import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';
import { RunnableWithMessageHistory } from '@langchain/core/runnables';
import { string } from 'zod';

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
  lastUpdated: Date | string;
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

export type LlmChainRunnable = RunnableWithMessageHistory<
  {
    input: string;
    chat_history?: BaseMessage[] | string;
  } & {
    [key: string]: unknown;
  },
  {
    context: Document[];
    answer: string;
  } & {
    [key: string]: unknown;
  }
>;

export type LlmChainResponse = {
  context: Document[];
  answer: string;
} & {
  chat_history?: MessageArray;
  [key: string]: unknown;
};

export type LlmResponse = {
  response: string;
  intent: Intent;
};
