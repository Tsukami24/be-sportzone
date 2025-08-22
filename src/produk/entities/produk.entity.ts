import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { KategoriOlahraga } from '../../kategori-olahraga/entities/kategori-olahraga.entity/kategori-olahraga.entity';
import { SubkategoriPeralatan } from '../../subkategori-peralatan/entities/subkategori-peralatan.entity';

@Entity('produk')
export class Produk {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    kategori_id: string;

    @Column({ type: 'uuid' })
    subkategori_id: string;

    @Column({ length: 255 })
    nama: string;

    @Column({ type: 'text' })
    deskripsi: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    harga: number;

    @Column({ type: 'int' })
    stok: number;

    @Column({ type: 'text', nullable: true })
    gambar: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn()
    deleted_at: Date;

    @ManyToOne(() => KategoriOlahraga, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'kategori_id' })
    kategori: KategoriOlahraga;

    @ManyToOne(() => SubkategoriPeralatan, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'subkategori_id' })
    subkategori: SubkategoriPeralatan;
}

