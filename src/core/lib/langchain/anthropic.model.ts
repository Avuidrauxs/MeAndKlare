import { ChatAnthropic } from '@langchain/anthropic';
import { config } from '../../../core/config';
import { IAiService } from '../../../core/interfaces';

export class AnthropicModel implements IAiService {
  private anthropicModelname: string;

  private temperature: number;

  constructor(modelName: string) {
    this.anthropicModelname = modelName;
    this.temperature = config.ai.temperature;
  }

  getGPTInstance(): ChatAnthropic {
    return new ChatAnthropic({
      model: this.anthropicModelname,
      temperature: this.temperature,
    });
  }
}
