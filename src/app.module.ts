import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { KategoriOlahragaModule } from './kategori-olahraga/kategori-olahraga.module';
import { PetugasModule } from './petugas/petugas.module';
import { SubkategoriPeralatanModule } from './subkategori-peralatan/subkategori-peralatan.module';
import { ProdukModule } from './produk/produk.module';
import { BrandModule } from './brand/brand.module';
import { PesananModule } from './pesanan/pesanan.module';
import { KeranjangModule } from './keranjang/keranjang.module';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    // Serve uploaded files at /uploads/<filename>
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: databaseConfig,
      inject: [ConfigService],
    }),
    
    AuthModule,
    UsersModule,
    RolesModule,
    PetugasModule,
    KategoriOlahragaModule,
    SubkategoriPeralatanModule,
    ProdukModule,
    BrandModule,
    PesananModule,
    KeranjangModule,
  ],
})
export class AppModule {}
