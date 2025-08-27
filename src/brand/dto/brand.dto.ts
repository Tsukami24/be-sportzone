import { Brand } from '../entities/brand.entity';

export class BrandDto {
  id: string;
  nama: string;
  deskripsi: string | null;
  logo: string | null;
  created_at: Date;
  updated_at: Date;

  constructor(brand: Brand) {
    this.id = brand.id;
    this.nama = brand.nama;
    this.deskripsi = brand.deskripsi ?? null;
    this.logo = brand.logo ?? null;
    this.created_at = brand.created_at;
    this.updated_at = brand.updated_at;
  }
}

