import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { error } from 'console';

@Injectable()
export class AuthService{
    constructor(
        private readonly userService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async registerCustomer(dto: RegisterDto) {
        const roleCustomer = await this.userService.getRoleByName('customer')
        if (!roleCustomer) {
            throw new error('role customer belum ada');
        }

        const hashed = await bcrypt.hash(dto.password, 10);
        return this.userService.create({
            ...dto,
            password: hashed,
            role_id: roleCustomer.id,
        })
    }

    async login(dto: LoginDto) {
        const user = await this.userService.findByEmail(dto.email);
        if (!user) throw new UnauthorizedException('user not found')
        
        const password = await bcrypt.compare(dto.password, user.password);
        if (!password) throw new UnauthorizedException('invalid password')
        
        const payload = { sub: user.id, role: user.role.name };
        const token = await this.jwtService.signAsync(payload);

        return {user, token};
    }
}
