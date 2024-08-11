import { Module } from "@nestjs/common";
import { WalletService } from "./wallet.service";

@Module({
    providers: [WalletService]
})
export class WalletModule { }