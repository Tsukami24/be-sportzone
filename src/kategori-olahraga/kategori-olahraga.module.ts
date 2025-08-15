import { Module } from '@nestjs/common';
import { KategoriOlahragaService } from './kategori-olahraga.service';
import { KategoriOlahragaController } from './kategori-olahraga.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KategoriOlahraga } from './entities/kategori-olahraga.entity/kategori-olahraga.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([KategoriOlahraga]), AuthModule],
  controllers: [KategoriOlahragaController],
  providers: [KategoriOlahragaService],
  exports: [KategoriOlahragaService],
})
export class KategoriOlahragaModule {}