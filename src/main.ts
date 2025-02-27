import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { AppConfig } from '@config/app.config';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from '@common/filters/exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  const config = app.get(ConfigService<AppConfig>);

  app.useGlobalPipes(new ValidationPipe());
  app.set('trust proxy', true);
  app.useLogger(app.get(Logger));
  app.use(helmet());
  app.enableVersioning();

  app.useGlobalFilters(new GlobalExceptionFilter());

  const port = config.get('port', { infer: true })!;
  await app.listen(port);
}

bootstrap().catch(console.error);
