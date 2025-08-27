import { IsUUID, IsInt, IsNotEmpty } from "class-validator";

export class CreatePesananItemDto {
  @IsUUID()
  @IsNotEmpty()
  pesanan_id: string;

  @IsUUID()
  @IsNotEmpty()
  id_produk: string;

  @IsUUID()
  produk_varian_id: string;

  @IsInt()
  @IsNotEmpty()
  kuantitas: number;

  @IsInt()
  @IsNotEmpty()
  harga_satuan: number;
}