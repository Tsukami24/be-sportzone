import { Module, forwardRef } from '@nestjs/common';
import { PetugasController } from './petugas.controller';
import { PetugasService } from './petugas.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { User } from 'src/users/entities/user.entity/user.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule, UsersModule, TypeOrmModule.forFeature([User])],
  controllers: [PetugasController],
  providers: [PetugasService],
  exports: [PetugasService],
})
export class PetugasModule {}
