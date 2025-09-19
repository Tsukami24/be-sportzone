import { PesananItem } from "../entities/pesanan-item.entity";

export class PesananItemDto {
  id: string;
  pesanan_id: string;
  id_produk: string;
  produk_varian_id?: string;
  kuantitas: number;
  harga_satuan: number;

  produk?: {
    id: string;
    nama: string;
  };

  produk_varian?: {
    id: string;
    warna_varian: string;
    ukuran: string;
  };

  constructor(pesananItem: PesananItem) {
    this.id = pesananItem.id;
    this.pesanan_id = pesananItem.pesanan_id;
    this.id_produk = pesananItem.id_produk;
    this.produk_varian_id = pesananItem.produk_varian_id;
    this.kuantitas = pesananItem.kuantitas;
    this.harga_satuan = pesananItem.harga_satuan;

    this.produk = pesananItem.produk
      ? {
          id: pesananItem.produk.id,
          nama: pesananItem.produk.nama,
        }
      : undefined;

    this.produk_varian = pesananItem.produk_varian
      ? {
          id: pesananItem.produk_varian.id,
          warna_varian: pesananItem.produk_varian.warna,
          ukuran: pesananItem.produk_varian.ukuran,
        }
      : undefined;
  }
}