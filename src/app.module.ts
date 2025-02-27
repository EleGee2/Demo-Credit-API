import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { configModuleOpts } from '@config/app.config';
import { loggerModuleOpts } from '@config/logger.config';
import { KnexModule } from 'nest-knexjs';
import { knexConfigOpts } from '@config/knex.config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ProviderModule } from './provider/provider.module';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOpts),
    LoggerModule.forRootAsync(loggerModuleOpts),
    KnexModule.forRootAsync(knexConfigOpts),
    UserModule,
    AuthModule,
    ProviderModule,
    WalletModule,
  ],
})
export class AppModule {}
