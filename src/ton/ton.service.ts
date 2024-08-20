import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { Address, fromNano, internal, SendMode, toNano, TonClient, WalletContractV3R1 } from "@ton/ton";
import { Queue } from "bullmq";
import { PaymentService } from "src/payment/payment.service";
import { WalletService } from "src/wallet/wallet.service";
import { PaymentJob, PaymentQUEUE } from "./constants/payment.bull.costant";
import { TransactionType } from "./types/transaction.type";
import { ConfigService } from "@nestjs/config";
import { KeyPair } from "@ton/crypto";
@Injectable()
export class TonService implements OnModuleInit {
    private client: TonClient

    constructor(
        private walletService: WalletService,
        private PaymentService: PaymentService,
        private configService: ConfigService,
        @InjectQueue(PaymentQUEUE) private paymentQueue: Queue
    ) { }

    async onModuleInit() {
        const endpoint = await getHttpEndpoint({ network: "mainnet" })
        this.client = new TonClient({ endpoint });
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async transactionProcess(): Promise<void> {
        const getInitPayment = await this.PaymentService.findInitPayment()

        if (getInitPayment.length === 0) return;
        for (const payment of getInitPayment) {
            const wallet = await this.walletService.createWallet(payment.walletAccount, 0, payment.walletIndex)
            const publicKey = await this.walletService.keyPairToPublicKey(wallet)
            const transactions = await this.checkTransactions(publicKey)
            for (const transaction of transactions) {
                await this.paymentQueue.add(PaymentJob, { transaction, payment }, { removeOnComplete: true })
            }

        }
    }
    @Cron(CronExpression.EVERY_MINUTE)
    async checkPendingPayment() {
        const getPendingPayment = await this.PaymentService.findPendingPayment()
        for (const payment of getPendingPayment) {
            if (payment.walletDes) {
                const balance = await this.getBalance(payment.walletDes)
                if (balance > toNano("0.01")) {
                    const wallet = await this.walletService.createWallet(payment.walletAccount, 0, payment.walletIndex)
                    return await this.transfer(wallet)
                }
                await this.PaymentService.updatePayment({ id: payment.id }, { paymentStatus: "ACCEPT" })
            }
        }
    }
    async checkTransactions(publicKey: string): Promise<Array<TransactionType>> {
        try {
            const transactions = await this.client.getTransactions(Address.parse(publicKey), {
                limit: 5,
            });
            const results: Array<TransactionType> = [];

            for (const tx of transactions) {
                if (tx.inMessage && tx.inMessage.info.type === 'internal') {
                    const value = fromNano(tx.inMessage.info.value.coins)
                    const source = tx.inMessage.info.src.toString();

                    results.push({
                        value,
                        source,
                        tx: tx.hash().toString("hex")
                    });
                }
            }

            return results;
        } catch (error) {
            console.error("Error checking transactions:", error);
            return [];
        }
    }
    async generatePayment() {
        const payment = await this.PaymentService.createPayment()
        const wallet = await this.walletService.createWallet(payment.walletAccount, 0, payment.walletIndex)
        const publicKey = await this.walletService.keyPairToPublicKey(wallet)
        return { publicKey: publicKey }
    }
    async transfer(keyPair: KeyPair) {
        try {
            const wallet = WalletContractV3R1.create({ publicKey: keyPair.publicKey, workchain: 0 })
            let contract = this.client.open(wallet);
            let seqno = await contract.getSeqno();

            return await contract.sendTransfer({
                seqno,
                secretKey: keyPair.secretKey,
                messages: [internal({
                    value: "0",
                    to: this.configService.get("wallet.mainWallet") as string,
                    body: "meow",
                    bounce: false,
                    init: contract.init
                })],
                sendMode: SendMode.CARRY_ALL_REMAINING_BALANCE
            })
        } catch (error) {
            throw error;
        }
    }
    async getBalance(publicKey: string): Promise<bigint> {
        return await this.client.getBalance(Address.parse(publicKey))
    }
    async isWalletDeployed(publicKey: string): Promise<boolean> {
        return await this.client.isContractDeployed(Address.parse(publicKey))
    }
}