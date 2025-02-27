interface ResponseObject<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Error[];
}

interface Error {
  message: string;
  field?: string;
  value?: unknown;
}

abstract class BaseResponseObject implements ResponseObject {
  constructor(
    public success: boolean,
    public message: string,
  ) {}
}

export class SuccessResponseObject<T = unknown> extends BaseResponseObject {
  constructor(
    message: string,
    public data: T,
  ) {
    super(true, message);
  }
}

export class ErrorResponseObject extends BaseResponseObject {
  constructor(
    public message: string,
    public errors: Error[] = [],
  ) {
    super(false, message);
  }
}
