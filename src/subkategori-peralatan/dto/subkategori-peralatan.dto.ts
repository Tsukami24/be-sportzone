export class SubkategoriPeralatanDto {
    id: string;
    nama: string;
    kategori_olahraga_id: string;
    kategori_olahraga?: {
        id: string;
        nama: string;
    };
    created_at: Date;
    updated_at: Date;
}
