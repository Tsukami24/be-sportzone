import { KategoriOlahraga } from "../entities/kategori-olahraga.entity/kategori-olahraga.entity";

export class KategoriOlahragaDto {
    id: string;
    nama: string;
    created_at: Date;
    updated_at: Date;

    constructor(kategori: KategoriOlahraga) {
        this.id = kategori.id;
        this.nama = kategori.nama;
        this.created_at = kategori.created_at;
        this.updated_at = kategori.updated_at;
    }
}