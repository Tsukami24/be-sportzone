import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Keranjang } from './entities/keranjang.entity';
import { KeranjangItem } from './entities/keranjang-item.entity';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Produk } from '../produk/entities/produk.entity';

@Injectable()
export class KeranjangService {
	constructor(
		@InjectRepository(Keranjang) private readonly cartRepo: Repository<Keranjang>,
		@InjectRepository(KeranjangItem) private readonly itemRepo: Repository<KeranjangItem>,
		@InjectRepository(Produk) private readonly produkRepo: Repository<Produk>,
	) {}

	private async getOrCreateCart(userId: string): Promise<Keranjang> {
		let cart = await this.cartRepo.findOne({ where: { user_id: userId }, relations: ['items'] });
		if (!cart) {
			cart = this.cartRepo.create({ user_id: userId });
			await this.cartRepo.save(cart);
			cart.items = [];
		}
		return cart;
	}

	async getCart(userId: string): Promise<Keranjang> {
		return this.getOrCreateCart(userId);
	}

	async addItem(userId: string, dto: AddItemDto): Promise<Keranjang> {
		const cart = await this.getOrCreateCart(userId);

		const produk = await this.produkRepo.findOne({ where: { id: dto.produk_id } });
		if (!produk) throw new BadRequestException('Produk tidak ditemukan');

		// If same produk and varian exists, increase quantity
		const existing = (cart.items || []).find(
			(i) => i.produk_id === dto.produk_id && (i.produk_varian_id || null) === (dto.produk_varian_id || null),
		);
		if (existing) {
			existing.kuantitas += dto.kuantitas;
			await this.itemRepo.save(existing);
			return await this.getCart(userId);
		}

		const item = this.itemRepo.create({
			keranjang_id: cart.id,
			produk_id: dto.produk_id,
			produk_varian_id: dto.produk_varian_id ?? null,
			kuantitas: dto.kuantitas,
		});
		await this.itemRepo.save(item);
		return await this.getCart(userId);
	}

	async updateItem(userId: string, itemId: string, dto: UpdateItemDto): Promise<Keranjang> {
		const cart = await this.getOrCreateCart(userId);
		const item = await this.itemRepo.findOne({ where: { id: itemId, keranjang_id: cart.id } });
		if (!item) throw new NotFoundException('Item tidak ditemukan');
		item.kuantitas = dto.kuantitas;
		await this.itemRepo.save(item);
		return await this.getCart(userId);
	}

	async removeItem(userId: string, itemId: string): Promise<Keranjang> {
		const cart = await this.getOrCreateCart(userId);
		const item = await this.itemRepo.findOne({ where: { id: itemId, keranjang_id: cart.id } });
		if (!item) throw new NotFoundException('Item tidak ditemukan');
		await this.itemRepo.remove(item);
		return await this.getCart(userId);
	}

	async clear(userId: string): Promise<Keranjang> {
		const cart = await this.getOrCreateCart(userId);
		await this.itemRepo.delete({ keranjang_id: cart.id });
		return await this.getCart(userId);
	}
}
