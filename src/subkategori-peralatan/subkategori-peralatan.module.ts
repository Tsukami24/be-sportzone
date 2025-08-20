import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubkategoriPeralatanService } from './subkategori-peralatan.service';
import { SubkategoriPeralatanController } from './subkategori-peralatan.controller';
import { SubkategoriPeralatan } from './entities/subkategori-peralatan.entity';
import { KategoriOlahraga } from '../kategori-olahraga/entities/kategori-olahraga.entity/kategori-olahraga.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([SubkategoriPeralatan, KategoriOlahraga]),
        AuthModule
    ],
    controllers: [SubkategoriPeralatanController],
    providers: [SubkategoriPeralatanService],
    exports: [SubkategoriPeralatanService]
})
export class SubkategoriPeralatanModule {}
