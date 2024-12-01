import OpenAI from 'openai';
import logger from './logger';

class OpenAIClient {
  private static instance: OpenAI;

  private constructor() {}

  static getInstance(): OpenAI {
    if (!OpenAIClient.instance) {
      const configuration = {
        apiKey: process.env.OPENAI_API_KEY,
      };
      OpenAIClient.instance = new OpenAI(configuration);
    }
    return OpenAIClient.instance;
  }
}

export default OpenAIClient;
