/* eslint-disable import/no-extraneous-dependencies */
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Context, FlowType, Intent, MessageArray } from '../../core/types';

export class ContextDto implements Context {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  @Type(() => String)
  flow!: FlowType;

  @IsString()
  @IsOptional()
  lastMessage?: string;

  @IsString()
  @IsOptional()
  lastResponse?: string;

  @IsString()
  @IsOptional()
  mood?: string;

  @IsDateString()
  @IsOptional()
  lastUpdated!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  @IsOptional()
  llmContext?: unknown[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  @IsOptional()
  chatHistory?: MessageArray;

  @IsOptional()
  @Type(() => Object)
  metadata?: Record<string, unknown>;

  @IsString()
  @IsOptional()
  sessionId!: string;

  @IsOptional()
  @IsString()
  intent?: Intent | undefined;
}
