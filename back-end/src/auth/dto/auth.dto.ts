import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class AuthDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
