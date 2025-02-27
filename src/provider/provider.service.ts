import { Injectable } from '@nestjs/common';
import { AdjutorService } from './adjutor/adjutor.service';
import { FetchBlacklistedRes } from './types';

@Injectable()
export class ProviderService {
  constructor(private readonly adjutorService: AdjutorService) {}

  async checkBlackListedEmail(
    email: string,
  ): Promise<FetchBlacklistedRes | null> {
    return await this.adjutorService.checkKarmaUser(email);
  }
}
