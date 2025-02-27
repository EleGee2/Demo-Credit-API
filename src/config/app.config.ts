import { ConfigModuleOptions } from '@nestjs/config';
import Joi from 'joi';

export interface AppConfig {
  port: number;
  nodeEnv: string;
  logging: {
    level: string;
  };
  database: {
    host: string;
    user: string;
    password: string;
    database: string;
    port: number;
    pool: {
      min: number;
      max: number;
      idle: number;
    };
  };
  adjutor: {
    apiKey: string;
    baseUrl: string;
  };
}

const config = (): AppConfig => ({
  port: +process.env.PORT!,
  nodeEnv: process.env.NODE_ENV!,
  logging: {
    level: process.env.LOGGING_LEVEL!,
  },
  database: {
    host: process.env.DATABASE_HOST!,
    user: process.env.DATABASE_USER!,
    password: process.env.DATABASE_PASSWORD!,
    database: process.env.DATABASE_NAME!,
    port: +process.env.DATABASE_PORT!,
    pool: {
      min: +process.env.DATABASE_POOL_MIN!,
      max: +process.env.DATABASE_POOL_MAX!,
      idle: +process.env.DATABASE_POOL_IDLE_MS!,
    },
  },
  adjutor: {
    apiKey: process.env.ADJUTOR_API_KEY!,
    baseUrl: process.env.ADJUTOR_BASE_URL!,
  },
});

const configSchema = Joi.object({
  PORT: Joi.string().default('3000'),
  NODE_ENV: Joi.string().default('development'),
  LOGGING_LEVEL: Joi.string().default('info'),
  DATABASE_HOST: Joi.string().required(),
  DATABASE_USER: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  DATABASE_POOL_MIN: Joi.number().default(2),
  DATABASE_POOL_MAX: Joi.number().default(10),
  DATABASE_POOL_IDLE_MS: Joi.string().default('10000'),
});

export const configModuleOpts: ConfigModuleOptions = {
  cache: true,
  isGlobal: true,
  load: [config],
  validationSchema: configSchema,
};
