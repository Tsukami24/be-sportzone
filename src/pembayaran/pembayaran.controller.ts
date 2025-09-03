import { Controller, Post, Body, Param, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { PembayaranService } from './pembayaran.service';

@Controller('pembayaran')
export class PembayaranController {
  constructor(private readonly pembayaranService: PembayaranService) {}

  @Post()
  async createPayment(@Body('pesananId') pesananId: string) {
    return this.pembayaranService.initiatePayment(pesananId);
  }

  @Post('initiate')
  async initiatePayment(@Body('pesananId') pesananId: string) {
    return this.pembayaranService.initiatePayment(pesananId);
  }

  @Post('notification')
  @HttpCode(HttpStatus.OK)
  async handleNotification(@Body() notificationBody: any) {
    return this.pembayaranService.handleNotification(notificationBody);
  }

  @Get(':pesananId')
  async getPaymentStatus(@Param('pesananId') pesananId: string) {
    return this.pembayaranService.getPaymentStatus(pesananId);
  }
}
