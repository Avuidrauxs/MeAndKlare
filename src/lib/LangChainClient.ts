import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOpenAI } from '@langchain/openai';
import { ChatGroq } from '@langchain/groq';
import { config } from '../config';

const { openAiModelName, anthropicModelName, temperature, groqModelName } =
  config.ai;

const OpenAIModel = new ChatOpenAI({
  model: openAiModelName,
  temperature,
});

const AnthropicModel = new ChatAnthropic({
  model: anthropicModelName,
  temperature,
});

const GroqModel = new ChatGroq({
  model: groqModelName,
  temperature,
});

export { OpenAIModel, AnthropicModel, GroqModel };
