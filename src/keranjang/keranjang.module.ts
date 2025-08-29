import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Keranjang } from './entities/keranjang.entity';
import { KeranjangItem } from './entities/keranjang-item.entity';
import { KeranjangService } from './keranjang.service';
import { KeranjangController } from './keranjang.controller';
import { AuthModule } from '../auth/auth.module';
import { Produk } from '../produk/entities/produk.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Keranjang, KeranjangItem, Produk]), AuthModule],
	controllers: [KeranjangController],
	providers: [KeranjangService],
	exports: [KeranjangService]
})
export class KeranjangModule {}
