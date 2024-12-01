import { Request, Response } from 'express';
import { FAGRagChain, FAGRagChainWithChatHistory } from './faqRagChain';

export default class KlareBotController {
  static async sendMessage(req: Request, res: Response): Promise<void> {
    const { input } = req.body;

    const faqRagChain = await FAGRagChain();

    const response = await faqRagChain.invoke(
      { input },
      // { configurable: { sessionId: 'abc123' } },
    );

    res.status(200).send(response.answer);
  }
}
