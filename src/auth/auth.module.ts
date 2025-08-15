// src/auth/auth.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { TokenBlacklist } from './entities/token.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
@Module({
  imports: [
    forwardRef(() => UsersModule),
    TypeOrmModule.forFeature([TokenBlacklist]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecretkey',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, JwtStrategy],
  exports: [AuthService, JwtAuthGuard, JwtModule], // <- export JwtModule supaya JwtService tersedia
})
export class AuthModule {}

