import { ValidationError } from '../core/errors';

export class MessageValidator {
  static validateUserId(userId: unknown): void {
    if (typeof userId !== 'string' || userId.trim().length === 0) {
      throw new ValidationError('Invalid user ID');
    }
  }

  static validateMessage(message: unknown): void {
    if (typeof message !== 'string' || message.trim().length === 0) {
      throw new ValidationError('Invalid message');
    }
  }

  static sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '').slice(0, 1000);
  }
}
