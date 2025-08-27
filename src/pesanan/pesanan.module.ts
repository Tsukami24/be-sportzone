import { Module } from '@nestjs/common';
import { PesananService } from './pesanan.service';
import { PesananController } from './pesanan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pesanan } from './entities/pesanan.entity';
import { PesananItem } from './entities/pesanan-item.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { ProdukModule } from 'src/produk/produk.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pesanan, PesananItem]), 
    AuthModule,
    UsersModule,
    ProdukModule
  ],
  controllers: [PesananController],
  providers: [PesananService],
  exports: [PesananService],
})
export class PesananModule {}