import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EmailService } from './email.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { TokenBlacklist } from './entities/token.entity';
import { Otp } from './entities/otp.entity';
import { User } from 'src/users/entities/user.entity/user.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/role.guard';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    ConfigModule,
    TypeOrmModule.forFeature([TokenBlacklist, Otp, User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecretkey',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailService,
    JwtAuthGuard,
    RolesGuard,
    JwtStrategy,
    GoogleStrategy,
  ],
  exports: [AuthService, JwtAuthGuard, RolesGuard, JwtModule],
})
export class AuthModule {}
