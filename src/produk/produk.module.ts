import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProdukService } from './produk.service';
import { ProdukController } from './produk.controller';
import { Produk } from './entities/produk.entity';
import { ProdukVarian } from './entities/produk-varian.entity';
import { SubkategoriPeralatan } from '../subkategori-peralatan/entities/subkategori-peralatan.entity';
import { Brand } from '../brand/entities/brand.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Produk, ProdukVarian, SubkategoriPeralatan, Brand]),
    AuthModule
  ],
  controllers: [ProdukController],
  providers: [ProdukService],
  exports: [ProdukService]
})
export class ProdukModule {}
