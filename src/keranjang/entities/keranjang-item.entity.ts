import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Keranjang } from './keranjang.entity';
import { Produk } from '../../produk/entities/produk.entity';

@Entity('keranjang_item')
export class KeranjangItem {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ type: 'uuid' })
	keranjang_id: string;

	@ManyToOne(() => Keranjang, (k) => k.items, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'keranjang_id' })
	keranjang: Keranjang;

	@Column({ type: 'uuid', nullable: true })
	produk_id: string | null;

	@Column({ type: 'uuid', nullable: true })
	produk_varian_id: string | null;

	@ManyToOne(() => Produk, { onDelete: 'SET NULL', nullable: true })
	@JoinColumn({ name: 'produk_id' })
	produk: Produk | null;

	@Column({ type: 'int' })
	kuantitas: number;

	@CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	created_at: Date;

	@UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
	updated_at: Date;
}
