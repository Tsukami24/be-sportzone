// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenBlacklist } from './entities/token.entity';
import { Otp } from './entities/otp.entity';
import { User } from 'src/users/entities/user.entity/user.entity';
import { UsersService } from 'src/users/users.service';
import { EmailService } from './email.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { randomInt } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    @InjectRepository(TokenBlacklist)
    private readonly tokenBlacklistRepo: Repository<TokenBlacklist>,
    @InjectRepository(Otp)
    private readonly otpRepo: Repository<Otp>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // Register Customer
  async registerCustomer(dto: RegisterDto) {
    const roleCustomer = await this.userService.getRoleByName('customer');
    if (!roleCustomer) throw new Error('Role customer belum ada');

    const hashed = await bcrypt.hash(dto.password, 10);
    return this.userService.create({
      ...dto,
      password: hashed,
      role: roleCustomer,
    });
  }

  // Login All User
  async login(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('User not found');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid password');

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role!.name,
    };
    const token = await this.jwtService.signAsync(payload);
    return { user, token };
  }

  // Logout All User
  async logout(token: string) {
    await this.tokenBlacklistRepo.save({ token });
    return { message: 'Logout successful' };
  }

  // Blacklist Token
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const found = await this.tokenBlacklistRepo.findOne({ where: { token } });
    return !!found;
  }

  // Profile User
  async getProfile(userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }

  // Login With Google Customer
  async validateGoogleLogin(email: string, username: string) {
    let user = await this.userService.findByEmail(email);

    if (!user) {
      const roleCustomer = await this.userService.getRoleByName('customer');
      user = await this.userService.create({
        username,
        email,
        password: '',
        role: roleCustomer,
      });
    }

    const payload = { sub: user.id, email: user.email, role: user.role!.name };
    const token = await this.jwtService.signAsync(payload);

    return { user, token };
  }

  // Lupa Password All User
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) throw new BadRequestException('User not found');

    const otp = randomInt(100000, 999999).toString();

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    await this.otpRepo.delete({ email: dto.email });

    const otpEntity = this.otpRepo.create({ email: dto.email, otp, expiresAt });
    await this.otpRepo.save(otpEntity);

    await this.emailService.sendOtpEmail(dto.email, otp);

    return { message: 'OTP sent to your email' };
  }

  // Verifikasi Kode OTP
  async verifyOtp(dto: VerifyOtpDto) {
    const otpRecord = await this.otpRepo.findOne({
      where: { email: dto.email, otp: dto.otp },
    });

    if (!otpRecord) throw new BadRequestException('Invalid OTP');

    if (otpRecord.expiresAt < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    return { message: 'OTP verified' };
  }

  // Reset Password All User
  async resetPassword(dto: ResetPasswordDto) {
    await this.verifyOtp({ email: dto.email, otp: dto.otp });

    const user = await this.userService.findByEmail(dto.email);
    if (!user) throw new BadRequestException('User not found');

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepo.update(user.id, { password: hashed });

    await this.otpRepo.delete({ email: dto.email });

    return { message: 'Password reset successful' };
  }
}
