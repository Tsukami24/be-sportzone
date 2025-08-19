// src/petugas/petugas.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PetugasService } from './petugas.service';
import { CreatePetugasDto, UpdatePetugasDto } from './dto/petugas.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('petugas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PetugasController {
  constructor(private readonly petugasService: PetugasService) {}

  @Get()
  getAllPetugas() {
    return this.petugasService.findAll();
  }

  @Roles('admin')
  @Post()
  createPetugas(@Body() data: any) {
    return this.petugasService.create(data);
  }

  @Get(':id')
  @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.petugasService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdatePetugasDto) {
    return this.petugasService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  deletePetugas(@Param('id') id: string) {
    return this.petugasService.remove(id);
  }
}