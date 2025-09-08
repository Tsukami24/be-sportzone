import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PembayaranService } from './pembayaran.service';
import { PembayaranController } from './pembayaran.controller';
import { Pembayaran } from './entities/pembayaran.entity';
import { PesananModule } from 'src/pesanan/pesanan.module';
import { ProdukVarian } from 'src/produk/entities/produk-varian.entity';
import { Produk } from 'src/produk/entities/produk.entity';
import { PesananItem } from 'src/pesanan/entities/pesanan-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pembayaran,
      ProdukVarian,
      Produk,
      PesananItem, 
    ]),
    forwardRef(() => PesananModule),
  ],
  providers: [PembayaranService],
  controllers: [PembayaranController],
  exports: [PembayaranService],
})
export class PembayaranModule {}
