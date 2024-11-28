import OpenAIClient from '../lib/OpenAIClient';
import RedisClient from '../lib/RedisClient';

class TextGeneratorService {
  private static openai = OpenAIClient.getInstance();

  private static redisClient = RedisClient.getInstance();

  static async generateText(prompt: string): Promise<string> {
    const response = await this.openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 100,
    });

    return response.data.choices[0].text || '';
  }
}

export default TextGeneratorService;
