import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { RequestValidationException } from '../errors';
import { ErrorResponseObject } from '@common/utils/http';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  private handleHttp(exception: HttpException, res: Response) {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as
      | string
      | Record<string, any>;

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : exceptionResponse.message;

    this.logger.warn(message);
    res.status(status).json(new ErrorResponseObject(message));
  }
  private handleFormedError(exception: ErrorResponseObject, res: Response) {
    this.logger.warn(exception, exception.message);
    res.status(400).json(exception);
  }

  private handleUnknownError(exception: unknown, res: Response) {
    this.logger.error(exception);
    res.status(500).json(new ErrorResponseObject('An unknown error occurred'));
  }

  private handleRequestValidationError(
    exception: RequestValidationException,
    res: Response,
  ) {
    this.logger.warn(exception.errorObject, exception.errorObject.message);
    res.status(422).json(exception.errorObject);
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      return this.handleHttp(exception, response);
    }

    if (exception instanceof RequestValidationException) {
      return this.handleRequestValidationError(exception, response);
    }

    if (exception instanceof ErrorResponseObject) {
      return this.handleFormedError(exception, response);
    }

    return this.handleUnknownError(exception, response);
  }
}
