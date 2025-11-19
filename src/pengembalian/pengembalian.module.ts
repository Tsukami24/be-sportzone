import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PengembalianController } from './pengembalian.controller';
import { PengembalianService } from './pengembalian.service';
import { Pengembalian } from './entities/pengembalian.entity';
import { ProdukRusak } from './entities/produk-rusak.entity';
import { PesananModule } from '../pesanan/pesanan.module';
import { PembayaranModule } from '../pembayaran/pembayaran.module';
import { ProdukModule } from '../produk/produk.module';
import { AuthModule } from '../auth/auth.module';
import { ProdukVarian } from '../produk/entities/produk-varian.entity';
import { Produk } from '../produk/entities/produk.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pengembalian, ProdukRusak, ProdukVarian, Produk]),
    forwardRef(() => PesananModule),
    forwardRef(() => PembayaranModule),
    ProdukModule,
    AuthModule,
  ],
  controllers: [PengembalianController],
  providers: [PengembalianService],
  exports: [PengembalianService],
})
export class PengembalianModule {}
