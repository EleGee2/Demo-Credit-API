import { Logger } from '@nestjs/common';

export const verboseLoggerSpy = jest
  .spyOn(Logger.prototype, 'verbose')
  .mockImplementation(() => jest.fn());

export const debugLoggerSpy = jest
  .spyOn(Logger.prototype, 'debug')
  .mockImplementation(() => jest.fn());

export const logLoggerSpy = jest
  .spyOn(Logger.prototype, 'log')
  .mockImplementation(() => jest.fn());

export const warnLoggerSpy = jest
  .spyOn(Logger.prototype, 'warn')
  .mockImplementation(() => jest.fn());

export const errorLoggerSpy = jest
  .spyOn(Logger.prototype, 'error')
  .mockImplementation(() => jest.fn());

export const fatalLoggerSpy = jest
  .spyOn(Logger.prototype, 'fatal')
  .mockImplementation(() => jest.fn());
