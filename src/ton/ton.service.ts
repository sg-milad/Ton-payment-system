import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { Address, fromNano, internal, SendMode, toNano, TonClient, WalletContractV3R1 } from "@ton/ton";
import { Queue } from "bullmq";
import { PaymentService } from "src/payment/payment.service";
import { WalletService } from "src/wallet/wallet.service";
import { PaymentJob, PaymentQUEUE } from "./constants/payment.bull.constant";
import { TransactionType } from "./types/transaction.type";
import { ConfigService } from "@nestjs/config";
import { KeyPair } from "@ton/crypto";
@Injectable()
export class TonService implements OnModuleInit {
    private readonly logger = new Logger(TonService.name);
    private client: TonClient;

    constructor(
        private walletService: WalletService,
        private PaymentService: PaymentService,
        private configService: ConfigService,
        @InjectQueue(PaymentQUEUE) private paymentQueue: Queue,
    ) {}

    async onModuleInit() {
        try {
            const isMainNet = this.configService.get("app.isMainnet");
            const endpoint = await getHttpEndpoint({ network: isMainNet === "true" ? "mainnet" : "testnet" });

            this.client = new TonClient({ endpoint });
        } catch (error) {
            this.logger.error("Failed to initialize TonClient", error);
        }
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async transactionProcess(): Promise<void> {
        const getInitPayment = await this.PaymentService.findInitPayment();
        this.logger.log("find init Payment...", getInitPayment);
        if (getInitPayment.length === 0) return;
        for (const payment of getInitPayment) {
            const wallet = await this.walletService.createWallet(payment.walletAccount, 0, payment.walletIndex);
            const publicKey = await this.walletService.keyPairToPublicKey(wallet);
            const transactions = await this.checkTransactions(publicKey);
            for (const transaction of transactions) {
                this.logger.log("Transactions", { publicKey, transaction });
                await this.paymentQueue.add(PaymentJob, { transaction, payment }, { removeOnComplete: true });
            }
        }
    }
    @Cron(CronExpression.EVERY_MINUTE)
    async checkPendingPayments() {
        const getPendingPayment = await this.PaymentService.findPendingPayment();
        this.logger.log("Check pending payments", getPendingPayment);
        for (const payment of getPendingPayment) {
            if (payment.walletDes) {
                const balance = await this.getBalance(payment.walletDes);
                if (balance > toNano("0.1")) {
                    this.logger.log("Transfer remaining balance", { balance: toNano(balance), payment });
                    const wallet = await this.walletService.createWallet(payment.walletAccount, 0, payment.walletIndex);
                    return await this.transfer(wallet);
                }
                await this.PaymentService.updatePayment({ id: payment.id }, { paymentStatus: "ACCEPT" });
                this.logger.log("Payment accepted", payment);
            }
        }
    }
    async checkTransactions(publicKey: string): Promise<Array<TransactionType>> {
        try {
            const transactions = await this.client.getTransactions(Address.parse(publicKey), {
                limit: 5,
            });
            this.logger.log("Check transactions", { publicKey, transactions });
            const results: Array<TransactionType> = [];

            for (const tx of transactions) {
                if (tx.inMessage && tx.inMessage.info.type === "internal") {
                    const value = fromNano(tx.inMessage.info.value.coins);
                    const source = tx.inMessage.info.src.toString();

                    results.push({
                        value,
                        source,
                        tx: tx.hash().toString("hex"),
                    });
                }
            }

            return results;
        } catch (error) {
            this.logger.error("Failed to get transactions", { publicKey, error });
            return [];
        }
    }
    async transfer(keyPair: KeyPair) {
        try {
            const wallet = WalletContractV3R1.create({ publicKey: keyPair.publicKey, workchain: 0 });
            const contract = this.client.open(wallet);
            const seqno = await contract.getSeqno();
            return await contract.sendTransfer({
                seqno,
                secretKey: keyPair.secretKey,
                messages: [
                    internal({
                        value: "0",
                        to: this.configService.get("wallet.mainWallet") as string,
                        body: "meow",
                        bounce: false,
                        init: contract.init,
                    }),
                ],
                sendMode: SendMode.CARRY_ALL_REMAINING_BALANCE,
            });
        } catch (error) {
            this.logger.error("Failed to transfer Ton", { error });
        }
    }
    async getBalance(publicKey: string): Promise<bigint> {
        return await this.client.getBalance(Address.parse(publicKey));
    }
}
