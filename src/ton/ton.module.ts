import { Module } from "@nestjs/common";
import { TonService } from "./ton.service";
import { WalletModule } from "src/wallet/wallet.module";
import { PaymentModule } from "src/payment/payment.module";

@Module({
    imports: [WalletModule, PaymentModule],
    providers: [TonService]
})
export class TonModule { }