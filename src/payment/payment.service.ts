import { Injectable } from "@nestjs/common";
import { Payment, Prisma } from "@prisma/client";
import { PrismaService } from "src/shared/prisma/prisma.service";

@Injectable()
export class PaymentService {
    constructor(
        private prisma: PrismaService
    ) { }
    async createPayment(): Promise<Payment> {
        const latestPayment = await this.prisma.payment.findFirst({
            orderBy: {
                createdAt: 'desc',
            },
        });
        if (latestPayment) {
            const incrementedWalletAccount = latestPayment.walletAccount + 1;
            const incrementedWalletIndex = latestPayment.walletIndex + 1;
            return await this.prisma.payment.create({
                data: {
                    paymentStatus: "INIT",
                    walletAccount: incrementedWalletAccount,
                    walletIndex: incrementedWalletIndex,
                }
            });
        }
        return await this.prisma.payment.create({
            data: {
                paymentStatus: "INIT",
                walletAccount: 0,
                walletIndex: 0,
            }
        })
    }
    async findInitPayment(): Promise<Payment[]> {
        return await this.prisma.payment.findMany({ where: { paymentStatus: "INIT" } })
    }
    async findPendingPayment(): Promise<Payment[]> {
        return await this.prisma.payment.findMany({ where: { paymentStatus: "PENDING" } })
    }
    async updatePayment(where: Prisma.PaymentWhereUniqueInput, data: Prisma.PaymentUpdateInput) {
        return await this.prisma.payment.update({ data, where })
    }
    async findOne(where: Prisma.PaymentFindUniqueArgs) {
        return await this.prisma.payment.findUnique(where)
    }
    async findPayment(id: string) {
        return await this.findOne({ where: { id } })
    }
}