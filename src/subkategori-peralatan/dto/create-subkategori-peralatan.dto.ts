import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateSubkategoriPeralatanDto {
    @IsString()
    @IsNotEmpty()
    nama: string;

    @IsUUID()
    @IsNotEmpty()
    kategori_olahraga_id: string;
}
