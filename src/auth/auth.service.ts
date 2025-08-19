// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenBlacklist } from './entities/token.entity';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(TokenBlacklist)
    private readonly tokenBlacklistRepo: Repository<TokenBlacklist>,
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

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
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
}
