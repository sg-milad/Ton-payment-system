import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { ConfigModuleOptions } from "./configs/config.module.options";
import { PrismaModule } from "./shared/prisma/prisma.module";
import { BullConfigService } from "./configs/bullmq.config";
import { PaymentModule } from "./payment/payment.module";
import { WalletModule } from "./wallet/wallet.module";
import { TonModule } from "./ton/ton.module";
import { BullModule } from "@nestjs/bullmq";

@Module({
    imports: [
        ConfigModule.forRoot(ConfigModuleOptions()),
        ScheduleModule.forRoot(),
        BullModule.forRootAsync({
            imports: [ConfigModule],
            useClass: BullConfigService,
        }),
        PrismaModule,
        WalletModule,
        TonModule,
        PaymentModule,
    ],
})
export class AppModule {}
