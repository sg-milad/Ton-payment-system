import { Module } from "@nestjs/common";
import { TonService } from "./ton.service";
import { WalletModule } from "src/wallet/wallet.module";
import { PaymentModule } from "src/payment/payment.module";
import { BullModule } from "@nestjs/bullmq";
import { PaymentQUEUE } from "./constants/payment.bull.constant";
import { TransactionConsumer } from "./queues/transaction.queue";

@Module({
    imports: [
        BullModule.registerQueue({
            name: PaymentQUEUE,
        }),
        WalletModule,
        PaymentModule
    ],
    providers: [TonService, TransactionConsumer],
    exports: [TonService]
})
export class TonModule { }