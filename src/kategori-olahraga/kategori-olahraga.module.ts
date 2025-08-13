import { Module } from '@nestjs/common';
import { KategoriOlahragaService } from './kategori-olahraga.service';
import { KategoriOlahragaController } from './kategori-olahraga.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KategoriOlahraga } from './entities/kategori-olahraga.entity/kategori-olahraga.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([KategoriOlahraga]),
  ],
  controllers: [KategoriOlahragaController],
  providers: [KategoriOlahragaService],
  exports: [KategoriOlahragaService],
})
export class KategoriOlahragaModule {}