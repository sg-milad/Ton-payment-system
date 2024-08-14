import { Injectable, OnModuleInit } from "@nestjs/common";
import { Payment } from "@prisma/client";
import { PrismaService } from "src/shared/prisma/prisma.service";

@Injectable()
export class PaymentService implements OnModuleInit {
    constructor(
        private prisma: PrismaService
    ) { }

    async onModuleInit() {

    }
    async generateWallet(): Promise<Payment> {
        const latestPayment = await this.prisma.payment.findFirst({
            orderBy: {
                createdAt: 'desc',
            },
        });
        if (latestPayment) {
            return await this.prisma.payment.create({
                data: {
                    balance: 0,
                    paymentStatus: "INIT",
                    walletAccount: latestPayment.walletAccount++,
                    walletIndex: latestPayment.walletIndex++,
                }
            })
        }
        return await this.prisma.payment.create({
            data: {
                balance: 0,
                paymentStatus: "INIT",
                walletAccount: 0,
                walletIndex: 0,
            }
        })
    }
}