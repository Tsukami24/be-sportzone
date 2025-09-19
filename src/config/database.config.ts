import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const databaseUrl = configService.get('DATABASE_URL');

  if (databaseUrl) {
    return {
      type: 'postgres',
      url: databaseUrl,
      ssl: {
        rejectUnauthorized: false, // wajib di Railway
      },
      extra: {
        ssl: { rejectUnauthorized: false }, // force SSL
      },
      autoLoadEntities: true,
      synchronize: false,
      logging: false, // matikan logging di production
    };
  }

  // fallback ke local
  return {
    type: 'postgres',
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get('DB_USER', 'postgres'),
    password: configService.get('DB_PASS', 'postgres'),
    database: configService.get('DB_NAME', 'db_sportzone'),
    autoLoadEntities: true,
    synchronize: true,
    logging: true, // aktifkan logging di local
  };
};