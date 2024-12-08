/* eslint-disable import/no-extraneous-dependencies */
import { IsString, IsDefined, IsNotEmpty } from 'class-validator';

export class InputDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  input!: string;
}
