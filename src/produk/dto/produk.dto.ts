export class ProdukDto {
    id: string;
    subkategori_id: string;
    brand_id: string;
    nama: string;
    deskripsi: string;
    harga: number;
    gambar?: string;
    status: string;
    created_at: Date;
    updated_at: Date;
    subkategori?: {
        id: string;
        nama: string;
    };
    brand?: {
        id: string;
        nama: string;
    };
    varian?: {
        id: string;
        ukuran?: string;
        warna?: string;
        stok: number;
        harga?: number;
        sku?: string;
    }[];

    constructor(produk: any) {
        this.id = produk.id;
        this.subkategori_id = produk.subkategori_id;
        this.brand_id = produk.brand_id;
        this.nama = produk.nama;
        this.deskripsi = produk.deskripsi;
        this.harga = produk.harga;
        this.gambar = produk.gambar;
        this.status = produk.status;
        this.created_at = produk.created_at;
        this.updated_at = produk.updated_at;
        this.subkategori = produk.subkategori ? {
            id: produk.subkategori.id,
            nama: produk.subkategori.nama
        } : undefined;
        this.brand = produk.brand ? {
            id: produk.brand.id,
            nama: produk.brand.nama
        } : undefined;
        this.varian = produk.varian ? produk.varian.map((v: any) => ({
            id: v.id,
            ukuran: v.ukuran,
            warna: v.warna,
            stok: v.stok,
            harga: v.harga,
            sku: v.sku
        })) : undefined;
    }
}
