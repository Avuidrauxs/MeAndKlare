import { NextFunction, Request, Response } from 'express';
import logger from '../../lib/logger';
import { ContextService } from '../context/service';
import { FlowType, Intent, JWTPayload, MessageArray } from '../../core/types';
import LLMService from '../../core/infrastructure/llm/service';
import { GlobalValidator } from '../../utils/validators';
import { InputDto } from './input.dto';
import { config } from '../../config';
import KlareChatBotService from './service';

export default class KlareChatBotController {
  static contextService: ContextService = new ContextService();

  static async sendMessage(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { input } = await GlobalValidator.validateInput(InputDto, req.body);
      const sanitizedInput = GlobalValidator.sanitizeInput(input);
      // To make sure we stick to a fixed token
      const truncatedInput = GlobalValidator.truncateInput(
        sanitizedInput,
        config.ai.maxTokens,
      );
      const { userId, sessionId } = req.user as JWTPayload;

      const result = await KlareChatBotService.sendMessage(
        truncatedInput,
        userId,
        sessionId,
      );

      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  }

  static async initiateCheckIn(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { userId, sessionId } = req.user as JWTPayload;
      const result = await KlareChatBotService.initiateCheckIn(
        userId,
        sessionId,
      );

      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  }
}
