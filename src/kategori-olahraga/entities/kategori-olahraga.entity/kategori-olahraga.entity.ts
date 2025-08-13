import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('kategori_olahraga')
export class KategoriOlahraga {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    nama: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}