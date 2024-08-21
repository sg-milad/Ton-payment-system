import { Module } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { WalletModule } from "src/wallet/wallet.module";
@Module({
    imports: [WalletModule],
    providers: [PaymentService],
    exports: [PaymentService],
})
export class PaymentModule { }