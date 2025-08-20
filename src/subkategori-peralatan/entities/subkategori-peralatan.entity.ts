import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { KategoriOlahraga } from '../../kategori-olahraga/entities/kategori-olahraga.entity/kategori-olahraga.entity';

@Entity('subkategori_peralatan')
export class SubkategoriPeralatan {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    nama: string;

    @Column({ type: 'text', nullable: true })
    deskripsi: string;

    @Column({ type: 'uuid' })
    kategori_olahraga_id: string;

    @ManyToOne(() => KategoriOlahraga, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'kategori_olahraga_id' })
    kategoriOlahraga: KategoriOlahraga;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
