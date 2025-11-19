import { IsEnum, IsOptional, IsString } from 'class-validator';
import { StatusPengembalian } from '../entities/pengembalian.entity';

export class UpdatePengembalianDto {
  @IsEnum(StatusPengembalian)
  @IsOptional()
  status?: StatusPengembalian;

  @IsString()
  @IsOptional()
  catatan_admin?: string;
}
