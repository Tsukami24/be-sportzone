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
import { MetodePembayaran } from 'src/pembayaran/entities/pembayaran.entity';

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
  status: StatusPesanan;

  @IsString()
  @IsNotEmpty()
  alamat_pengiriman: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePesananItemDto)
  items: CreatePesananItemDto[];

  @IsEnum(MetodePembayaran)
  metode_pembayaran: MetodePembayaran;
}
