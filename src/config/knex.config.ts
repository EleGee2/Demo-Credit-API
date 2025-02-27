import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { AppConfig } from './app.config';
import {
  KnexModule,
  KnexModuleAsyncOptions,
  KnexModuleOptions,
} from 'nest-knexjs';

const getOpts = (c: ConfigService<AppConfig>): KnexModuleOptions => {
  const logger = new Logger(KnexModule.name);
  const db = c.get('database', { infer: true })!;

  const opts: KnexModuleOptions = {
    config: {
      client: 'mysql2',
      log: {
        warn: (message) => logger.warn(message),
        deprecate: (message) => logger.warn(message),
        error: (message) => logger.error(message),
        debug: (message) => logger.debug(message),
      },
      connection: {
        host: db.host,
        user: db.user,
        password: db.password,
        database: db.database,
        port: db.port,
      },
      migrations: {
        directory: './src/database/migrations',
        tableName: 'knex_migrations',
        extension: 'ts',
      },
      pool: { min: db.pool.min, max: db.pool.max },
      debug: true,
    },
  };
  return opts;
};

export const knexConfigOpts: KnexModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (c: ConfigService<AppConfig>) => getOpts(c),
};
