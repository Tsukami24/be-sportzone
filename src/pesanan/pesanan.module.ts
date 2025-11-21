import { Module, forwardRef } from '@nestjs/common';
import { PesananService } from './pesanan.service';
import { PesananController } from './pesanan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pesanan } from './entities/pesanan.entity';
import { PesananItem } from './entities/pesanan-item.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { ProdukModule } from 'src/produk/produk.module';
import { PembayaranModule } from 'src/pembayaran/pembayaran.module';
import { Produk } from 'src/produk/entities/produk.entity';
import { ProdukVarian } from 'src/produk/entities/produk-varian.entity';
import { Pembayaran } from 'src/pembayaran/entities/pembayaran.entity';
import { ShippingModule } from 'src/shipping/shipping.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pesanan,
      PesananItem,
      Produk,
      ProdukVarian,
      Pembayaran,
    ]),
    AuthModule,
    UsersModule,
    ProdukModule,
    forwardRef(() => PembayaranModule),
    ShippingModule,
  ],
  controllers: [PesananController],
  providers: [PesananService],
  exports: [PesananService],
})
export class PesananModule {}
