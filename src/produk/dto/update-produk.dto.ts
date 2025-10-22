import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateProdukDto } from './create-produk.dto';
import {
  IsOptional,
  IsArray,
  ValidateNested,
  IsString,
  IsInt,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class GambarUpdateDto {
  @IsOptional()
  @IsInt()
  index?: number;

  @IsString()
  url: string;
}

export class UpdateProdukDto extends PartialType(
  OmitType(CreateProdukDto, ['gambar'] as const),
) {
  @IsOptional()
  @IsNumber()
  @Min(0)
  stok?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GambarUpdateDto)
  gambar?: (string | GambarUpdateDto)[];
}
