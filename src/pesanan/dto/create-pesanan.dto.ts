import {
  IsUUID,
  IsNumber,
  IsString,
  IsDateString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsIn,
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

  @IsString()
  @IsIn(['cod', 'midtrans'])
  @IsNotEmpty()
  metode_pembayaran: 'cod' | 'midtrans';

  @IsString()
  @IsNotEmpty()
  alamat_pengiriman: string;

  @IsString()
  @IsNotEmpty()
  kota: string;

  @IsString()
  @IsNotEmpty()
  provinsi: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePesananItemDto)
  items: CreatePesananItemDto[];
}
