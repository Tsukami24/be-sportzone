import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity/user.entity';
import { Role } from 'src/roles/entities/role.entity/role.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
  ) {}

  async create(data: Partial<User>) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({
      where: { email },
      relations: ['role'],
      select: ['id', 'username', 'email', 'password'],
    });
  }

  async getRoleByName(name: string) {
    return this.roleRepo.findOne({ where: { name } });
  }

  // Petugas
  async findAllPetugas() {
    return this.userRepo.find({
      where: { role: { name: 'petugas' } },
      relations: ['role'],
      select: ['id', 'username', 'email'],
    });
  }

  async findOnePetugas(id: string) {
    const user = await this.userRepo.findOne({
      where: { id, role: { name: 'petugas' } },
      relations: ['role'],
      select: ['id', 'username', 'email'],
    });
    if (!user) throw new NotFoundException('Petugas not found');
    return user;
  }

  async updatePetugas(id: string, data: Partial<User>) {
    const user = await this.userRepo.findOne({
      where: { id, role: { name: 'petugas' } },
    });
    if (!user) throw new NotFoundException('Petugas not found');

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    Object.assign(user, data);
    return this.userRepo.save(user);
  }

  async removePetugas(id: string) {
    const user = await this.userRepo.findOne({
      where: { id, role: { name: 'petugas' } },
    });
    if (!user) throw new NotFoundException('Petugas not found');
    return this.userRepo.remove(user);
  }
}
