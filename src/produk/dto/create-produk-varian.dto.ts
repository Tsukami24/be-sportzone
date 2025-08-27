import { IsString, IsNumber, IsUUID, IsOptional, Min } from 'class-validator';

export class CreateProdukVarianDto {
    @IsUUID()
    produk_id: string;

    @IsOptional()
    @IsString()
    ukuran?: string;

    @IsOptional()
    @IsString()
    warna?: string;

    @IsNumber()
    @Min(0)
    stok: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    harga?: number;

    @IsOptional()
    @IsString()
    sku?: string;
}