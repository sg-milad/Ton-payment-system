import { Module } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { WalletModule } from "src/wallet/wallet.module";
import { PaymentController } from "./payment.controller";
@Module({
    imports: [WalletModule],
    providers: [PaymentService],
    controllers: [PaymentController],
    exports: [PaymentService],
})
export class PaymentModule {}
