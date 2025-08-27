export class ProdukVarianDto {
    id: string;
    produk_id: string;
    ukuran?: string;
    warna?: string;
    stok: number;
    harga?: number;
    sku?: string;
    created_at: Date;
    updated_at: Date;

    constructor(varian: any) {
        this.id = varian.id;
        this.produk_id = varian.produk_id;
        this.ukuran = varian.ukuran;
        this.warna = varian.warna;
        this.stok = varian.stok;
        this.harga = varian.harga;
        this.sku = varian.sku;
        this.created_at = varian.created_at;
        this.updated_at = varian.updated_at;
    }
}