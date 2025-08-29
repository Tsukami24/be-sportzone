import { IsOptional, IsString, Length } from 'class-validator';

export class CreateBrandDto {
  @IsString()
  @Length(1, 100)
  nama: string;

  @IsOptional()
  @IsString()
  deskripsi?: string;

  @IsOptional()
  @IsString()
  logo?: string;
}


