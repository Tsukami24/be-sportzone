import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produk } from './entities/produk.entity';
import { CreateProdukDto } from './dto/create-produk.dto';
import { UpdateProdukDto } from './dto/update-produk.dto';
import { KategoriOlahraga } from '../kategori-olahraga/entities/kategori-olahraga.entity/kategori-olahraga.entity';
import { SubkategoriPeralatan } from '../subkategori-peralatan/entities/subkategori-peralatan.entity';

@Injectable()
export class ProdukService {
  constructor(
    @InjectRepository(Produk)
    private produkRepository: Repository<Produk>,
    @InjectRepository(KategoriOlahraga)
    private kategoriRepository: Repository<KategoriOlahraga>,
    @InjectRepository(SubkategoriPeralatan)
    private subkategoriRepository: Repository<SubkategoriPeralatan>,
  ) {}

  async create(createProdukDto: CreateProdukDto): Promise<Produk> {
    const kategori = await this.kategoriRepository.findOne({
      where: { id: createProdukDto.kategori_id }
    });
    if (!kategori) {
      throw new BadRequestException('Kategori tidak ditemukan');
    }

    const subkategori = await this.subkategoriRepository.findOne({
      where: { id: createProdukDto.subkategori_id }
    });
    if (!subkategori) {
      throw new BadRequestException('Subkategori tidak ditemukan');
    }

    if (subkategori.kategori_olahraga_id !== createProdukDto.kategori_id) {
      throw new BadRequestException('Subkategori tidak sesuai dengan kategori');
    }

    const produk = this.produkRepository.create(createProdukDto);
    return await this.produkRepository.save(produk);
  }

  async findAll(): Promise<Produk[]> {
    return await this.produkRepository.find({
      relations: ['kategori', 'subkategori'],
      order: { created_at: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Produk> {
    const produk = await this.produkRepository.findOne({
      where: { id },
      relations: ['kategori', 'subkategori']
    });

    if (!produk) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    return produk;
  }

  async update(id: string, updateProdukDto: UpdateProdukDto): Promise<Produk> {
    const produk = await this.findOne(id);

    if (updateProdukDto.kategori_id) {
      const kategori = await this.kategoriRepository.findOne({
        where: { id: updateProdukDto.kategori_id }
      });
      if (!kategori) {
        throw new BadRequestException('Kategori tidak ditemukan');
      }
    }

    if (updateProdukDto.subkategori_id) {
      const subkategori = await this.subkategoriRepository.findOne({
        where: { id: updateProdukDto.subkategori_id }
      });
      if (!subkategori) {
        throw new BadRequestException('Subkategori tidak ditemukan');
      }

      const kategoriId = updateProdukDto.kategori_id || produk.kategori_id;
      if (subkategori.kategori_olahraga_id !== kategoriId) {
        throw new BadRequestException('Subkategori tidak sesuai dengan kategori');
      }
    }

    Object.assign(produk, updateProdukDto);
    return await this.produkRepository.save(produk);
  }

  async remove(id: string): Promise<void> {
    const produk = await this.findOne(id);
    await this.produkRepository.softRemove(produk);
  }

  async findByKategori(kategoriId: string): Promise<Produk[]> {
    return await this.produkRepository.find({
      where: { kategori_id: kategoriId },
      relations: ['kategori', 'subkategori'],
      order: { created_at: 'DESC' }
    });
  }

  async findBySubkategori(subkategoriId: string): Promise<Produk[]> {
    return await this.produkRepository.find({
      where: { subkategori_id: subkategoriId },
      relations: ['kategori', 'subkategori'],
      order: { created_at: 'DESC' }
    });
  }
}

