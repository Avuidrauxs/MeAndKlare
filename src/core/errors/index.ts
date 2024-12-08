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

export class ContextServiceError extends BaseError {}
export class LlmServiceError extends BaseError {}
export class ValidationError extends BaseError {}
export class UserServiceError extends BaseError {}
