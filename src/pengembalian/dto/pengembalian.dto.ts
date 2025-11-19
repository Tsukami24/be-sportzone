import { Pengembalian } from '../entities/pengembalian.entity';

export class PengembalianDto {
  id: string;
  pesanan_id: string;
  user_id: string;
  alasan: string;
  keterangan: string | null;
  bukti_foto: string | null;
  status: string;
  catatan_admin: string | null;
  processed_by: string | null;
  processed_at: Date | null;
  created_at: Date;
  updated_at: Date;
  pesanan?: any;
  user?: any;
  admin?: any;

  constructor(pengembalian: Pengembalian) {
    this.id = pengembalian.id;
    this.pesanan_id = pengembalian.pesanan_id;
    this.user_id = pengembalian.user_id;
    this.alasan = pengembalian.alasan;
    this.keterangan = pengembalian.keterangan;
    this.bukti_foto = pengembalian.bukti_foto;
    this.status = pengembalian.status;
    this.catatan_admin = pengembalian.catatan_admin;
    this.processed_by = pengembalian.processed_by;
    this.processed_at = pengembalian.processed_at;
    this.created_at = pengembalian.created_at;
    this.updated_at = pengembalian.updated_at;

    if (pengembalian.pesanan) {
      this.pesanan = pengembalian.pesanan;
    }
    if (pengembalian.user) {
      this.user = pengembalian.user;
    }
    if (pengembalian.admin) {
      this.admin = pengembalian.admin;
    }
  }
}
