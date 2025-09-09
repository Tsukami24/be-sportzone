import { IsEnum, IsNotEmpty } from 'class-validator';
import { StatusPembayaran } from '../entities/pembayaran.entity';

export class UpdateStatusPembayaranDto {
  @IsEnum(StatusPembayaran)
  @IsNotEmpty()
  status: StatusPembayaran;
}
