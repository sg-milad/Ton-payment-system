import { Injectable, OnModuleInit } from "@nestjs/common";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { Address, TonClient, } from "@ton/ton";
import { PaymentService } from "src/payment/payment.service";
import { WalletService } from "src/wallet/wallet.service";
import TonWeb from "tonweb";

@Injectable()
export class TonService implements OnModuleInit {
    private client: TonClient
    private tonWeb: TonWeb

    constructor(
        private walletService: WalletService,
        private PaymentService: PaymentService
    ) { }

    async onModuleInit() {
        const endpoint = await getHttpEndpoint();
        this.client = new TonClient({ endpoint });
        this.tonWeb = new TonWeb();
    }
    async checkTransactions(address: Address) {
        try {
            const transactions = await this.client.getTransactions(address, {
                limit: 2,
            });
            if (transactions.length > 0) {
                for (const tx of transactions) {
                    console.log(tx);
                }
            }

        } catch (error) {
            console.error("Error checking transactions:", error);
        }
    }
    async getWalletsAddress(): Promise<Address[]> {
        const getInitWallets = await this.PaymentService.findInitPayment()
        let walletAddress: Address[] = []
        for (const wallet of getInitWallets) {
            const address = await this.walletService.createWallet(wallet.walletAccount, 0, wallet.walletIndex)
            walletAddress.push(address.publicKey)
        }
        return walletAddress
    }

}