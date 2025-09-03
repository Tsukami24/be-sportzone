import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PembayaranService } from './pembayaran.service';
import { PembayaranController } from './pembayaran.controller';
import { Pembayaran } from './entities/pembayaran.entity';
import { PesananModule } from 'src/pesanan/pesanan.module';

@Module({
  imports: [TypeOrmModule.forFeature([Pembayaran]), PesananModule],
  providers: [PembayaranService],
  controllers: [PembayaranController],
  exports: [PembayaranService],
})
export class PembayaranModule {}
