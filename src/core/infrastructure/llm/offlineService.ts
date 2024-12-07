import { Intent, LlmResponse } from '../../../core/types';
import {
  CHECK_IN_INITIATION_TEXT,
  CHECK_IN_RESPONSES,
  FAQ_RESPONSES,
  NORMAL_RESPONSES,
  SUICIDE_RISK_KEYWORDS,
  SUICIDE_RISK_RESPONSE,
} from '../../../core/constants';

class NoLllmService {
  static containsSuicideRiskKeyword(sentence: string): boolean {
    return SUICIDE_RISK_KEYWORDS.some((keyword) =>
      sentence.toLowerCase().includes(keyword),
    );
  }

  static getSuicideRiskResponse() {
    return SUICIDE_RISK_RESPONSE;
  }

  static isFAQ(question: string): boolean {
    const normalizedQuestion = question.trim().toLowerCase();
    return Object.keys(FAQ_RESPONSES).includes(normalizedQuestion);
  }

  static getResponse(question: string): LlmResponse {
    const normalizedQuestion = question.toLowerCase().trim();
    if (NoLllmService.containsSuicideRiskKeyword(normalizedQuestion)) {
      return {
        response: SUICIDE_RISK_RESPONSE,
        intent: Intent.SUICIDE_RISK,
      };
    }
    if (FAQ_RESPONSES[normalizedQuestion]) {
      return {
        response: FAQ_RESPONSES[normalizedQuestion],
        intent: Intent.FAQ,
      };
    }

    if (NORMAL_RESPONSES[normalizedQuestion]) {
      return {
        response: NORMAL_RESPONSES[normalizedQuestion],
        intent: Intent.NORMAL,
      };
    }

    if (CHECK_IN_RESPONSES[normalizedQuestion] || question === 'Hi') {
      return {
        response: CHECK_IN_INITIATION_TEXT,
        intent: Intent.NORMAL,
      };
    }
    return {
      response:
        "I'm sorry, I don't have an answer for that. Please check our FAQ page for more information.",
      intent: Intent.NORMAL,
    };
  }
}

export default NoLllmService;
