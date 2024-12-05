import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOpenAI } from '@langchain/openai';
import { config } from '../config';

const { openAiModelName, anthropicModelName, temperature } = config.ai

const OpenAIModel = new ChatOpenAI({
  model: openAiModelName,
  temperature,
});

const AnthropicModel = new ChatAnthropic({
  model: anthropicModelName,
  temperature,
});

export { OpenAIModel, AnthropicModel };
