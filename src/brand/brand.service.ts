import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Brand } from './entities/brand.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepo: Repository<Brand>,
  ) {}

  private normalizeName(nama: string) {
    return nama.trim();
  }

  // Membuat data Brand
  async create(dto: CreateBrandDto): Promise<Brand> {
    const nama = this.normalizeName(dto.nama);

    const exists = await this.brandRepo.findOne({
      where: { nama: ILike(nama) },
    });
    if (exists) throw new BadRequestException('Nama brand sudah digunakan');

    const brand = this.brandRepo.create({
      nama,
      deskripsi: dto.deskripsi?.trim?.() || null,
      logo: dto.logo?.trim?.() || null,
    });

    try {
      return await this.brandRepo.save(brand);
    } catch (err: any) {
      if (err?.code === '23505')
        throw new BadRequestException('Nama brand sudah digunakan');
      throw err;
    }
  }

  // Melihat data semua brand
  async findAll(): Promise<Brand[]> {
    return this.brandRepo.find({ order: { created_at: 'DESC' } });
  }

  // melihat data brand sesuai id
  async findOne(id: string): Promise<Brand> {
    const brand = await this.brandRepo.findOne({ where: { id } });
    if (!brand) throw new NotFoundException('Brand tidak ditemukan');
    return brand;
  }

  // mengupdate data brand
  async update(id: string, dto: UpdateBrandDto): Promise<Brand> {
    const brand = await this.findOne(id);

    if (dto.nama !== undefined) {
      const nama = this.normalizeName(dto.nama);
      if (nama !== brand.nama) {
        const exists = await this.brandRepo.findOne({
          where: { nama: ILike(nama) },
        });

        if (exists && exists.id !== id) {
          throw new BadRequestException('Nama brand sudah digunakan');
        }
        brand.nama = nama;
      }
    }

    if (dto.deskripsi !== undefined) {
      brand.deskripsi = dto.deskripsi?.trim?.() || null;
    }
    if (dto.logo !== undefined) {
      brand.logo = dto.logo?.trim?.() || null;
    }

    try {
      return await this.brandRepo.save(brand);
    } catch (err: any) {
      if (err?.code === '23505')
        throw new BadRequestException('Nama brand sudah digunakan');
      throw err;
    }
  }

  // menghapus data brand
  async remove(id: string): Promise<void> {
    const brand = await this.findOne(id);
    await this.brandRepo.remove(brand);
  }
}
