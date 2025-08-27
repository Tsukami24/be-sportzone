import { PesananItem } from "../entities/pesanan-item.entity";

export class PesananItemDto {
  id: string;
  pesanan_id: string;
  id_produk: string;
  produk_varian_id: string;
  kuantitas: number;
  harga_satuan: number;

  constructor(pesananItem: PesananItem) {
    this.id = pesananItem.id;
    this.pesanan_id = pesananItem.pesanan_id;
    this.id_produk = pesananItem.id_produk;
    this.produk_varian_id = pesananItem.produk_varian_id;
    this.kuantitas = pesananItem.kuantitas;
    this.harga_satuan = pesananItem.harga_satuan;
  }
}