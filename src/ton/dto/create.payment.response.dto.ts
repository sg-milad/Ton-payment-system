import { ApiProperty } from "@nestjs/swagger";
import { PaymentResponseDto } from "./payment.response.dto";

export class CreatePaymentResponse extends PaymentResponseDto {
    @ApiProperty({ type: String })
    publicKey: string;
}
