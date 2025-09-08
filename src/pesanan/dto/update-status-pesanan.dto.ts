import { IsEnum, IsOptional } from 'class-validator';
import { StatusPesanan } from '../entities/pesanan.entity';

export class UpdateStatusPesananDto {
  @IsEnum(StatusPesanan)
  status: StatusPesanan;

  @IsOptional()
  updatedByRole?: 'admin' | 'customer';
}
