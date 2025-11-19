import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Produk } from '../../produk/entities/produk.entity';
import { ProdukVarian } from '../../produk/entities/produk-varian.entity';
import { Pengembalian } from './pengembalian.entity';

@Entity('produk_rusak')
export class ProdukRusak {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  pengembalian_id: string;

  @Column({ type: 'uuid' })
  produk_id: string;

  @Column({ type: 'uuid', nullable: true })
  produk_varian_id: string | null;

  @Column({ type: 'int' })
  jumlah: number;

  @Column({ type: 'text', nullable: true })
  deskripsi_kerusakan: string | null;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Pengembalian, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pengembalian_id' })
  pengembalian: Pengembalian;

  @ManyToOne(() => Produk, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'produk_id' })
  produk: Produk;

  @ManyToOne(() => ProdukVarian, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'produk_varian_id' })
  produk_varian: ProdukVarian;
}
