import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PembayaranService } from './pembayaran.service';
import { PembayaranController } from './pembayaran.controller';
import { Pembayaran } from './entities/pembayaran.entity';
import { PesananModule } from 'src/pesanan/pesanan.module';
import { ProdukVarian } from 'src/produk/entities/produk-varian.entity';
import { Produk } from 'src/produk/entities/produk.entity';
import { PesananItem } from 'src/pesanan/entities/pesanan-item.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ProdukModule } from 'src/produk/produk.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pembayaran, ProdukVarian, Produk, PesananItem]),
    forwardRef(() => PesananModule),
    forwardRef(() => AuthModule),
    forwardRef(() => ProdukModule),
  ],
  providers: [PembayaranService],
  controllers: [PembayaranController],
  exports: [PembayaranService],
})
export class PembayaranModule {}
