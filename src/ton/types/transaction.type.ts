import { Payment } from "@prisma/client";

export type TransactionType = { value: string; source: string; tx: string };

export type TransactionPaymentJob = {
    transaction: TransactionType;
    payment: Payment;
};
