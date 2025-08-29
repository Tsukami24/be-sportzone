import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produk } from './entities/produk.entity';
import { ProdukVarian } from './entities/produk-varian.entity';
import { CreateProdukDto } from './dto/create-produk.dto';
import { UpdateProdukDto } from './dto/update-produk.dto';
import { CreateProdukVarianDto } from './dto/create-produk-varian.dto';
import { UpdateProdukVarianDto } from './dto/update-produk-varian.dto';
import { SubkategoriPeralatan } from '../subkategori-peralatan/entities/subkategori-peralatan.entity';
import { Brand } from '../brand/entities/brand.entity';

@Injectable()
export class ProdukService {
  constructor(
    @InjectRepository(Produk)
    private produkRepository: Repository<Produk>,
    @InjectRepository(ProdukVarian)
    private varianRepository: Repository<ProdukVarian>,
    @InjectRepository(SubkategoriPeralatan)
    private subkategoriRepository: Repository<SubkategoriPeralatan>,
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
  ) {}

  async create(createProdukDto: CreateProdukDto): Promise<Produk> {
    if (createProdukDto.gambar && createProdukDto.gambar.startsWith('blob:')) {
      throw new BadRequestException('URL gambar tidak valid. Harus http/https, bukan blob:');
    }
    const subkategori = await this.subkategoriRepository.findOne({
      where: { id: createProdukDto.subkategori_id },
    });
    if (!subkategori) {
      throw new BadRequestException('Subkategori tidak ditemukan');
    }

    const brand = await this.brandRepository.findOne({
      where: { id: createProdukDto.brand_id },
    });
    if (!brand) {
      throw new BadRequestException('Brand tidak ditemukan');
    }

    const produk = this.produkRepository.create(createProdukDto);
    return await this.produkRepository.save(produk);
  }

  async createVarian(
    createVarianDto: CreateProdukVarianDto,
  ): Promise<ProdukVarian> {
    const produk = await this.produkRepository.findOne({
      where: { id: createVarianDto.produk_id },
    });
    if (!produk) {
      throw new BadRequestException('Produk tidak ditemukan');
    }

    const varian = this.varianRepository.create(createVarianDto);
    return await this.varianRepository.save(varian);
  }

  async findAll(): Promise<Produk[]> {
    return await this.produkRepository.find({
      relations: ['subkategori', 'brand', 'varian'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Produk> {
    const produk = await this.produkRepository.findOne({
      where: { id },
      relations: ['subkategori', 'brand', 'varian'],
    });

    if (!produk) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    return produk;
  }

  async findVarianById(id: string): Promise<ProdukVarian> {
    const varian = await this.varianRepository.findOne({
      where: { id },
      relations: ['produk'],
    });

    if (!varian) {
      throw new NotFoundException('Varian tidak ditemukan');
    }

    return varian;
  }

  async findVarianByProduk(produkId: string): Promise<ProdukVarian[]> {
    const produk = await this.produkRepository.findOne({
      where: { id: produkId },
    });
    if (!produk) {
      throw new NotFoundException('Produk tidak ditemukan');
    }

    return await this.varianRepository.find({
      where: { produk_id: produkId },
      order: { created_at: 'DESC' },
    });
  }

  async update(id: string, updateProdukDto: UpdateProdukDto): Promise<Produk> {
    const produk = await this.findOne(id);

    if (updateProdukDto.gambar && updateProdukDto.gambar.startsWith('blob:')) {
      throw new BadRequestException('URL gambar tidak valid. Harus http/https, bukan blob:');
    }

    if (updateProdukDto.subkategori_id) {
      const subkategori = await this.subkategoriRepository.findOne({
        where: { id: updateProdukDto.subkategori_id },
      });
      if (!subkategori) {
        throw new BadRequestException('Subkategori tidak ditemukan');
      }
    }

    if (updateProdukDto.brand_id) {
      const brand = await this.brandRepository.findOne({
        where: { id: updateProdukDto.brand_id },
      });
      if (!brand) {
        throw new BadRequestException('Brand tidak ditemukan');
      }
    }

    Object.assign(produk, updateProdukDto);
    return await this.produkRepository.save(produk);
  }

  async updateVarian(
    id: string,
    updateVarianDto: UpdateProdukVarianDto,
  ): Promise<ProdukVarian> {
    const varian = await this.findVarianById(id);

    if (updateVarianDto.produk_id) {
      const produk = await this.produkRepository.findOne({
        where: { id: updateVarianDto.produk_id },
      });
      if (!produk) {
        throw new BadRequestException('Produk tidak ditemukan');
      }
    }

    Object.assign(varian, updateVarianDto);
    return await this.varianRepository.save(varian);
  }

  async remove(id: string): Promise<void> {
    const produk = await this.findOne(id);
    await this.produkRepository.softRemove(produk);
  }

  async removeVarian(id: string): Promise<void> {
    const varian = await this.findVarianById(id);
    await this.varianRepository.softRemove(varian);
  }

  async findBySubkategori(subkategoriId: string): Promise<Produk[]> {
    return await this.produkRepository.find({
      where: { subkategori_id: subkategoriId },
      relations: ['subkategori', 'brand', 'varian'],
      order: { created_at: 'DESC' },
    });
  }

  async findByKategori(kategoriId: string): Promise<Produk[]> {
    return await this.produkRepository.find({
      where: {
        subkategori: {
          kategori_olahraga_id: kategoriId,
        },
      },
      relations: ['subkategori', 'brand', 'varian'],
      order: { created_at: 'DESC' },
    });
  }

  async findByBrand(brandId: string): Promise<Produk[]> {
    return await this.produkRepository.find({
      where: { brand_id: brandId },
      relations: ['subkategori', 'brand', 'varian'],
      order: { created_at: 'DESC' },
    });
  }
}




