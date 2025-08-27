import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { SubkategoriPeralatan } from '../../subkategori-peralatan/entities/subkategori-peralatan.entity';
import { Brand } from '../../brand/entities/brand.entity';
import { ProdukVarian } from './produk-varian.entity';

export enum StatusProduk {
  AKTIF = 'aktif',
  NONAKTIF = 'nonaktif',
  STOK_HABIS = 'stok habis'
}

@Entity('produk')
export class Produk {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    subkategori_id: string;

    @Column({ type: 'uuid' })
    brand_id: string;

    @Column({ length: 100 })
    nama: string;

    @Column({ type: 'text' })
    deskripsi: string;

    @Column({ type: 'decimal', precision: 12, scale: 2 })
    harga: number;

    @Column({ type: 'text', nullable: true })
    gambar: string;

    @Column({
      type: 'enum',
      enum: StatusProduk,
      default: StatusProduk.AKTIF
    })
    status: StatusProduk;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;

    @ManyToOne(() => SubkategoriPeralatan, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'subkategori_id' })
    subkategori: SubkategoriPeralatan;

    @ManyToOne(() => Brand, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'brand_id' })
    brand: Brand;

    @OneToMany(() => ProdukVarian, varian => varian.produk)
    varian: ProdukVarian[];
}



