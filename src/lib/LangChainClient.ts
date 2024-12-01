import { ChatAnthropic } from '@langchain/anthropic';
import { ChatOpenAI } from '@langchain/openai';

const OpenAIModel = new ChatOpenAI({
  model: process.env.OPENAI_MODEL,
  temperature: Number(process.env.LLM_TEMP ?? 0),
});

const AnthropicModel = new ChatAnthropic({
  model: process.env.ANTHROPIC_MODEL,
  temperature: Number(process.env.LLM_TEMP ?? 0),
});

export { OpenAIModel, AnthropicModel };
