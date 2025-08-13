import { IsString, IsOptional } from "class-validator";

export class CreateKategoriOlahragaDto {
    @IsString()
    nama: string;

    @IsString()
    @IsOptional()
    deskripsi?: string;
}