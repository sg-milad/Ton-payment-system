import { Injectable, OnModuleInit } from "@nestjs/common";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { Address, fromNano, TonClient, } from "@ton/ton";
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
        await this.transactionProcess()
    }
    async checkTransaction(address: Address): Promise<{ value: bigint; source: Address, tx: string } | null> {
        try {
            const transactions = await this.client.getTransactions(address, {
                limit: 2,
            });
            if (transactions.length > 0) {
                for (const tx of transactions) {
                    if (tx.inMessage && tx.inMessage.info.type === 'internal') {
                        const value = tx.inMessage.info.value.coins;
                        const source = tx.inMessage.info.src;
                        return {
                            value,
                            source,
                            tx: tx.hash().toString("hex")
                        }
                    }
                    return null
                }
            }
            return null
        } catch (error) {
            console.error("Error checking transactions:", error);
            return null
        }
    }
    async transactionProcess(): Promise<void> {
        const getInitWallets = await this.PaymentService.findInitPayment()
        if (getInitWallets.length === 0) return;
        for (const wallet of getInitWallets) {
            const address = await this.walletService.createWallet(wallet.walletAccount, 0, wallet.walletIndex)
            const transaction = await this.checkTransaction(address.publicKey)
            console.log(address.publicKey);
            console.log(transaction);

            if (transaction) {
                await this.PaymentService
                    .updatePayment({ id: wallet.id },
                        {
                            tx: transaction.tx,
                            balance: Number(fromNano(transaction.value)),
                            walletSrc: transaction.source.toString(),
                            paymentStatus: "ACCEPT"
                        })
            }
        }
    }
}