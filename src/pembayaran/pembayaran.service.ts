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
  Pembayaran,
  StatusPembayaran,
  MetodePembayaran,
} from './entities/pembayaran.entity';
import { PesananService } from 'src/pesanan/pesanan.service';
import { StatusPesanan } from 'src/pesanan/entities/pesanan.entity';
import { ProdukVarian } from 'src/produk/entities/produk-varian.entity';
import { Produk } from 'src/produk/entities/produk.entity';
import { PesananItem } from 'src/pesanan/entities/pesanan-item.entity';
import * as midtransClient from 'midtrans-client';

@Injectable()
export class PembayaranService {
  private snapClient: midtransClient.Snap;
  private coreApiClient: midtransClient.CoreApi;

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

    this.coreApiClient = new midtransClient.CoreApi({
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

    const parameter = {
      transaction_details: {
        order_id: pesanan.id,
        gross_amount: pesanan.total_harga,
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: pesanan.user.username || 'pelanggan',
        email: pesanan.user.email,
        phone: pesanan.user.phone || 'null',
        billing_address: {
          address: pesanan.alamat_pengiriman || 'Alamat belum diisi',
        },
      },
      callbacks: {
        finish: 'http://localhost:3001/pesanan/history',
      },
    };

    try {
      const transaction = await this.snapClient.createTransaction(parameter);

      let pembayaran = await this.pembayaranRepo.findOne({
        where: { pesanan: { id: pesananId } },
      });

      if (!pembayaran) {
        pembayaran = this.pembayaranRepo.create({
          pesanan,
          metode: null,
          status: StatusPembayaran.BELUM_BAYAR,
        });
        await this.pembayaranRepo.save(pembayaran);
      }

      return {
        token: transaction.token,
        redirect_url: transaction.redirect_url,
      };
    } catch (error) {
      console.error('Midtrans initiate error:', error);
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
    } else {
      if (pembayaran.metode === null) {
        pembayaran.metode = MetodePembayaran.COD;
        await this.pembayaranRepo.save(pembayaran);
      }
    }

    return pembayaran;
  }

  private mapMidtransPaymentType(paymentType: string): MetodePembayaran | null {
    const mapping: Record<string, MetodePembayaran> = {
      dana: MetodePembayaran.DANA,
      qris: MetodePembayaran.QRIS,
    };

    return mapping[paymentType] || null;
  }

  async findAll() {
    return this.pembayaranRepo.find({
      relations: ['pesanan'],
    });
  }

  async handleNotification(notificationBody: any) {
    try {
      console.log('Midtrans Notification Received:', notificationBody);

      const orderId = notificationBody.order_id;
      const transactionStatus = notificationBody.transaction_status;
      const fraudStatus = notificationBody.fraud_status;
      const paymentType = notificationBody.payment_type;

      const pembayaran = await this.pembayaranRepo.findOne({
        where: { pesanan: { id: orderId } },
        relations: ['pesanan'],
      });

      if (!pembayaran) {
        console.warn(`Pembayaran tidak ditemukan untuk orderId: ${orderId}`);
        return { message: 'Notification processed - payment not found' };
      }

      if (paymentType && !pembayaran.metode) {
        const mappedMethod = this.mapMidtransPaymentType(paymentType);
        if (mappedMethod) {
          pembayaran.metode = mappedMethod;
          console.log(`Metode pembayaran diupdate menjadi: ${mappedMethod}`);
        }
      }

      let shouldReduceStock = false;

      if (transactionStatus === 'capture') {
        if (fraudStatus === 'challenge') {
          pembayaran.status = StatusPembayaran.BELUM_BAYAR;
          pembayaran.pesanan.status = StatusPesanan.PENDING;
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
        pembayaran.pesanan.status = StatusPesanan.DIBATALKAN;
      } else if (transactionStatus === 'pending') {
        pembayaran.status = StatusPembayaran.BELUM_BAYAR;
        pembayaran.pesanan.status = StatusPesanan.PENDING;
      }

      if (shouldReduceStock) {
        await this.reduceStockForOrder(orderId);
      }

      await this.pembayaranRepo.save(pembayaran);

      if (pembayaran.pesanan) {
        await this.pesananService.updateStatusOnly(
          pembayaran.pesanan.id,
          pembayaran.pesanan.status,
        );
      }

      console.log('Notification processed successfully');
      return { message: 'Notification processed' };
    } catch (error) {
      console.error('Error processing Midtrans notification:', error);
      return { message: 'Notification processed with error' };
    }
  }

  private async reduceStockForOrder(orderId: string) {
    const orderItems = await this.pesananItemRepo.find({
      where: { pesanan_id: orderId },
      relations: ['produk', 'produk_varian'],
    });

    for (const item of orderItems) {
      if (item.produk_varian_id) {
        const varian = await this.varianRepo.findOne({
          where: { id: item.produk_varian_id },
        });

        if (!varian) {
          throw new HttpException(
            `Varian produk tidak ditemukan untuk ${item.produk.nama}`,
            HttpStatus.BAD_REQUEST,
          );
        }

        if (varian.stok < item.kuantitas) {
          throw new HttpException(
            `Stok tidak cukup untuk produk ${item.produk.nama}`,
            HttpStatus.BAD_REQUEST,
          );
        }
        varian.stok -= item.kuantitas;
        await this.varianRepo.save(varian);
      } else {
        // Jika tidak ada varian, kurangi stok dari produk induk
        const produk = await this.produkRepo.findOne({
          where: { id: item.id_produk },
        });

        if (!produk) {
          throw new HttpException(
            `Produk tidak ditemukan`,
            HttpStatus.BAD_REQUEST,
          );
        }

        if (produk.stok === null) {
          throw new HttpException(
            `Stok tidak tersedia untuk produk ${produk.nama} (produk memiliki varian)`,
            HttpStatus.BAD_REQUEST,
          );
        }

        if (produk.stok < item.kuantitas) {
          throw new HttpException(
            `Stok tidak cukup untuk produk ${produk.nama}`,
            HttpStatus.BAD_REQUEST,
          );
        }
        produk.stok -= item.kuantitas;
        await this.produkRepo.save(produk);
      }
    }
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

  async updatePembayaranStatus(
    pembayaranId: string,
    status: StatusPembayaran,
  ): Promise<Pembayaran> {
    const pembayaran = await this.pembayaranRepo.findOne({
      where: { id: pembayaranId },
      relations: ['pesanan'],
    });
    if (!pembayaran) {
      throw new HttpException(
        'Pembayaran tidak ditemukan',
        HttpStatus.NOT_FOUND,
      );
    }
    pembayaran.status = status;

    if (pembayaran.metode === MetodePembayaran.COD) {
      if (status === StatusPembayaran.SUDAH_BAYAR) {
        pembayaran.pesanan.status = StatusPesanan.DIPROSES;
        await this.reduceStockForOrder(pembayaran.pesanan.id);
      } else if (status === StatusPembayaran.GAGAL) {
        pembayaran.pesanan.status = StatusPesanan.DIBATALKAN;
      }

      if (pembayaran.pesanan) {
        await this.pesananService.updateStatusOnly(
          pembayaran.pesanan.id,
          pembayaran.pesanan.status,
        );
      }
    }

    return this.pembayaranRepo.save(pembayaran);
  }

  async refundPayment(pesananId: string, amount?: number, reason?: string) {
    const pembayaran = await this.pembayaranRepo.findOne({
      where: { pesanan: { id: pesananId } },
      relations: ['pesanan'],
    });

    if (!pembayaran) {
      throw new HttpException(
        'Pembayaran tidak ditemukan',
        HttpStatus.NOT_FOUND,
      );
    }

    if (pembayaran.metode === MetodePembayaran.COD) {
      throw new HttpException(
        'Refund hanya berlaku untuk pembayaran Midtrans',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (process.env.MIDTRANS_ENV !== 'production') {
      console.log('[MOCK] Refund sukses (sandbox)');
      pembayaran.status = StatusPembayaran.DIKEMBALIKAN;
      await this.pembayaranRepo.save(pembayaran);

      return {
        status_code: '200',
        status_message: 'Refund berhasil (MOCK)',
        refund_key: `${pembayaran.pesanan.id}-refund-${Date.now()}`,
        amount: amount || pembayaran.pesanan.total_harga,
        reason: reason || 'Pesanan dibatalkan oleh pelanggan',
      };
    }

    try {
      const response = await this.coreApiClient.transaction.refund(
        pembayaran.pesanan.id,
        {
          refund_key: `${pembayaran.pesanan.id}-refund-${Date.now()}`,
          amount: amount || pembayaran.pesanan.total_harga,
          reason: reason || 'Pesanan dibatalkan oleh pelanggan',
        },
      );

      pembayaran.status = StatusPembayaran.DIKEMBALIKAN;
      await this.pembayaranRepo.save(pembayaran);

      return response;
    } catch (error) {
      console.error('Refund Error:', error.ApiResponse || error);
      throw new HttpException(
        'Gagal melakukan refund ke Midtrans',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
