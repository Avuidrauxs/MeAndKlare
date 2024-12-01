import {
  HumanMessage,
  MessageContent,
  SystemMessage,
} from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
import OpenAIClient from '../lib/OpenAIClient';
import RedisClient from '../lib/RedisClient';
import { OpenAIModel } from '../lib/LangChainClient';

class TextGeneratorService {
  private static openai = OpenAIClient.getInstance();

  private static redisClient = RedisClient.getInstance();

  static async generateText(prompt: string): Promise<string> {
    const messages = [
      new SystemMessage('You are a helpful assistant.'),
      new HumanMessage(prompt),
    ];

    const reply = await OpenAIModel.invoke(messages);
    const parser = new StringOutputParser();
    const content = parser.invoke(reply);

    return content;
  }
}

export default TextGeneratorService;
