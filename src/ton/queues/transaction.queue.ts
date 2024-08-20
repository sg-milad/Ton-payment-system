import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { TransactionPaymentJob } from '../types/transaction.type';
import { PaymentQUEUE } from '../constants/payment.bull.costant';
import { PaymentService } from 'src/payment/payment.service';
import { TonService } from '../ton.service';
import { toNano } from '@ton/core';
import { WalletService } from 'src/wallet/wallet.service';

@Processor(PaymentQUEUE)
export class TransactionConsumer extends WorkerHost {
    constructor(
        private PaymentService: PaymentService,
        private tonService: TonService,
        private walletService: WalletService
    ) {
        super()
    }
    async process(job: Job<TransactionPaymentJob>): Promise<void> {

        const { id, walletAccount, walletIndex } = job.data.payment
        const { source, tx } = job.data.transaction

        const wallet = await this.walletService.createWallet(walletAccount, 0, walletIndex)
        const publicKey = await this.walletService.keyPairToPublicKey(wallet)

        const getBalance = await this.tonService.getBalance(publicKey)

        if (getBalance < toNano("0.01")) {
            await this.PaymentService.
                updatePayment({ id },
                    {
                        balance: getBalance.toString(),
                        paymentStatus: "REJECT",
                        walletDes: publicKey, tx, walletSrc: source
                    });
            return;
        }

        await this.tonService.transfer(wallet)

        await this.PaymentService.
            updatePayment({ id },
                {
                    balance: getBalance.toString(),
                    paymentStatus: "PENDING",
                    walletDes: publicKey,
                    walletSrc: source,
                    tx,
                })
    }
}