import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Pesanan } from '../../pesanan/entities/pesanan.entity';
import { User } from '../../users/entities/user.entity/user.entity';

export enum StatusPengembalian {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum AlasanPengembalian {
  RUSAK = 'rusak',
  SALAH_VARIAN = 'salah varian',
  TIDAK_SESUAI = 'tidak sesuai',
  LAINNYA = 'lainnya',
}

@Entity('pengembalian')
export class Pengembalian {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  pesanan_id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({
    type: 'enum',
    enum: AlasanPengembalian,
  })
  alasan: AlasanPengembalian;

  @Column({ type: 'text', nullable: true })
  keterangan: string | null;

  @Column({ type: 'text', nullable: true })
  bukti_foto: string | null;

  @Column({
    type: 'enum',
    enum: StatusPengembalian,
    default: StatusPengembalian.PENDING,
  })
  status: StatusPengembalian;

  @Column({ type: 'text', nullable: true })
  catatan_admin: string | null;

  @Column({ type: 'uuid', nullable: true })
  processed_by: string | null;

  @Column({ type: 'timestamp', nullable: true })
  processed_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Pesanan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pesanan_id' })
  pesanan: Pesanan;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'processed_by' })
  admin: User;
}
