import { Injectable } from '@nestjs/common';
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

  async createPetugas(data: Partial<User>) {
    const rolePetugas = await this.getRoleByName('petugas');
    if (!rolePetugas) {
      throw new Error('Role petugas belum ada');
    }
    const hashed = await bcrypt.hash(data.password, 10);
    return this.create({ ...data, role_id: rolePetugas.id, password: hashed });
  }
}
