import { ApiProperty } from "@nestjs/swagger";

export class CreatePaymentResponse {
    @ApiProperty({ type: String })
    publicKey: string
}