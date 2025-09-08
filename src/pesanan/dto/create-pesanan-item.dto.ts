import { IsUUID, IsInt, IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePesananItemDto {
  @IsUUID()
  @IsNotEmpty()
  id_produk: string;

  @IsUUID() 
  produk_varian_id?: string;

  @IsInt()
  @IsNotEmpty()
  kuantitas: number;

  @IsNumber()
  @IsNotEmpty()
  harga_satuan: number;
}
