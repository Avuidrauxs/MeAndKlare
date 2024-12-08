import 'dotenv/config';

interface Config {
  server: {
    port: number;
    env: string;
  };
  redis: {
    url: string;
    host: string;
    port: string;
    ttl: number;
  };
  ai: {
    noLllm: boolean;
    openAiApiKey: string | null;
    anthropicApiKey: string | null;
    groqApiKey: string | null;
    openAiModelName: string;
    anthropicModelName: string;
    groqModelName: string;
    temperature: number;
    maxRetries: number;
    maxTokens: number;
    timeout: number;
    retryDelay: number;
  };
  auth: {
    jwtSecret: string;
    tokenExpiry: string;
  };
}

export const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || '6379',
    ttl: 60 * 60 * 24, // 24 hours
  },
  ai: {
    noLllm:
      !process.env.OPENAI_API_KEY &&
      !process.env.GROQ_API_KEY &&
      !process.env.ANTHROPIC_API_KEY,
    openAiApiKey: process.env.OPENAI_API_KEY || null,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || null,
    groqApiKey: process.env.GROQ_API_KEY || null,
    groqModelName: process.env.GROQ_MODEL || 'mixtral-8x7b-32768',
    openAiModelName: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: Number(process.env.LLM_TEMP) || 0.7,
    maxRetries: 3,
    timeout: 5000,
    retryDelay: 1000,
    maxTokens: Number(process.env.MAX_TOKENS) || 2048,
    anthropicModelName:
      process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20240620',
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'secret',
    tokenExpiry: '24h',
  },
};
