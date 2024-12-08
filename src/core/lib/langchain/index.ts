import { config } from '../../../core/config';
import { AnthropicModel } from './anthropic.model';
import { LlmServiceError } from '../../../core/errors';
import { OpenAiModel } from './openai.model';
import { GroqModel } from './groq.model';

const {
  openAiApiKey,
  openAiModelName,
  anthropicApiKey,
  anthropicModelName,
  groqApiKey,
  groqModelName,
} = config.ai;

function getChatModel() {
  let model;
  if (anthropicApiKey) {
    model = new AnthropicModel(anthropicModelName);
    return model.getGPTInstance();
  }
  if (openAiApiKey) {
    model = new OpenAiModel(openAiModelName);
    return model.getGPTInstance();
  }
  if (groqApiKey) {
    model = new GroqModel(groqModelName);
    return model.getGPTInstance();
  }
  throw new LlmServiceError('No OpenAI, Anthropic, or Groq API key found');
}

export { getChatModel };
