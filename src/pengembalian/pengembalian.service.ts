import {
  Injectable,
  HttpException,
  HttpStatus,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Pengembalian,
  StatusPengembalian,
  AlasanPengembalian,
} from './entities/pengembalian.entity';
import { ProdukRusak } from './entities/produk-rusak.entity';
import { CreatePengembalianDto } from './dto/create-pengembalian.dto';
import { UpdatePengembalianDto } from './dto/update-pengembalian.dto';
import { PesananService } from '../pesanan/pesanan.service';
import { PembayaranService } from '../pembayaran/pembayaran.service';
import { StatusPesanan } from '../pesanan/entities/pesanan.entity';
import { StatusPembayaran } from '../pembayaran/entities/pembayaran.entity';
import { ProdukVarian } from '../produk/entities/produk-varian.entity';
import { Produk } from '../produk/entities/produk.entity';
import { ProdukService } from '../produk/produk.service';

@Injectable()
export class PengembalianService {
  constructor(
    @InjectRepository(Pengembalian)
    private readonly pengembalianRepo: Repository<Pengembalian>,
    @InjectRepository(ProdukRusak)
    private readonly produkRusakRepo: Repository<ProdukRusak>,
    @InjectRepository(ProdukVarian)
    private readonly varianRepo: Repository<ProdukVarian>,
    @InjectRepository(Produk)
    private readonly produkRepo: Repository<Produk>,

    @Inject(forwardRef(() => PesananService))
    private readonly pesananService: PesananService,
    @Inject(forwardRef(() => PembayaranService))
    private readonly pembayaranService: PembayaranService,
    private readonly produkService: ProdukService,
  ) {}

  async create(
    createPengembalianDto: CreatePengembalianDto,
    userId: string,
  ): Promise<Pengembalian> {
    const pesanan = await this.pesananService.findOne(
      createPengembalianDto.pesanan_id,
    );

    if (!pesanan) {
      throw new HttpException('Pesanan tidak ditemukan', HttpStatus.NOT_FOUND);
    }

    if (pesanan.user_id !== userId) {
      throw new HttpException(
        'Anda tidak berhak mengajukan pengembalian untuk pesanan ini',
        HttpStatus.FORBIDDEN,
      );
    }

    if (
      pesanan.status !== StatusPesanan.DIKIRIM &&
      pesanan.status !== StatusPesanan.SELESAI
    ) {
      throw new HttpException(
        'Pengembalian hanya dapat diajukan untuk pesanan dengan status dikirim atau selesai',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingPengembalian = await this.pengembalianRepo.findOne({
      where: {
        pesanan_id: createPengembalianDto.pesanan_id,
        status: StatusPengembalian.PENDING,
      },
    });

    if (existingPengembalian) {
      throw new HttpException(
        'Sudah ada pengajuan pengembalian yang sedang diproses untuk pesanan ini',
        HttpStatus.BAD_REQUEST,
      );
    }

    const pengembalian = this.pengembalianRepo.create({
      ...createPengembalianDto,
      user_id: userId,
      status: StatusPengembalian.PENDING,
    });

    return this.pengembalianRepo.save(pengembalian);
  }

  async findAll(): Promise<Pengembalian[]> {
    return this.pengembalianRepo.find({
      relations: [
        'pesanan',
        'user',
        'admin',
        'pesanan.pesanan_items',
        'pesanan.pesanan_items.produk',
        'pesanan.pesanan_items.produk_varian',
      ],
      order: { created_at: 'DESC' },
    });
  }

  async findByUser(userId: string): Promise<Pengembalian[]> {
    return this.pengembalianRepo.find({
      where: { user_id: userId },
      relations: [
        'pesanan',
        'pesanan.pesanan_items',
        'pesanan.pesanan_items.produk',
        'pesanan.pesanan_items.produk_varian',
      ],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Pengembalian> {
    const pengembalian = await this.pengembalianRepo.findOne({
      where: { id },
      relations: [
        'pesanan',
        'user',
        'admin',
        'pesanan.pesanan_items',
        'pesanan.pesanan_items.produk',
        'pesanan.pesanan_items.produk_varian',
      ],
    });

    if (!pengembalian) {
      throw new HttpException(
        'Pengembalian tidak ditemukan',
        HttpStatus.NOT_FOUND,
      );
    }

    return pengembalian;
  }

  async approve(
    id: string,
    adminId: string,
    catatanAdmin?: string,
  ): Promise<Pengembalian> {
    const pengembalian = await this.findOne(id);

    if (pengembalian.status !== StatusPengembalian.PENDING) {
      throw new HttpException(
        'Pengembalian sudah diproses',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.pengembalianRepo.manager.transaction(
      async (transactionalEntityManager) => {
        pengembalian.status = StatusPengembalian.APPROVED;
        pengembalian.catatan_admin = catatanAdmin || null;
        pengembalian.processed_by = adminId;
        pengembalian.processed_at = new Date();

        await transactionalEntityManager.save(Pengembalian, pengembalian);

        const pesanan = await this.pesananService.findOne(
          pengembalian.pesanan_id,
        );
        pesanan.status = StatusPesanan.DIKEMBALIKAN;
        await transactionalEntityManager.save(
          pesanan.constructor.name,
          pesanan,
        );

        const pembayaran = await this.pembayaranService.getPaymentStatus(
          pengembalian.pesanan_id,
        );
        pembayaran.status = StatusPembayaran.DIKEMBALIKAN;
        await transactionalEntityManager.save(
          pembayaran.constructor.name,
          pembayaran,
        );

        if (pengembalian.alasan === AlasanPengembalian.RUSAK) {
          for (const item of pesanan.pesanan_items) {
            const produkRusak = transactionalEntityManager.create(ProdukRusak, {
              pengembalian_id: pengembalian.id,
              produk_id: item.id_produk,
              produk_varian_id: item.produk_varian_id,
              jumlah: item.kuantitas,
              deskripsi_kerusakan: pengembalian.keterangan,
            });
            await transactionalEntityManager.save(ProdukRusak, produkRusak);
          }
        } else if (pengembalian.alasan === AlasanPengembalian.SALAH_VARIAN) {
          for (const item of pesanan.pesanan_items) {
            if (item.produk_varian_id) {
              const varian = await transactionalEntityManager.findOne(
                ProdukVarian,
                {
                  where: { id: item.produk_varian_id },
                },
              );
              if (varian) {
                varian.stok += item.kuantitas;
                await transactionalEntityManager.save(ProdukVarian, varian);
              }
            } else {
              const produk = await transactionalEntityManager.findOne(Produk, {
                where: { id: item.id_produk },
              });
              if (produk && produk.stok !== null) {
                produk.stok += item.kuantitas;
                await transactionalEntityManager.save(Produk, produk);
              }
            }
          }

          const produkIds = [
            ...new Set(pesanan.pesanan_items.map((item) => item.id_produk)),
          ];
          for (const produkId of produkIds) {
            await this.produkService.updateStatusIfOutOfStock(produkId);
          }
        }
      },
    );

    return this.findOne(id);
  }

  async reject(
    id: string,
    adminId: string,
    catatanAdmin?: string,
  ): Promise<Pengembalian> {
    const pengembalian = await this.findOne(id);

    if (pengembalian.status !== StatusPengembalian.PENDING) {
      throw new HttpException(
        'Pengembalian sudah diproses',
        HttpStatus.BAD_REQUEST,
      );
    }

    pengembalian.status = StatusPengembalian.REJECTED;
    pengembalian.catatan_admin = catatanAdmin || null;
    pengembalian.processed_by = adminId;
    pengembalian.processed_at = new Date();

    return this.pengembalianRepo.save(pengembalian);
  }

  async update(
    id: string,
    updatePengembalianDto: UpdatePengembalianDto,
  ): Promise<Pengembalian> {
    const pengembalian = await this.findOne(id);

    Object.assign(pengembalian, updatePengembalianDto);

    return this.pengembalianRepo.save(pengembalian);
  }

  async remove(id: string): Promise<void> {
    const result = await this.pengembalianRepo.delete(id);
    if (result.affected === 0) {
      throw new HttpException(
        'Pengembalian tidak ditemukan',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async findAllProdukRusak(): Promise<ProdukRusak[]> {
    return this.produkRusakRepo.find({
      relations: ['pengembalian', 'produk', 'produk_varian'],
      order: { created_at: 'DESC' },
    });
  }

  async findProdukRusakByPengembalian(
    pengembalianId: string,
  ): Promise<ProdukRusak[]> {
    return this.produkRusakRepo.find({
      where: { pengembalian_id: pengembalianId },
      relations: ['produk', 'produk_varian'],
    });
  }
}
