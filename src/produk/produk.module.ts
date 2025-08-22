import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProdukService } from './produk.service';
import { ProdukController } from './produk.controller';
import { Produk } from './entities/produk.entity';
import { KategoriOlahraga } from '../kategori-olahraga/entities/kategori-olahraga.entity/kategori-olahraga.entity';
import { SubkategoriPeralatan } from '../subkategori-peralatan/entities/subkategori-peralatan.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Produk, KategoriOlahraga, SubkategoriPeralatan]),
    AuthModule
  ],
  controllers: [ProdukController],
  providers: [ProdukService],
  exports: [ProdukService]
})
export class ProdukModule {}
