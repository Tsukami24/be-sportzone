import { IsUUID, IsInt, IsString, IsEnum, IsDateString, IsNotEmpty } from "class-validator";
import { StatusPesanan } from "../entities/pesanan.entity";

export class CreatePesananDto {
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @IsDateString()
  @IsNotEmpty()
  tanggal_pesanan: Date;

  @IsInt()
  @IsNotEmpty()
  total_harga: number;

  @IsEnum(StatusPesanan)
  @IsNotEmpty()
  status: StatusPesanan;

  @IsString()
  @IsNotEmpty()
  alamat_pengiriman: string;
}