import { IsString, IsEmail, IsOptional } from 'class-validator';

export class UpdateCustomerProfileDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
