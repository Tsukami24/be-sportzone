import { IsString, IsNumber, IsUUID, IsOptional, Min, IsUrl, IsEnum } from 'class-validator';
import { StatusProduk } from '../entities/produk.entity';

export class CreateProdukDto {
    @IsUUID()
    subkategori_id: string;

    @IsUUID()
    brand_id: string;

    @IsString()
    nama: string;

    @IsString()
    deskripsi: string;

    @IsNumber()
    @Min(0)
    harga: number;

    @IsOptional()
    @IsString()
    @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
    gambar?: string;

    @IsOptional()
    @IsEnum(StatusProduk)
    status?: StatusProduk;
}




