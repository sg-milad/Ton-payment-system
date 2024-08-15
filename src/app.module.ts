import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ConfigModuleOptions } from './configs/config.module.options';
import { PrismaModule } from './shared/prisma/prisma.module';
import { WalletModule } from './wallet/wallet.module';
import { TonModule } from './ton/ton.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot(ConfigModuleOptions()),
    PrismaModule,
    WalletModule,
    TonModule,
    PaymentModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
