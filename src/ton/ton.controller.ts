import { Controller, Get, Param, Post } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { TonService } from "./ton.service";
import { CreatePaymentResponse } from "./dto/create.payment.response.dto";
import { PaymentService } from "src/payment/payment.service";
import { PaymentResponseDto } from "./dto/payment.response.dto";

@Controller("payment")
@ApiTags("Payment")
export class TonController {
    constructor(
        private tonService: TonService,
        private paymentService: PaymentService
    ) { }

    @Post()
    @ApiOkResponse({ status: 200, type: CreatePaymentResponse })
    createPayment() {
        return this.tonService.generatePayment()
    }

    @Get("/:id")
    @ApiOkResponse({ status: 200, type: PaymentResponseDto })
    async getPayment(@Param("id") id: string) {
        return await this.paymentService.findPayment(id)
    }
}