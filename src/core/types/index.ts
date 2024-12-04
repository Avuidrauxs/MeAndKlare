export enum MessageType {
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
  type: MessageType;
}

export interface Context {
  userId?: string;
  flow: FlowType;
  lastMessage?: string;
  lastResponse?: string;
  mood?: string;
  lastUpdated: Date;
  metadata?: Record<string, unknown>;
}

export interface ProcessedMessageResult {
  response: string;
  flow: FlowType;
  messageType: MessageType;
  aiResponse?: string;
  metadata?: Record<string, unknown>;
}

export interface FlowResult {
  response: string;
  flow: FlowType;
  action?: string;
}

export interface User {
  id: string;
  [key: string]: unknown;
}

export interface JWTPayload {
  userId: string;
  iat?: number;
  exp?: number;
}
