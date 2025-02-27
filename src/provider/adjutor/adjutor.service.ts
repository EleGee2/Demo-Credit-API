import { AppConfig } from '@config/app.config';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MakeRequestArg } from '../types';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { catchError, firstValueFrom, map, of, tap } from 'rxjs';
import { AdjutorApiRes, CheckKarmaUserResData } from './types';
import { FailedAdjutorRequestError } from './errors';
import { LoggableAxiosError } from '@common/errors';

@Injectable()
export class AdjutorService {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService<AppConfig>,
  ) {}

  private logger = new Logger(AdjutorService.name);

  private get baseUrl() {
    const adjutor = this.config.get('adjutor', { infer: true })!;
    return adjutor.baseUrl;
  }

  private get authHeader() {
    const adjutor = this.config.get('adjutor', { infer: true })!;
    return { Authorization: `Bearer ${adjutor.apiKey}` };
  }

  private async makeRequest<D = null>(opts: MakeRequestArg) {
    const reqConfig: AxiosRequestConfig = {
      method: opts.method,
      url: opts.url,
      data: opts.body,
      params: opts.params,
      headers: { ...this.authHeader },
    };

    this.logger.verbose(
      reqConfig,
      `${opts.method.toUpperCase()} ${opts.url} req config`,
    );

    const res = await firstValueFrom(
      this.http.request<AdjutorApiRes<D>>(reqConfig).pipe(
        map((r) => r.data),
        tap((r) =>
          this.logger.debug(
            r,
            `${opts.method.toUpperCase()} ${opts.url} response`,
          ),
        ),
        map((r) => (r.status ? r.data : null)),
        catchError((e: AxiosError | Error) => {
          const errorToLog =
            e instanceof AxiosError ? new LoggableAxiosError(e) : e;
          this.logger.error(errorToLog);
          return of(new FailedAdjutorRequestError(e));
        }),
      ),
    );

    return res;
  }

  async checkKarmaUser(email: string) {
    const res = await this.makeRequest<CheckKarmaUserResData>({
      method: 'get',
      url: `${this.baseUrl}/verification/karma/${email}`,
    });

    if (!res || res instanceof FailedAdjutorRequestError) {
      return null;
    }

    return {
      reason: res.reason,
    };
  }
}
