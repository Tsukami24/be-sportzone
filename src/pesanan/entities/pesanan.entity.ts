import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity/user.entity';
import { PesananItem } from './pesanan-item.entity';

export enum StatusPesanan {
  PENDING = 'pending',
  DIPROSES = 'diproses',
  DIKIRIM = 'dikirim',
  SELESAI = 'selesai',
  DIBATALKAN = 'dibatalkan'
}

@Entity('pesanan')
export class Pesanan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'timestamp' })
  tanggal_pesanan: Date;

  @Column({ type: 'int' })
  total_harga: number;

  @Column({
    type: 'enum',
    enum: StatusPesanan,
    default: StatusPesanan.PENDING
  })
  status: StatusPesanan;

  @Column({ type: 'text' })
  alamat_pengiriman: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => PesananItem, pesananItem => pesananItem.pesanan)
  pesanan_items: PesananItem[];
}