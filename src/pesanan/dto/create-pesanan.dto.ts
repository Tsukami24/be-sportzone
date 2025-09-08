import {
  IsUUID,
  IsNumber,
  IsString,
  IsEnum,
  IsDateString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StatusPesanan } from '../entities/pesanan.entity';
import { CreatePesananItemDto } from './create-pesanan-item.dto';

export class CreatePesananDto {
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @IsDateString()
  @IsNotEmpty()
  tanggal_pesanan: string;

  @IsNumber()
  @IsNotEmpty()
  total_harga: number;

  @IsEnum(StatusPesanan)
  @IsNotEmpty()
  status: StatusPesanan;

  @IsString()
  @IsNotEmpty()
  alamat_pengiriman: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePesananItemDto)
  items: CreatePesananItemDto[];
}
