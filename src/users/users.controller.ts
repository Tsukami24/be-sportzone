import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { Roles } from 'src/auth/decorators/roles.decorator'; 
import { User } from './entities/user.entity/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, AdminGuard)
@Roles('admin')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Buat petugas
  @Post('petugas')
  async createPetugas(@Body() data: Partial<User>) {
    return this.usersService.createPetugas(data);
  }

  // Ambil detail petugas by ID
  @Get('petugas/:id')
  async getPetugas(@Param('id') id: string) {
    return this.usersService.findPetugasById(id);
  }

  // Update petugas
  @Put('petugas/:id')
  async updatePetugas(@Param('id') id: string, @Body() data: Partial<User>) {
    return this.usersService.updatePetugas(id, data);
  }

  // Hapus petugas
  @Delete('petugas/:id')
  async deletePetugas(@Param('id') id: string) {
    return this.usersService.deletePetugas(id);
  }

  // Optional: cari user by email
  @Get('email/:email')
  async findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }
}
