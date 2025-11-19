import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { AlasanPengembalian } from '../entities/pengembalian.entity';

export class CreatePengembalianDto {
  @IsUUID()
  @IsNotEmpty()
  pesanan_id: string;

  @IsEnum(AlasanPengembalian)
  @IsNotEmpty()
  alasan: AlasanPengembalian;

  @IsString()
  @IsOptional()
  keterangan?: string;

  @IsString()
  @IsOptional()
  bukti_foto?: string;
}
