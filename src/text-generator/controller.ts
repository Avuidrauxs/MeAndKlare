import { Request, Response } from 'express';
import TextGeneratorService from './service';

class TextGeneratorController {
  static async generateText(req: Request, res: Response) {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).send('Prompt is required');
    }

    try {
      const text = await TextGeneratorService.generateText(prompt);
      res.send(text);
    } catch (error) {
      res.status(500).send('Error generating text');
    }
  }
}

export default TextGeneratorController;
