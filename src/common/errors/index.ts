import { ErrorResponseObject } from '@common/utils/http';
import { AxiosError } from 'axios';

export class RequestValidationException {
  constructor(public errorObject: ErrorResponseObject) {}
}

export class LoggableAxiosError extends Error {
  public code?: string;
  public request: { method?: string; url?: string; data?: unknown } = {};
  public response: { code?: number; data?: unknown } = {};
  constructor(e: AxiosError) {
    super(
      `${e.config ? `${e.config.method?.toUpperCase()} ${e.config.url} error` : e.message}`,
    );
    this.code = e.code;

    if (e.response) {
      this.response.code = e.response.status;
      this.response.data = e.response.data;
    }

    if (e.config) {
      this.request.url = e.config.url;
      this.request.method = e.config.method;
      this.request.data = e.config.data;
    }
  }
}
