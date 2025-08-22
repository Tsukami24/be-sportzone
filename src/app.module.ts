import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { KategoriOlahragaModule } from './kategori-olahraga/kategori-olahraga.module';
import { PetugasModule } from './petugas/petugas.module';
import { SubkategoriPeralatanModule } from './subkategori-peralatan/subkategori-peralatan.module';
import { ProdukModule } from './produk/produk.module';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
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
  ],
})
export class AppModule {}
