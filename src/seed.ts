import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { RolesService } from './roles/roles.service';
import * as bcrypt from 'bcrypt';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const usersService = app.get(UsersService);
  const rolesService = app.get(RolesService);

  const roles = ['admin', 'petugas', 'customer'];
  for (const name of roles) {
    const existing = await rolesService.findByName(name);
    if (!existing) {
      await rolesService.create({ name });
      console.log(`Role "${name}" created!`);
    }
  }

  let roleAdmin = await rolesService.findByName('admin');

  if (!roleAdmin) {
    roleAdmin = await rolesService.create({ name: 'admin' });
  }

  const hashed = await bcrypt.hash('admin123', 10);
  const admin = await usersService.findByEmail('admin@example.com');
  if (!admin) {
    await usersService.create({
      username: 'Admin',
      email: 'admin@example.com',
      password: hashed,
      role: roleAdmin,
    });
    console.log('Admin account created!');
  } else {

    await usersService.userRepo.update(admin.id, { password: hashed });
    console.log('Admin account updated!');
  }

  await app.close();
}

seed()
  .then(() => {
    console.log('Seeding completed!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
