import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produk, StatusProduk } from './entities/produk.entity';
import { ProdukVarian } from './entities/produk-varian.entity';
import { CreateProdukDto } from './dto/create-produk.dto';
import { UpdateProdukDto } from './dto/update-produk.dto';
import { CreateProdukVarianDto } from './dto/create-produk-varian.dto';
import { UpdateProdukVarianDto } from './dto/update-produk-varian.dto';
import { SubkategoriPeralatan } from '../subkategori-peralatan/entities/subkategori-peralatan.entity';
import { Brand } from '../brand/entities/brand.entity';
import { PesananItem } from '../pesanan/entities/pesanan-item.entity';
import { StatusPesanan } from '../pesanan/entities/pesanan.entity';
import * as ExcelJS from 'exceljs';

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
    @InjectRepository(PesananItem)
    private pesananItemRepository: Repository<PesananItem>,
  ) {}

  async create(createProdukDto: CreateProdukDto): Promise<Produk> {
    if (createProdukDto.gambar && createProdukDto.gambar.length > 0) {
      const invalid = createProdukDto.gambar.find((g) => g.startsWith('blob:'));
      if (invalid) {
        throw new BadRequestException(
          'URL gambar tidak valid. Harus http/https, bukan blob:',
        );
      }
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

    // Validasi stok: jika stok disediakan, pastikan nilainya valid
    if (createProdukDto.stok !== undefined && createProdukDto.stok < 0) {
      throw new BadRequestException('Stok tidak boleh negatif');
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

    // Jika produk belum memiliki varian, set stok produk menjadi null
    const existingVarians = await this.varianRepository.find({
      where: { produk_id: createVarianDto.produk_id },
    });
    if (existingVarians.length === 0) {
      // Ini adalah varian pertama, set stok produk menjadi null
      produk.stok = null;
      await this.produkRepository.save(produk);
    }

    const varian = this.varianRepository.create(createVarianDto);
    return await this.varianRepository.save(varian);
  }

  async findAll(): Promise<Produk[]> {
    return await this.produkRepository.find({
      relations: [
        'subkategori',
        'subkategori.kategoriOlahraga',
        'brand',
        'varian',
      ],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Produk> {
    const produk = await this.produkRepository.findOne({
      where: { id },
      relations: [
        'subkategori',
        'subkategori.kategoriOlahraga',
        'brand',
        'varian',
      ],
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

    let gambarPayload: any[] = [];
    if (updateProdukDto.gambar) {
      if (Array.isArray(updateProdukDto.gambar)) {
        gambarPayload = updateProdukDto.gambar;
      } else {
        gambarPayload = [updateProdukDto.gambar];
      }
    }

    if (gambarPayload.length > 0) {
      if (gambarPayload.every((g) => typeof g === 'string')) {
        produk.gambar = gambarPayload;
      }

      if (gambarPayload.some((g) => typeof g !== 'string')) {
        produk.gambar = produk.gambar || [];

        gambarPayload.forEach((g) => {
          if (typeof g !== 'string' && g.index !== undefined) {
            produk.gambar[g.index] = g.url;
          }
        });
      }
    }

    const { gambar, ...rest } = updateProdukDto;
    Object.assign(produk, rest);

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

    const remainingVarians = await this.varianRepository.find({
      where: { produk_id: varian.produk_id },
    });

    if (remainingVarians.length === 1) {
      const produk = await this.produkRepository.findOne({
        where: { id: varian.produk_id },
      });
      if (produk) {
        produk.stok = 0;
        await this.produkRepository.save(produk);
      }
    }

    await this.varianRepository.softRemove(varian);
  }

  async findBySubkategori(subkategoriId: string): Promise<Produk[]> {
    return await this.produkRepository.find({
      where: { subkategori_id: subkategoriId },
      relations: [
        'subkategori',
        'subkategori.kategoriOlahraga',
        'brand',
        'varian',
      ],
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
      relations: [
        'subkategori',
        'subkategori.kategoriOlahraga',
        'brand',
        'varian',
      ],
      order: { created_at: 'DESC' },
    });
  }

  async findByBrand(brandId: string): Promise<Produk[]> {
    return await this.produkRepository.find({
      where: { brand_id: brandId },
      relations: [
        'subkategori',
        'subkategori.kategoriOlahraga',
        'brand',
        'varian',
      ],
      order: { created_at: 'DESC' },
    });
  }

  async calculateTotalStock(produkId: string): Promise<number> {
    const produk = await this.findOne(produkId);

    if (produk.stok !== null) {
      return produk.stok;
    } else {
      const varians = await this.findVarianByProduk(produkId);
      return varians.reduce((total, varian) => total + varian.stok, 0);
    }
  }

  async updateStatusIfOutOfStock(produkId: string): Promise<void> {
    const totalStock = await this.calculateTotalStock(produkId);
    if (totalStock === 0) {
      const produk = await this.findOne(produkId);
      produk.status = StatusProduk.STOK_HABIS;
      await this.produkRepository.save(produk);
    }
  }

  async getTotalSoldByProduct(produkId: string): Promise<number> {
    await this.findOne(produkId);

    const result = await this.pesananItemRepository
      .createQueryBuilder('pesanan_item')
      .innerJoin('pesanan_item.pesanan', 'pesanan')
      .select('SUM(pesanan_item.kuantitas)', 'total')
      .where('pesanan_item.id_produk = :produkId', { produkId })
      .andWhere('pesanan.status = :status', { status: StatusPesanan.SELESAI })
      .getRawOne();

    return parseInt(result?.total || '0');
  }

  async exportToExcel(): Promise<Buffer> {
    const produks = await this.produkRepository.find({
      relations: [
        'subkategori',
        'subkategori.kategoriOlahraga',
        'brand',
        'varian',
      ],
      order: { created_at: 'DESC' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data Produk');

    worksheet.columns = [
      { header: 'Nama Produk', key: 'nama', width: 30 },
      { header: 'Kategori', key: 'kategori', width: 20 },
      { header: 'Brand', key: 'brand', width: 20 },
      { header: 'Harga', key: 'harga', width: 15 },
      { header: 'Stok', key: 'stok', width: 10 },
      { header: 'Nilai Stock', key: 'nilai_stock', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Total Terjual', key: 'total_terjual', width: 15 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' },
    };

    for (const produk of produks) {
      const totalSold = await this.getTotalSoldByProduct(produk.id);
      const totalStock = await this.calculateTotalStock(produk.id);
      const nilaiStock = totalStock * Number(produk.harga);

      worksheet.addRow({
        nama: produk.nama,
        kategori: produk.subkategori?.kategoriOlahraga?.nama || '-',
        brand: produk.brand?.nama || '-',
        harga: Number(produk.harga),
        stok: totalStock,
        nilai_stock: nilaiStock,
        status: produk.status,
        total_terjual: totalSold,
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
