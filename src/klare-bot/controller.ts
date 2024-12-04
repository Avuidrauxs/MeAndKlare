import { Request, Response } from 'express';
import {
  classifyMessageAndResponse,
  klareConversationAgent,
} from './llmAgentService';
import logger from '../lib/logger';
import { ContextService } from './contextService';
import { FlowType } from '@/core/types';

export default class KlareBotController {
  static async sendMessage(req: Request, res: Response): Promise<void> {
    const { input } = req.body;

    const faqRagChain = await classifyMessageAndResponse();

    // get the user context to get the sessionId

    const response = await faqRagChain.invoke(
      { input },
      { configurable: { sessionId: 'audax7878' } },
    );

    // Get the intent and put together a context and save the context

    // Return the response

    // console.log(response, 'sdafsdfsdaf');

    res.status(200).send(response.answer);
  }

  static async initiateCheckIn(req: Request, res: Response): Promise<void> {
    const { input } = req.body;

    // Hi user and then  For Check-In Flow, use a predefined script like "How are you doing today?" without needing classification.

    const faqRagChain = await klareConversationAgent();

    // get the user context to get the sessionId

    const response = await faqRagChain.invoke(
      { input },
      { configurable: { sessionId: 'audax7878', flow: FlowType.CHECK_IN } },
    );

    // Checkin intent and put together a context and save the context

    // Return the response

    res.status(200).send(response.answer);
  }

  static async retrieveContext(req: Request, res: Response): Promise<void> {
    const { userId } = req.query;

    const contextService = new ContextService();

    const context = await contextService.getContext(userId as string);

    res.status(200).send({ context });
  }

  static async updateContext(req: Request, res: Response): Promise<void> {
    const { userId, updates } = req.body;

    const contextService = new ContextService();

    await contextService.updateContext(userId, updates);

    res.status(201).send('Context updated');
  }
}
