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
@UseGuards(JwtAuthGuard, RolesGuard)
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

  @Post('cod')
  async createCodPayment(@Body('pesananId') pesananId: string) {
    return this.pembayaranService.createCodPayment(pesananId);
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
}
