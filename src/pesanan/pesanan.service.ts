import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pesanan } from './entities/pesanan.entity';
import { PesananItem } from './entities/pesanan-item.entity';
import { CreatePesananDto } from './dto/create-pesanan.dto';
import { UpdatePesananDto } from './dto/update-pesanan.dto';
import { CreatePesananItemDto } from './dto/create-pesanan-item.dto';
import { UpdatePesananItemDto } from './dto/update-pesanan-item.dto';

@Injectable()
export class PesananService {
  constructor(
    @InjectRepository(Pesanan) private readonly pesananRepo: Repository<Pesanan>,
    @InjectRepository(PesananItem) private readonly pesananItemRepo: Repository<PesananItem>,
  ) {}

  async create(createPesananDto: CreatePesananDto): Promise<Pesanan> {
    const pesanan = this.pesananRepo.create(createPesananDto);
    return this.pesananRepo.save(pesanan);
  }

  async findAll(): Promise<Pesanan[]> {
    return this.pesananRepo.find({ relations: ['user', 'pesanan_items'] });
  }

  async findOne(id: string): Promise<Pesanan> {
    const pesanan = await this.pesananRepo.findOne({ 
      where: { id },
      relations: ['user', 'pesanan_items'] 
    });
    if (!pesanan) {
      throw new Error('Pesanan tidak ditemukan');
    }
    return pesanan;
  }

  async update(id: string, updatePesananDto: UpdatePesananDto): Promise<Pesanan> {
    await this.pesananRepo.update(id, updatePesananDto);
    const updatedPesanan = await this.pesananRepo.findOne({ where: { id } });
    if (!updatedPesanan) {
      throw new Error('Pesanan tidak ditemukan');
    }
    return updatedPesanan;
  }

  async remove(id: string): Promise<void> {
    const result = await this.pesananRepo.delete(id);
    if (result.affected === 0) {
      throw new Error('Pesanan tidak ditemukan');
    }
  }

  // Pesanan Item methods
  async createItem(createPesananItemDto: CreatePesananItemDto): Promise<PesananItem> {
    const pesananItem = this.pesananItemRepo.create(createPesananItemDto);
    return this.pesananItemRepo.save(pesananItem);
  }

  async findAllItems(): Promise<PesananItem[]> {
    return this.pesananItemRepo.find({ relations: ['pesanan', 'produk', 'produk_varian'] });
  }

  async findOneItem(id: string): Promise<PesananItem> {
    const pesananItem = await this.pesananItemRepo.findOne({ 
      where: { id },
      relations: ['pesanan', 'produk', 'produk_varian'] 
    });
    if (!pesananItem) {
      throw new Error('Item pesanan tidak ditemukan');
    }
    return pesananItem;
  }

  async updateItem(id: string, updatePesananItemDto: UpdatePesananItemDto): Promise<PesananItem> {
    await this.pesananItemRepo.update(id, updatePesananItemDto);
    const updatedPesananItem = await this.pesananItemRepo.findOne({ where: { id } });
    if (!updatedPesananItem) {
      throw new Error('Item pesanan tidak ditemukan');
    }
    return updatedPesananItem;
  }

  async removeItem(id: string): Promise<void> {
    const result = await this.pesananItemRepo.delete(id);
    if (result.affected === 0) {
      throw new Error('Item pesanan tidak ditemukan');
    }
  }
}