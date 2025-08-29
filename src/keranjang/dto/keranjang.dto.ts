import { Keranjang } from '../entities/keranjang.entity';
import { KeranjangItem } from '../entities/keranjang-item.entity';

export class KeranjangItemDto {
	id: string;
	produk_id: string | null;
	produk_varian_id: string | null;
	kuantitas: number;
	created_at: Date;
	updated_at: Date;

	constructor(item: KeranjangItem) {
		this.id = item.id;
		this.produk_id = item.produk_id ?? null;
		this.produk_varian_id = item.produk_varian_id ?? null;
		this.kuantitas = item.kuantitas;
		this.created_at = item.created_at;
		this.updated_at = item.updated_at;
	}
}

export class KeranjangDto {
	id: string;
	user_id: string;
	items: KeranjangItemDto[];
	created_at: Date;
	updated_at: Date;

	constructor(cart: Keranjang) {
		this.id = cart.id;
		this.user_id = cart.user_id;
		this.items = (cart.items || []).map((i) => new KeranjangItemDto(i));
		this.created_at = cart.created_at;
		this.updated_at = cart.updated_at;
	}
}
