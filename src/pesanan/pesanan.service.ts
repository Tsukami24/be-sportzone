import { Inject, forwardRef, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pesanan } from './entities/pesanan.entity';
import { PesananItem } from './entities/pesanan-item.entity';
import { CreatePesananDto } from './dto/create-pesanan.dto';
import { UpdatePesananDto } from './dto/update-pesanan.dto';
import { CreatePesananItemDto } from './dto/create-pesanan-item.dto';
import { UpdatePesananItemDto } from './dto/update-pesanan-item.dto';
import { StatusPesanan } from './entities/pesanan.entity';
import { PembayaranService } from '../pembayaran/pembayaran.service';
import { MetodePembayaran } from '../pembayaran/entities/pembayaran.entity';
import { ProdukVarian } from '../produk/entities/produk-varian.entity';
import { Produk } from '../produk/entities/produk.entity';

@Injectable()
export class PesananService {
  constructor(
    @InjectRepository(Pesanan)
    private readonly pesananRepo: Repository<Pesanan>,
    @InjectRepository(PesananItem)
    private readonly pesananItemRepo: Repository<PesananItem>,
    @InjectRepository(ProdukVarian)
    private readonly varianRepo: Repository<ProdukVarian>,
    @InjectRepository(Produk)
    private readonly produkRepo: Repository<Produk>,

    @Inject(forwardRef(() => PembayaranService))
    private readonly pembayaranService: PembayaranService,
  ) {}

  async create(createPesananDto: CreatePesananDto): Promise<Pesanan> {
    // Use transaction for data consistency
    return await this.pesananRepo.manager.transaction(
      async (transactionalEntityManager) => {
        // Create main order
        const pesanan = transactionalEntityManager.create(Pesanan, {
          tanggal_pesanan: createPesananDto.tanggal_pesanan,
          total_harga: createPesananDto.total_harga,
          alamat_pengiriman: createPesananDto.alamat_pengiriman,
          user_id: createPesananDto.user_id,
        });

        // Save main order first to get ID
        const savedPesanan = await transactionalEntityManager.save(
          Pesanan,
          pesanan,
        );

        // Create and save order items
        if (createPesananDto.items && createPesananDto.items.length > 0) {
          const pesananItems: PesananItem[] = [];

          for (const itemDto of createPesananDto.items) {
            const pesananItem = transactionalEntityManager.create(PesananItem, {
              pesanan_id: savedPesanan.id,
              id_produk: itemDto.id_produk,
              produk_varian_id: itemDto.produk_varian_id,
              kuantitas: itemDto.kuantitas,
              harga_satuan: itemDto.harga_satuan,
            });

            const savedItem = await transactionalEntityManager.save(
              PesananItem,
              pesananItem,
            );
            pesananItems.push(savedItem);
          }

          // Associate items with order
          savedPesanan.pesanan_items = pesananItems;
        }

        return savedPesanan;
      },
    );
  }

  async findAll(): Promise<Pesanan[]> {
    return this.pesananRepo.find({ relations: ['user', 'pesanan_items'] });
  }

  async findOne(id: string): Promise<Pesanan> {
    const pesanan = await this.pesananRepo.findOne({
      where: { id },
      relations: [
        'user',
        'pesanan_items',
        'pesanan_items.produk',
        'pesanan_items.produk_varian',
      ],
    });
    if (!pesanan) {
      throw new Error('Pesanan tidak ditemukan');
    }
    return pesanan;
  }

  async findByUser(userId: string): Promise<Pesanan[]> {
    return this.pesananRepo.find({
      where: { user: { id: userId } },
      relations: [
        'user',
        'pesanan_items',
        'pesanan_items.produk',
        'pesanan_items.produk_varian',
      ],
      order: { created_at: 'DESC' },
    });
  }

  async update(
    id: string,
    updatePesananDto: UpdatePesananDto,
  ): Promise<Pesanan> {
    await this.pesananRepo.update(id, updatePesananDto);
    const updatedPesanan = await this.pesananRepo.findOne({ where: { id } });
    if (!updatedPesanan) {
      throw new Error('Pesanan tidak ditemukan');
    }
    return updatedPesanan;
  }

  async updateStatus(
    id: string,
    newStatus: StatusPesanan,
    userRole: string,
    userId?: string,
  ): Promise<Pesanan> {
    const pesanan = await this.findOne(id);

    // Get payment information
    const pembayaran = await this.pembayaranService.getPaymentStatus(id);

    // Validate status transitions based on payment method and user role
    this.validateStatusTransition(
      pesanan.status,
      newStatus,
      pembayaran.metode,
      userRole,
      userId === pesanan.user_id,
    );

    // Di PesananService.updateStatus()
    if (newStatus === StatusPesanan.DIPROSES) {
      console.log(`Reducing stock for order ${id}`);
      for (const item of pesanan.pesanan_items) {
        console.log(`Processing item: ${item.id}, quantity: ${item.kuantitas}`);
        // ... existing logic
        if (item.produk_varian_id) {
          const varian = await this.varianRepo.findOne({
            where: { id: item.produk_varian_id },
          });
          if (varian) {
            console.log(
              `Variant found: ${varian.id}, current stock: ${varian.stok}`,
            );
            if (varian.stok < item.kuantitas) {
              throw new Error(
                `Stok tidak cukup untuk produk ${item.produk.nama}`,
              );
            }
            varian.stok = varian.stok - item.kuantitas;
            console.log(`New stock for variant ${varian.id}: ${varian.stok}`);
            await this.varianRepo.save(varian);
            console.log(`Stock reduced successfully for variant ${varian.id}`);
          }
        }
      }
      console.log(`Stock reduction completed for order ${id}`);
    }

    // Update status
    pesanan.status = newStatus;
    return this.pesananRepo.save(pesanan);
  }

  private validateStatusTransition(
    currentStatus: StatusPesanan,
    newStatus: StatusPesanan,
    paymentMethod: MetodePembayaran,
    userRole: string,
    isOwner: boolean,
  ): void {
    // Cancellation can be done by admin or customer (if they own the order)
    if (newStatus === StatusPesanan.DIBATALKAN) {
      if (userRole === 'admin' || isOwner) {
        return; // Valid
      }
      throw new Error(
        'Hanya admin atau pemilik pesanan yang dapat membatalkan pesanan',
      );
    }

    // From PENDING to DIPROSES
    if (
      currentStatus === StatusPesanan.PENDING &&
      newStatus === StatusPesanan.DIPROSES
    ) {
      if (paymentMethod === MetodePembayaran.COD && userRole === 'admin') {
        return; // Valid for COD - admin only
      }
      if (paymentMethod === MetodePembayaran.MIDTRANS) {
        throw new Error(
          'Status DIPROSES untuk Midtrans hanya dapat diubah otomatis setelah pembayaran',
        );
      }
      throw new Error('Transisi status tidak valid');
    }

    // From DIPROSES to DIKIRIM or SELESAI - only admin
    if (
      currentStatus === StatusPesanan.DIPROSES &&
      (newStatus === StatusPesanan.DIKIRIM ||
        newStatus === StatusPesanan.SELESAI)
    ) {
      if (userRole === 'admin') {
        return; // Valid
      }
      throw new Error(
        'Hanya admin yang dapat mengubah status ke dikirim atau selesai',
      );
    }

    // Invalid transition
    throw new Error('Transisi status tidak valid');
  }

  async cancelOrder(
    id: string,
    userRole: string,
    userId?: string,
  ): Promise<Pesanan> {
    return this.updateStatus(id, StatusPesanan.DIBATALKAN, userRole, userId);
  }

  async remove(id: string): Promise<void> {
    const result = await this.pesananRepo.delete(id);
    if (result.affected === 0) {
      throw new Error('Pesanan tidak ditemukan');
    }
  }

  async createItem(
    createPesananItemDto: CreatePesananItemDto,
  ): Promise<PesananItem> {
    const pesananItem = this.pesananItemRepo.create(createPesananItemDto);
    return this.pesananItemRepo.save(pesananItem);
  }

  async findAllItems(): Promise<PesananItem[]> {
    return this.pesananItemRepo.find({
      relations: ['pesanan', 'produk', 'produk_varian'],
    });
  }

  async findOneItem(id: string): Promise<PesananItem> {
    const pesananItem = await this.pesananItemRepo.findOne({
      where: { id },
      relations: ['pesanan', 'produk', 'produk_varian'],
    });
    if (!pesananItem) {
      throw new Error('Item pesanan tidak ditemukan');
    }
    return pesananItem;
  }

  async updateItem(
    id: string,
    updatePesananItemDto: UpdatePesananItemDto,
  ): Promise<PesananItem> {
    await this.pesananItemRepo.update(id, updatePesananItemDto);
    const updatedPesananItem = await this.pesananItemRepo.findOne({
      where: { id },
    });
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
