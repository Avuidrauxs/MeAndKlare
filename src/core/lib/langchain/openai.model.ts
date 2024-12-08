import { ChatOpenAI } from '@langchain/openai';
import { config } from '../../../core/config';
import { IAiService } from '../../../core/interfaces';

export class OpenAiModel implements IAiService {
  private openAiModelname: string;

  private temperature: number;

  constructor(modelName: string) {
    this.openAiModelname = modelName;
    this.temperature = config.ai.temperature;
  }

  getGPTInstance(): ChatOpenAI {
    return new ChatOpenAI({
      model: this.openAiModelname,
      temperature: this.temperature,
    });
  }
}
