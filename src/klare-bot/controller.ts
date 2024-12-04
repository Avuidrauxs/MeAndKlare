import { Request, Response } from 'express';
import {
  FAGRagChain,
  FAGRagChainWithChatHistory,
  klareConversationAgent,
} from './llmAgentService';
import logger from '../lib/logger';

export default class KlareBotController {
  static async sendMessage(req: Request, res: Response): Promise<void> {
    const { input } = req.body;

    const faqRagChain = await klareConversationAgent();

    const response = await faqRagChain.invoke(
      { input },
      // { configurable: { sessionId: 'audax7878' } },
    );

    // logger.info({ message: 'Response:', response });

    res.status(200).send(response);
  }
}
