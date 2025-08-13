import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KategoriOlahraga } from './entities/kategori-olahraga.entity/kategori-olahraga.entity';
import { CreateKategoriOlahragaDto } from './dto/create-kategori-olahraga.dto';
import { UpdateKategoriOlahragaDto } from './dto/update-kategori-olahraga.dto';

@Injectable()
export class KategoriOlahragaService {
  constructor(
    @InjectRepository(KategoriOlahraga) private readonly kategoriRepo: Repository<KategoriOlahraga>,
  ) {}

  async create(createKategoriOlahragaDto: CreateKategoriOlahragaDto): Promise<KategoriOlahraga> {
    const kategori = this.kategoriRepo.create(createKategoriOlahragaDto);
    return this.kategoriRepo.save(kategori);
  }

  async findAll(): Promise<KategoriOlahraga[]> {
    return this.kategoriRepo.find();
  }

  async findOne(id: string): Promise<KategoriOlahraga> {
    const kategori = await this.kategoriRepo.findOne({ where: { id } });
    if (!kategori) {
      throw new Error('Kategori olahraga tidak ditemukan');
    }
    return kategori;
  }

  async update(id: string, updateKategoriOlahragaDto: UpdateKategoriOlahragaDto): Promise<KategoriOlahraga> {
    await this.kategoriRepo.update(id, updateKategoriOlahragaDto);
    const updatedKategori = await this.kategoriRepo.findOne({ where: { id } });
    if (!updatedKategori) {
      throw new Error('Kategori olahraga tidak ditemukan');
    }
    return updatedKategori;
  }

  async remove(id: string): Promise<void> {
    const result = await this.kategoriRepo.delete(id);
    if (result.affected === 0) {
      throw new Error('Kategori olahraga tidak ditemukan');
    }
  }
}