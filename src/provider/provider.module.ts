import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AdjutorService } from './adjutor/adjutor.service';
import { ProviderService } from './provider.service';

@Module({
  imports: [HttpModule],
  providers: [ProviderService, AdjutorService],
  exports: [ProviderService],
})
export class ProviderModule {}
