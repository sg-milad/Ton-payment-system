import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ConfigModuleOptions } from './configs/config.module.options';
import { PrismaModule } from './shared/prisma/prisma.module';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [
    ConfigModule.forRoot(ConfigModuleOptions()),
    PrismaModule,
    WalletModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
