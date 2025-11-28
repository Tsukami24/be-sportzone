import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PembayaranService } from './pembayaran.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { UpdateStatusPembayaranDto } from './dto/update-status-pembayaran.dto';

@Controller('pembayaran')
export class PembayaranController {
  constructor(private readonly pembayaranService: PembayaranService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  async createPayment(@Body('pesananId') pesananId: string) {
    return this.pembayaranService.initiatePayment(pesananId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('initiate')
  async initiatePayment(@Body('pesananId') pesananId: string) {
    return this.pembayaranService.initiatePayment(pesananId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('cod')
  async createCodPayment(@Body('pesananId') pesananId: string) {
    return this.pembayaranService.createCodPayment(pesananId);
  }

  @Post('notification')
  @HttpCode(HttpStatus.OK)
  async handleNotification(@Body() notificationBody: any) {
    return this.pembayaranService.handleNotification(notificationBody);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':pesananId')
  async getPaymentStatus(@Param('pesananId') pesananId: string) {
    return this.pembayaranService.getPaymentStatus(pesananId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusPembayaranDto,
  ) {
    return this.pembayaranService.updatePembayaranStatus(
      id,
      updateStatusDto.status,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'petugas')
  @Get()
  async getAllPayments() {
    return this.pembayaranService.findAll();
  }
}
