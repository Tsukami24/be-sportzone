import { IsOptional, IsString, Length, IsUrl } from 'class-validator';

export class CreateBrandDto {
  @IsString()
  @Length(1, 100)
  nama: string;

  @IsOptional()
  @IsString()
  deskripsi?: string;

  @IsOptional()
  @IsUrl(
    { protocols: ['http', 'https'], require_protocol: true },
    { each: true },
  )
  logo?: string;
}
