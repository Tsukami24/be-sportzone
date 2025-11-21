import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity/user.entity';
import { PesananItem } from './pesanan-item.entity';
import { Pembayaran } from 'src/pembayaran/entities/pembayaran.entity';

export enum StatusPesanan {
  PENDING = 'pending',
  DIPROSES = 'diproses',
  DIKIRIM = 'dikirim',
  SELESAI = 'selesai',
  DIBATALKAN = 'dibatalkan',
  DIKEMBALIKAN = 'dikembalikan',
}

@Entity('pesanan')
export class Pesanan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'timestamp' })
  tanggal_pesanan: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total_harga: number;

  @Column({
    type: 'enum',
    enum: StatusPesanan,
    default: StatusPesanan.PENDING,
  })
  status: StatusPesanan;

  @Column({ type: 'text' })
  alamat_pengiriman: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  kota: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  provinsi: string;

  @Column({ type: 'int', nullable: true })
  eta_min: number;

  @Column({ type: 'int', nullable: true })
  eta_max: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => PesananItem, (pesananItem) => pesananItem.pesanan)
  pesanan_items: PesananItem[];

  @OneToOne(() => Pembayaran, (pembayaran) => pembayaran.pesanan)
  pembayaran: Pembayaran;
}
