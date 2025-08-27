import { Controller, Post, Body, Req, HttpCode, UseGuards, Get, Res } from '@nestjs/common';
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.registerCustomer(dto);
  }

  @HttpCode(200)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.authService.logout(token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async profile(@Req() req) {
    const user = await this.authService.getProfile(req.user.sub);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role ? { id: user.role.id, name: user.role.name } : null,
      },
      token: req.headers.authorization?.split(' ')[1] || null,
    };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    const { token } = req.user || {};
    const frontend = process.env.FRONTEND_URL || 'http://localhost:3001';
    return res.redirect(`${frontend}/home?token=${token}`);
  }
}