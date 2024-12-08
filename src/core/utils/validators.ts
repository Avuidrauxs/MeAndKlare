/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable import/no-extraneous-dependencies */
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import sanitizeHtml from 'sanitize-html';
import { decode, encode } from 'gpt-3-encoder';
import {
  RegExpMatcher,
  TextCensor,
  englishDataset,
  englishRecommendedTransformers,
} from 'obscenity';
import { ValidationError as ValidationsError } from '../errors';

const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

const censor = new TextCensor();

export class GlobalValidator {
  static async validateInput<T extends object>(
    cls: new () => T,
    plainObject: object,
  ): Promise<T> {
    const instance = plainToClass(cls, plainObject);
    const errors: ValidationError[] = await validate(instance);

    if (errors.length > 0) {
      const errorMessages = errors
        .map((error) => Object.values(error.constraints || {}))
        .flat();
      throw new ValidationsError(
        `Validation failed: ${errorMessages.join(', ')}`,
      );
    }

    return instance;
  }

  static sanitizeInput(input: string): string {
    // Remove HTML and script tags
    let sanitizedInput = sanitizeHtml(input, {
      allowedTags: [],
      allowedAttributes: {},
    });

    // Escape special characters
    sanitizedInput = sanitizedInput.replace(/[&<>"'`=/]/g, function (s) {
      return `&#${s.charCodeAt(0)};`;
    });

    // Filter profanity and offensive language
    const matches = matcher.getAllMatches(sanitizedInput);

    sanitizedInput = censor.applyTo(input, matches);

    // Normalize whitespace
    sanitizedInput = sanitizedInput.replace(/\s+/g, ' ').trim();

    // Limit input length
    const maxLength = 1000;
    if (sanitizedInput.length > maxLength) {
      sanitizedInput = sanitizedInput.substring(0, maxLength);
    }

    return sanitizedInput;
  }

  static truncateInput(input: string, maxTokens: number): string {
    const tokens = encode(input);
    if (tokens.length > maxTokens) {
      const truncatedTokens = tokens.slice(0, maxTokens);
      return truncatedTokens.map((token) => decode([token])).join('');
    }
    return input;
  }
}
