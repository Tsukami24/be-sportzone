// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
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

  async logout(token: string) {
    await this.tokenBlacklistRepo.save({ token });
    return { message: 'Logout successful' };
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const found = await this.tokenBlacklistRepo.findOne({ where: { token } });
    return !!found;
  }

  async getProfile(userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }

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

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) throw new BadRequestException('User not found');

    // Generate OTP
    const otp = randomInt(100000, 999999).toString();

    // Set expiration to 10 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Save OTP
    await this.otpRepo.save({ email: dto.email, otp, expiresAt });

    // Send email
    await this.emailService.sendOtpEmail(dto.email, otp);

    return { message: 'OTP sent to your email' };
  }

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

  async resetPassword(dto: ResetPasswordDto) {
    // First verify OTP
    await this.verifyOtp({ email: dto.email, otp: dto.otp });

    // Update password
    const user = await this.userService.findByEmail(dto.email);
    if (!user) throw new BadRequestException('User not found');

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepo.update(user.id, { password: hashed });

    // Delete OTP
    await this.otpRepo.delete({ email: dto.email });

    return { message: 'Password reset successful' };
  }

}
