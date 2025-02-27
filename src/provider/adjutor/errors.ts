import { AxiosError } from 'axios';

export class FailedAdjutorRequestError extends Error {
  public statusCode?: number;

  constructor(private readonly e: AxiosError | Error) {
    const msg =
      e instanceof AxiosError
        ? e.response?.data?.message || e.message
        : e.message;
    super(msg);

    Object.setPrototypeOf(this, FailedAdjutorRequestError.prototype);

    if (e instanceof AxiosError) {
      this.statusCode = e.response?.status;
    }
  }
}
