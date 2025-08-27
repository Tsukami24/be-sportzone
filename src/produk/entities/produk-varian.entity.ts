import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Produk } from './produk.entity';
import { StatusProduk } from './produk.entity';

@Entity('produk_varian')
export class ProdukVarian {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  produk_id: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  ukuran: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  warna: string;

  @Column({ type: 'int' })
  stok: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  harga: number;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  sku: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Produk, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'produk_id' })
  produk: Produk;
}