import { ConfigService } from '@nestjs/config';
import { LoggerModuleAsyncParams, Params } from 'nestjs-pino';
import { AppConfig } from './app.config';
import { v4 } from 'uuid';

const generateUUID = () => v4();

const getPinoConfig = (config: ConfigService<AppConfig>): Params => {
  const loggingConfig = config.get('logging', { infer: true })!;
  return {
    pinoHttp: {
      level: loggingConfig.level,
      formatters: {
        level: (label) => ({ level: label }),
      },
      redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.Authorization',
          'headers.authorization',
          'headers.Authorization',
        ],
        censor: '***MASKED***',
      },
      customLogLevel(_, res, err) {
        if (res.statusCode >= 400 && res.statusCode < 500) {
          return 'warn';
        }

        if (res.statusCode >= 500 || err) {
          return 'error';
        }

        return 'info';
      },
      autoLogging: false,
      genReqId: function (req, res) {
        const existingID = req.id ?? req.headers['x-request-id'];
        if (existingID) {
          return existingID;
        }
        const id = generateUUID();
        res.setHeader('X-Request-Id', id);
        return id;
      },
    },
  };
};

export const loggerModuleOpts: LoggerModuleAsyncParams = {
  inject: [ConfigService],
  useFactory: (c: ConfigService<AppConfig>) => getPinoConfig(c),
};
