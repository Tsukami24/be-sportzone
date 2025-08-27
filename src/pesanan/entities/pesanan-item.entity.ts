import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Pesanan } from './pesanan.entity';
import { Produk } from '../../produk/entities/produk.entity';
import { ProdukVarian } from '../../produk/entities/produk-varian.entity';

@Entity('pesanan_item')
export class PesananItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  pesanan_id: string;

  @Column({ type: 'uuid' })
  id_produk: string;

  @Column({ type: 'uuid', nullable: true })
  produk_varian_id: string;

  @Column({ type: 'int' })
  kuantitas: number;

  @Column({ type: 'int' })
  harga_satuan: number;

  @ManyToOne(() => Pesanan, pesanan => pesanan.pesanan_items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pesanan_id' })
  pesanan: Pesanan;

  @ManyToOne(() => Produk, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_produk' })
  produk: Produk;

  @ManyToOne(() => ProdukVarian, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'produk_varian_id' })
  produk_varian: ProdukVarian;
}