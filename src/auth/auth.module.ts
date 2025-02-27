import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '@src/user/user.module';
import { ProviderModule } from '@src/provider/provider.module';

@Global()
@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [UserModule, ProviderModule],
  exports: [AuthService],
})
export class AuthModule {}
