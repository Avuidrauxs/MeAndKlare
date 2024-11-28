import { Configuration, OpenAIApi } from 'openai';

class OpenAIClient {
  private static instance: OpenAIApi;

  private constructor() {}

  static getInstance(): OpenAIApi {
    if (!OpenAIClient.instance) {
      const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
      });
      OpenAIClient.instance = new OpenAIApi(configuration);
    }
    return OpenAIClient.instance;
  }
}

export default OpenAIClient;
