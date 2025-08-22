export class ProdukDto {
    id: string;
    kategori_id: string;
    subkategori_id: string;
    nama: string;
    deskripsi: string;
    harga: number;
    stok: number;
    gambar?: string;
    created_at: Date;
    updated_at: Date;
    kategori?: {
        id: string;
        nama: string;
    };
    subkategori?: {
        id: string;
        nama: string;
    };

    constructor(produk: any) {
        this.id = produk.id;
        this.kategori_id = produk.kategori_id;
        this.subkategori_id = produk.subkategori_id;
        this.nama = produk.nama;
        this.deskripsi = produk.deskripsi;
        this.harga = produk.harga;
        this.stok = produk.stok;
        this.gambar = produk.gambar;
        this.created_at = produk.created_at;
        this.updated_at = produk.updated_at;
        this.kategori = produk.kategori ? {
            id: produk.kategori.id,
            nama: produk.kategori.nama
        } : undefined;
        this.subkategori = produk.subkategori ? {
            id: produk.subkategori.id,
            nama: produk.subkategori.nama
        } : undefined;
    }
}
