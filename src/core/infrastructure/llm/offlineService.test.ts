import NoLllmService from './offlineService';
import { Intent, LlmResponse } from '../../../core/types';
import {
  SUICIDE_RISK_KEYWORDS,
  SUICIDE_RISK_RESPONSE,
  FAQ_RESPONSES,
  NORMAL_RESPONSES,
  CHECK_IN_INITIATION_TEXT,
  CHECK_IN_RESPONSES,
} from '../../../core/constants';

describe('NoLllmService', () => {
  describe('containsSuicideRiskKeyword', () => {
    it('should return true if the sentence contains a suicide risk keyword', () => {
      const sentence = `I am feeling ${SUICIDE_RISK_KEYWORDS[0]}`;
      expect(NoLllmService.containsSuicideRiskKeyword(sentence)).toBe(true);
    });

    it('should return false if the sentence does not contain a suicide risk keyword', () => {
      const sentence = 'I am feeling happy';
      expect(NoLllmService.containsSuicideRiskKeyword(sentence)).toBe(false);
    });
  });

  describe('getSuicideRiskResponse', () => {
    it('should return the suicide risk response', () => {
      expect(NoLllmService.getSuicideRiskResponse()).toBe(
        SUICIDE_RISK_RESPONSE,
      );
    });
  });

  describe('isFAQ', () => {
    it('should return true if the question is in the FAQ responses', () => {
      const question = Object.keys(FAQ_RESPONSES)[0];
      expect(NoLllmService.isFAQ(question)).toBe(true);
    });

    it('should return false if the question is not in the FAQ responses', () => {
      const question = 'What is your name?';
      expect(NoLllmService.isFAQ(question)).toBe(false);
    });
  });

  describe('getResponse', () => {
    it('should return suicide risk response if the question contains a suicide risk keyword', () => {
      const question = `I am feeling ${SUICIDE_RISK_KEYWORDS[0]}`;
      const expectedResponse: LlmResponse = {
        response: SUICIDE_RISK_RESPONSE,
        intent: Intent.SUICIDE_RISK,
      };
      expect(NoLllmService.getResponse(question)).toEqual(expectedResponse);
    });

    it('should return FAQ response if the question is in the FAQ responses', () => {
      const question = Object.keys(FAQ_RESPONSES)[0];
      const expectedResponse: LlmResponse = {
        response: FAQ_RESPONSES[question],
        intent: Intent.FAQ,
      };
      expect(NoLllmService.getResponse(question)).toEqual(expectedResponse);
    });

    it('should return normal response if the question is in the normal responses', () => {
      const question = Object.keys(NORMAL_RESPONSES)[0];
      const expectedResponse: LlmResponse = {
        response: NORMAL_RESPONSES[question],
        intent: Intent.NORMAL,
      };
      expect(NoLllmService.getResponse(question)).toEqual(expectedResponse);
    });

    it('should return check-in initiation text if the question is a check-in response or "Hi"', () => {
      const question = 'Hi';
      const expectedResponse: LlmResponse = {
        response: CHECK_IN_INITIATION_TEXT,
        intent: Intent.NORMAL,
      };
      expect(NoLllmService.getResponse(question)).toEqual(expectedResponse);
    });

    it('should return default response if the question is not recognized', () => {
      const question = 'What is your name?';
      const expectedResponse: LlmResponse = {
        response:
          "I'm sorry, I don't have an answer for that. Please check our FAQ page for more information.",
        intent: Intent.NORMAL,
      };
      expect(NoLllmService.getResponse(question)).toEqual(expectedResponse);
    });
  });
});
