import {
  FAQ_RESPONSES,
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

  static getFAQResponse(question: string): string {
    const normalizedQuestion = question.toLowerCase().trim();
    if (NoLllmService.containsSuicideRiskKeyword(normalizedQuestion)) {
      return SUICIDE_RISK_RESPONSE;
    }
    return (
      FAQ_RESPONSES[normalizedQuestion] ||
      "I'm sorry, I don't have an answer for that. Please check our FAQ page for more information."
    );
  }
}

export default NoLllmService;
