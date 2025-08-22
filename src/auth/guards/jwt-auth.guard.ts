import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new UnauthorizedException('Token missing');

    const token = authHeader.split(' ')[1];

    try {
      const payload: any = await this.jwtService.verifyAsync(token);
      req.user = payload; 
    } catch {
      throw new UnauthorizedException('Token invalid');
    }

    const blacklisted = await this.authService.isTokenBlacklisted(token);
    if (blacklisted) throw new UnauthorizedException('Token revoked');

    return true;
  }
}
