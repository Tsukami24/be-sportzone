import { Injectable, HttpException, HttpStatus, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pembayaran, StatusPembayaran, MetodePembayaran } from './entities/pembayaran.entity';
import { PesananService } from 'src/pesanan/pesanan.service';
import { StatusPesanan } from 'src/pesanan/entities/pesanan.entity';
import { ProdukVarian } from 'src/produk/entities/produk-varian.entity';
import { Produk } from 'src/produk/entities/produk.entity';
import { PesananItem } from 'src/pesanan/entities/pesanan-item.entity';
import * as midtransClient from 'midtrans-client';

@Injectable()
export class PembayaranService {
  private snapClient: midtransClient.Snap;

  constructor(
    @InjectRepository(Pembayaran)
    private readonly pembayaranRepo: Repository<Pembayaran>,
    @InjectRepository(ProdukVarian)
    private readonly varianRepo: Repository<ProdukVarian>,
    @InjectRepository(Produk)
    private readonly produkRepo: Repository<Produk>,
    @InjectRepository(PesananItem)
    private readonly pesananItemRepo: Repository<PesananItem>,

    @Inject(forwardRef(() => PesananService))
    private readonly pesananService: PesananService,
  ) {
    this.snapClient = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY || '',
      clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
    });
  }

  async initiatePayment(pesananId: string) {
    const pesanan = await this.pesananService.findOne(pesananId);
    if (!pesanan) {
      throw new HttpException('Pesanan tidak ditemukan', HttpStatus.NOT_FOUND);
    }

    // Create Midtrans transaction parameter
    const parameter = {
      transaction_details: {
        order_id: pesanan.id,
        gross_amount: pesanan.total_harga,
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: pesanan.user.username,
        email: pesanan.user.email,
      },
    };

    try {
      const transaction = await this.snapClient.createTransaction(parameter);
      // Save pembayaran record
      let pembayaran = await this.pembayaranRepo.findOne({
        where: { pesanan: { id: pesananId } },
      });
      if (!pembayaran) {
        pembayaran = this.pembayaranRepo.create({
          pesanan,
          metode: MetodePembayaran.MIDTRANS,
          status: StatusPembayaran.BELUM_BAYAR,
        });
      }
      await this.pembayaranRepo.save(pembayaran);

      return {
        token: transaction.token, // Ubah dari snapToken
        redirect_url: transaction.redirect_url, // Ubah dari redirectUrl
      };
    } catch (error) {
      throw new HttpException(
        'Gagal membuat transaksi Midtrans',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createCodPayment(pesananId: string) {
    const pesanan = await this.pesananService.findOne(pesananId);
    if (!pesanan) {
      throw new HttpException('Pesanan tidak ditemukan', HttpStatus.NOT_FOUND);
    }

    let pembayaran = await this.pembayaranRepo.findOne({
      where: { pesanan: { id: pesananId } },
    });

    if (!pembayaran) {
      pembayaran = this.pembayaranRepo.create({
        pesanan,
        metode: MetodePembayaran.COD,
        status: StatusPembayaran.BELUM_BAYAR,
      });
      await this.pembayaranRepo.save(pembayaran);
    }

    return pembayaran;
  }

  async handleNotification(notificationBody: any) {
    const orderId = notificationBody.order_id;
    const transactionStatus = notificationBody.transaction_status;
    const fraudStatus = notificationBody.fraud_status;

    const pembayaran = await this.pembayaranRepo.findOne({
      where: { pesanan: { id: orderId } },
      relations: ['pesanan'],
    });

    if (!pembayaran) {
      throw new HttpException(
        'Pembayaran tidak ditemukan',
        HttpStatus.NOT_FOUND,
      );
    }

    let shouldReduceStock = false;

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'challenge') {
        pembayaran.status = StatusPembayaran.BELUM_BAYAR;
      } else if (fraudStatus === 'accept') {
        pembayaran.status = StatusPembayaran.SUDAH_BAYAR;
        pembayaran.pesanan.status = StatusPesanan.DIPROSES;
        shouldReduceStock = true;
      }
    } else if (transactionStatus === 'settlement') {
      pembayaran.status = StatusPembayaran.SUDAH_BAYAR;
      pembayaran.pesanan.status = StatusPesanan.DIPROSES;
      shouldReduceStock = true;
    } else if (
      transactionStatus === 'deny' ||
      transactionStatus === 'cancel' ||
      transactionStatus === 'expire'
    ) {
      pembayaran.status = StatusPembayaran.GAGAL;
      pembayaran.pesanan.status = StatusPesanan.PENDING;
    } else if (transactionStatus === 'pending') {
      pembayaran.status = StatusPembayaran.BELUM_BAYAR;
      pembayaran.pesanan.status = StatusPesanan.PENDING;
    }

    // Reduce stock if payment is successful and status changed to DIPROSES
    if (shouldReduceStock) {
      await this.reduceStockForOrder(orderId);
    }

    await this.pembayaranRepo.save(pembayaran);
    await this.pesananService.update(pembayaran.pesanan.id, {
      status: pembayaran.pesanan.status,
    });

    return { message: 'Notification processed' };
  }

  private async reduceStockForOrder(orderId: string) {
    console.log(`Reducing stock for order ${orderId}`);

    // Get all order items for this order
    const orderItems = await this.pesananItemRepo.find({
      where: { pesanan_id: orderId },
      relations: ['produk', 'produk_varian'],
    });

    console.log(`Found ${orderItems.length} order items for order ${orderId}`);

    for (const item of orderItems) {
      console.log(`Processing item: ${item.id}, quantity: ${item.kuantitas}, variant_id: ${item.produk_varian_id}`);

      if (item.produk_varian_id) {
        // Reduce stock from product variant
        console.log(`Reducing stock from variant ${item.produk_varian_id}`);
        const varian = await this.varianRepo.findOne({
          where: { id: item.produk_varian_id }
        });

        if (varian) {
          console.log(`Variant found: ${varian.id}, current stock: ${varian.stok}`);
          if (varian.stok < item.kuantitas) {
            throw new HttpException(
              `Stok tidak cukup untuk produk ${item.produk.nama}`,
              HttpStatus.BAD_REQUEST
            );
          }
          varian.stok = varian.stok - item.kuantitas;
          console.log(`New stock for variant ${varian.id}: ${varian.stok}`);
          await this.varianRepo.save(varian);
          console.log(`Stock reduced successfully for variant ${varian.id}`);
        } else {
          console.error(`Variant not found: ${item.produk_varian_id}`);
        }
      } else {
        // If no variant, we can't reduce stock since stock is managed at variant level
        console.log(`No variant for item ${item.id}, skipping stock reduction`);
      }
    }

    console.log(`Stock reduction completed for order ${orderId}`);
  }

  async getPaymentStatus(pesananId: string) {
    const pembayaran = await this.pembayaranRepo.findOne({
      where: { pesanan: { id: pesananId } },
    });
    if (!pembayaran) {
      throw new HttpException(
        'Pembayaran tidak ditemukan',
        HttpStatus.NOT_FOUND,
      );
    }
    return pembayaran;
  }
}
