import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity/role.entity'; 

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
  ) {}

  async findByName(name: string) {
    return this.roleRepo.findOne({ where: { name } });
  }

  async create(data: Partial<Role>) {
    const role = this.roleRepo.create(data);
    return this.roleRepo.save(role);
  }
}
