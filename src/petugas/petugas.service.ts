// src/petugas/petugas.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { CreatePetugasDto, UpdatePetugasDto } from './dto/petugas.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PetugasService {
  constructor(private readonly usersService: UsersService) {}

  async create(dto: CreatePetugasDto) {
    const role = await this.usersService.getRoleByName('petugas');
    if (!role) throw new NotFoundException('Role petugas not found');

    const hashed = await bcrypt.hash(dto.password, 10);
    return this.usersService.create({
      ...dto,
      password: hashed,
      role_id: role.id,
    });
  }

  async findAll() {
    return this.usersService.findAllPetugas();
  }

  async findOne(id: string) {
    return this.usersService.findOnePetugas(id);
  }

  async update(id: string, dto: UpdatePetugasDto) {
    if (dto.password) dto.password = await bcrypt.hash(dto.password, 10);
    return this.usersService.updatePetugas(id, dto);
  }

  async remove(id: string) {
    return this.usersService.removePetugas(id);
  }
}
