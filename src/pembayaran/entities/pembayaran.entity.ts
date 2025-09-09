import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Pesanan } from 'src/pesanan/entities/pesanan.entity';

export enum MetodePembayaran {
  COD = 'cod',
  MIDTRANS = 'midtrans',
}

export enum StatusPembayaran {
  BELUM_BAYAR = 'belum bayar',
  SUDAH_BAYAR = 'sudah bayar',
  GAGAL = 'gagal',
  DIKEMBALIKAN = 'dikembalikan',
}

@Entity('pembayaran')
export class Pembayaran {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Pesanan, (pesanan) => pesanan.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pesanan_id' })
  pesanan: Pesanan;

  @Column({
    type: 'enum',
    enum: MetodePembayaran,
    default: MetodePembayaran.MIDTRANS,
  })
  metode: MetodePembayaran;

  @Column({
    type: 'enum',
    enum: StatusPembayaran,
    default: StatusPembayaran.BELUM_BAYAR,
  })
  status: StatusPembayaran;

  @Column({ type: 'text', nullable: true })
  bukti_pembayaran: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
