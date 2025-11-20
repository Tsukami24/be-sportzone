import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProdukService } from './produk.service';
import { ProdukController } from './produk.controller';
import { Produk } from './entities/produk.entity';
import { ProdukVarian } from './entities/produk-varian.entity';
import { SubkategoriPeralatan } from '../subkategori-peralatan/entities/subkategori-peralatan.entity';
import { Brand } from '../brand/entities/brand.entity';
import { AuthModule } from '../auth/auth.module';
import { PesananItem } from '../pesanan/entities/pesanan-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Produk,
      ProdukVarian,
      SubkategoriPeralatan,
      Brand,
      PesananItem,
    ]),
    AuthModule,
  ],
  controllers: [ProdukController],
  providers: [ProdukService],
  exports: [ProdukService],
})
export class ProdukModule {}
