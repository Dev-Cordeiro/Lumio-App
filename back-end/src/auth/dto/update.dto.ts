import { IsString, IsOptional, IsNotEmpty, IsUrl } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  displayName?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsUrl() // Valida se é uma URL
  @IsOptional()
  avatar_url?: string;
}
