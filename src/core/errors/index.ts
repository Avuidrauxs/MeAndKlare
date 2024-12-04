/* eslint-disable max-classes-per-file */
export class BaseError extends Error {
  constructor(
    message: string,
    public originalError?: Error,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class MessageError extends BaseError {}
export class FlowError extends BaseError {}
export class AIError extends BaseError {}
export class CacheError extends BaseError {}
export class ValidationError extends BaseError {}
