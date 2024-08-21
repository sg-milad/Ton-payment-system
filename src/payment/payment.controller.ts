import { Controller, Get, Param, ParseUUIDPipe, Post } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { CreatePaymentResponse } from "../ton/dto/create.payment.response.dto";
import { PaymentService } from "src/payment/payment.service";
import { PaymentResponseDto } from "../ton/dto/payment.response.dto";

@Controller("payment")
@ApiTags("Payment")
export class PaymentController {
    constructor(private paymentService: PaymentService) {}

    @Post()
    @ApiOkResponse({ status: 200, type: CreatePaymentResponse })
    createPayment() {
        return this.paymentService.createPaymentWithWallet();
    }

    @Get("/:id")
    @ApiOkResponse({ status: 200, type: PaymentResponseDto })
    async getPayment(@Param("id", ParseUUIDPipe) id: string) {
        return await this.paymentService.findPayment(id);
    }
}
