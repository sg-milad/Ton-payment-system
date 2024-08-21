import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { TransactionPaymentJob } from "../types/transaction.type";
import { PaymentQUEUE } from "../constants/payment.bull.constant";
import { PaymentService } from "src/payment/payment.service";
import { TonService } from "../ton.service";
import { fromNano, toNano } from "@ton/core";
import { WalletService } from "src/wallet/wallet.service";
import { Logger } from "@nestjs/common";

@Processor(PaymentQUEUE)
export class TransactionConsumer extends WorkerHost {
    private readonly logger = new Logger(TransactionConsumer.name);
    constructor(
        private PaymentService: PaymentService,
        private tonService: TonService,
        private walletService: WalletService,
    ) {
        super();
    }
    async process(job: Job<TransactionPaymentJob>): Promise<void> {
        this.logger.log("Process the Transaction...");
        const { id, walletAccount, walletIndex } = job.data.payment;
        const { source, tx } = job.data.transaction;

        const wallet = await this.walletService.createWallet(walletAccount, 0, walletIndex);
        const publicKey = await this.walletService.keyPairToPublicKey(wallet);
        this.logger.log("public key:", publicKey);
        const getBalance = await this.tonService.getBalance(publicKey);
        this.logger.log("balance:", getBalance);

        if (getBalance < toNano("0.01")) {
            this.logger.log("Balance is not enough ", toNano(getBalance));
            await this.PaymentService.updatePayment(
                { id },
                {
                    balance: fromNano(getBalance),
                    paymentStatus: "REJECT",
                    walletDes: publicKey,
                    tx,
                    walletSrc: source,
                },
            );
            return;
        }
        this.logger.log("start transfer");
        await this.tonService.transfer(wallet);

        await this.PaymentService.updatePayment(
            { id },
            {
                balance: fromNano(getBalance),
                paymentStatus: "PENDING",
                walletDes: publicKey,
                walletSrc: source,
                tx,
            },
        );
    }
}
