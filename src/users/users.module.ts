import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity/user.entity';  
import { Role } from 'src/roles/entities/role.entity/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]), 
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
