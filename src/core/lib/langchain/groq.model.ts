import { ChatGroq } from '@langchain/groq';
import { config } from '../../../core/config';
import { IAiService } from '../../../core/interfaces';

export class GroqModel implements IAiService {
  private groqModelname: string;

  private temperature: number;

  constructor(modelName: string) {
    this.groqModelname = modelName;
    this.temperature = config.ai.temperature;
  }

  getGPTInstance(): ChatGroq {
    return new ChatGroq({
      model: this.groqModelname,
      temperature: this.temperature,
    });
  }
}
