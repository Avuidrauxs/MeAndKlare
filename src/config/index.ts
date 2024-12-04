import 'dotenv/config';

interface Config {
  server: {
    port: number;
    env: string;
  };
  redis: {
    url: string;
    ttl: number;
  };
  ai: {
    modelName: string;
    temperature: number;
    maxRetries: number;
    timeout: number;
    retryDelay: number;
  };
  auth: {
    jwtSecret: string;
    tokenExpiry: string;
  };
  flows: {
    normal: {
      responses: {
        NORMAL: string;
        FAQ: string;
        SUICIDE_RISK: string;
      };
    };
    checkIn: {
      initialPrompt: string;
      responses: {
        NORMAL: string;
        FAQ: string;
        SUICIDE_RISK: string;
      };
    };
  };
  responses: {
    default: string;
    SUICIDE_RISK: string;
  };
}

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required');
}

export const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    ttl: 60 * 60 * 24, // 24 hours
  },
  ai: {
    modelName: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxRetries: 3,
    timeout: 5000,
    retryDelay: 1000,
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    tokenExpiry: '24h',
  },
  flows: {
    normal: {
      responses: {
        NORMAL: "I understand. Please tell me more about how you're feeling.",
        FAQ: 'Let me help you with that question.',
        SUICIDE_RISK:
          "I hear that you're struggling. Your life matters and there are people who want to help.",
      },
    },
    checkIn: {
      initialPrompt: 'How are you feeling today?',
      responses: {
        NORMAL: 'Thank you for sharing. How can I support you today?',
        FAQ: "I'll help you with that question.",
        SUICIDE_RISK:
          "I'm very concerned about what you're saying. Let's get you some immediate support.",
      },
    },
  },
  responses: {
    default: "I'm here to support you.",
    SUICIDE_RISK:
      'Your life matters. Please call 988 for immediate help, or text HOME to 741741 to connect with a Crisis Counselor. These services are free and available 24/7.',
  },
};
