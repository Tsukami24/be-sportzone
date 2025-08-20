import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5432),
  username: configService.get('DB_USER', 'postgres'),
  password: configService.get('DB_PASS', 'postgres'),
  database: configService.get('DB_NAME', 'db_sportzone'),
  autoLoadEntities: true,
  synchronize: true,
  logging: configService.get('NODE_ENV') === 'development',
  // Retry options
  retryAttempts: 3,
  retryDelay: 3000,
});
