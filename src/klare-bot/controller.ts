import { Request, Response } from 'express';
import logger from '../lib/logger';
import { ContextService } from './contextService';
import { FlowType, Intent, JWTPayload, MessageArray } from '../core/types';
import LLMService from './llmService';

export default class KlareBotController {
  static contextService: ContextService = new ContextService();

  static async sendMessage(req: Request, res: Response): Promise<void> {
    const { input } = req.body;
    const { userId, sessionId } = req.user as JWTPayload;

    let llmChain;
    let response;

    llmChain = await LLMService.classifyMessageAndResponse();

    const userContext =
      await KlareBotController.contextService.getContext(userId);

    if (userContext?.flow) {
      llmChain = await LLMService.klareConversationAgent();

      response = await llmChain.invoke(
        { input, flow: userContext?.flow || FlowType.NORMAL },
        { configurable: { sessionId } },
      );

      await KlareBotController.contextService.upsertContext(userId, {
        flow: FlowType.NORMAL,
        sessionId,
        lastMessage: input,
        lastResponse: response.answer,
        intent: Intent.NORMAL,
        lastUpdated: new Date(),
        llmContext: response.context,
        chatHistory: response.chat_history as MessageArray,
      });

      res.status(200).send(response.answer);
    } else {
      response = await llmChain.invoke(
        { input, flow: FlowType.NORMAL },
        { configurable: { sessionId } },
      );

      const result = JSON.parse(response.answer);
      // Store context and return the response
      await KlareBotController.contextService.upsertContext(userId, {
        flow: FlowType.NORMAL,
        sessionId,
        lastMessage: input,
        lastResponse: result.response,
        intent: result.intent,
        lastUpdated: new Date(),
        llmContext: response.context,
        chatHistory: response.chat_history as MessageArray,
      });

      res.status(200).send(response.answer);
    }
  }

  static async initiateCheckIn(req: Request, res: Response): Promise<void> {
    const input = 'Hi';
    const { userId, sessionId } = req.user as JWTPayload;

    // Hi user and then  For Check-In Flow, use a predefined script like "How are you doing today?" without needing classification.

    const faqRagChain = await LLMService.klareConversationAgent();

    // get the user context to get the sessionId

    const response = await faqRagChain.invoke(
      { input, flow: FlowType.CHECK_IN },
      { configurable: { sessionId } },
    );

    // Store context and return the response
    await KlareBotController.contextService.upsertContext(userId, {
      flow: FlowType.CHECK_IN,
      sessionId,
      lastMessage: '',
      lastResponse: response.answer,
      intent: Intent.NORMAL,
      lastUpdated: new Date(),
      llmContext: response.context,
      chatHistory: response.chat_history as MessageArray,
    });

    // Checkin intent and put together a context and save the context

    // Return the response

    res.status(200).send(response.answer);
  }

  static async retrieveContext(req: Request, res: Response): Promise<void> {
    const { userId } = req.query;

    const context = await KlareBotController.contextService.getContext(
      userId as string,
    );

    res.status(200).send({ context });
  }

  static async updateContext(req: Request, res: Response): Promise<void> {
    const { userId, updates } = req.body;

    await KlareBotController.contextService.updateContext(userId, updates);

    res.status(201).send('Context updated');
  }
}
