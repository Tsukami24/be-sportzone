import { Pesanan, StatusPesanan } from '../entities/pesanan.entity';
import { PesananItemDto } from './pesanan-item.dto';

export class PesananDto {
  id: string;
  user_id: string;
  tanggal_pesanan: Date;
  total_harga: number;
  status: StatusPesanan;
  alamat_pengiriman: string;
  kota: string;
  provinsi: string;
  eta_min: number;
  eta_max: number;
  created_at: Date;
  updated_at: Date;

  user?: {
    id: string;
    username: string;
    email: string;
  };

  pesanan_items?: PesananItemDto[];

  constructor(pesanan: Pesanan) {
    this.id = pesanan.id;
    this.user_id = pesanan.user_id;
    this.tanggal_pesanan = pesanan.tanggal_pesanan;
    this.total_harga = pesanan.total_harga;
    this.status = pesanan.status;
    this.alamat_pengiriman = pesanan.alamat_pengiriman;
    this.kota = pesanan.kota;
    this.provinsi = pesanan.provinsi;
    this.eta_min = pesanan.eta_min;
    this.eta_max = pesanan.eta_max;
    this.created_at = pesanan.created_at;
    this.updated_at = pesanan.updated_at;

    this.user = pesanan.user
      ? {
          id: pesanan.user.id,
          username: pesanan.user.username,
          email: pesanan.user.email,
        }
      : undefined;

    this.pesanan_items = pesanan.pesanan_items?.map(
      (item) => new PesananItemDto(item),
    );
  }
}
