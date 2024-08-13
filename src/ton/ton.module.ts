import { Module } from "@nestjs/common";
import { TonService } from "./ton.service";
import { WalletModule } from "src/wallet/wallet.module";

@Module({
    imports: [WalletModule],
    providers: [TonService]
})
export class TonModule { }