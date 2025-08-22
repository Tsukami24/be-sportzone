import { IsString, IsNumber, IsUUID, IsOptional, Min, IsUrl } from 'class-validator';

export class CreateProdukDto {
    @IsUUID()
    kategori_id: string;

    @IsUUID()
    subkategori_id: string;

    @IsString()
    nama: string;

    @IsString()
    deskripsi: string;

    @IsNumber()
    @Min(0)
    harga: number;

    @IsNumber()
    @Min(0)
    stok: number;

    @IsOptional()
    @IsString()
    @IsUrl()
    gambar?: string;
}

