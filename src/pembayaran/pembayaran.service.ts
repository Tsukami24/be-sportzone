import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pembayaran, StatusPembayaran, MetodePembayaran } from './entities/pembayaran.entity';
import { PesananService } from 'src/pesanan/pesanan.service';
import { StatusPesanan } from 'src/pesanan/entities/pesanan.entity';
import * as midtransClient from 'midtrans-client';

@Injectable()
export class PembayaranService {
  private snapClient: midtransClient.Snap;

  constructor(
    @InjectRepository(Pembayaran)
    private readonly pembayaranRepo: Repository<Pembayaran>,
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
      throw new HttpException('Gagal membuat transaksi Midtrans', HttpStatus.INTERNAL_SERVER_ERROR);
    }
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
      throw new HttpException('Pembayaran tidak ditemukan', HttpStatus.NOT_FOUND);
    }

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'challenge') {
        pembayaran.status = StatusPembayaran.BELUM_BAYAR;
      } else if (fraudStatus === 'accept') {
        pembayaran.status = StatusPembayaran.SUDAH_BAYAR;
        pembayaran.pesanan.status = StatusPesanan.DIPROSES; // Update pesanan status to processed
      }
    } else if (transactionStatus === 'settlement') {
      pembayaran.status = StatusPembayaran.SUDAH_BAYAR;
      pembayaran.pesanan.status = StatusPesanan.DIPROSES;
    } else if (transactionStatus === 'deny' || transactionStatus === 'cancel' || transactionStatus === 'expire') {
      pembayaran.status = StatusPembayaran.GAGAL;
      pembayaran.pesanan.status = StatusPesanan.PENDING;
    } else if (transactionStatus === 'pending') {
      pembayaran.status = StatusPembayaran.BELUM_BAYAR;
      pembayaran.pesanan.status = StatusPesanan.PENDING;
    }

    await this.pembayaranRepo.save(pembayaran);
    await this.pesananService.update(pembayaran.pesanan.id, { status: pembayaran.pesanan.status });

    return { message: 'Notification processed' };
  }

  async getPaymentStatus(pesananId: string) {
    const pembayaran = await this.pembayaranRepo.findOne({
      where: { pesanan: { id: pesananId } },
    });
    if (!pembayaran) {
      throw new HttpException('Pembayaran tidak ditemukan', HttpStatus.NOT_FOUND);
    }
    return pembayaran;
  }
}
