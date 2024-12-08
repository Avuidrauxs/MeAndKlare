/* eslint-disable import/no-extraneous-dependencies */
import { IsString, MinLength, IsDefined, IsNotEmpty } from 'class-validator';

export class UserDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  username!: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password!: string;
}
