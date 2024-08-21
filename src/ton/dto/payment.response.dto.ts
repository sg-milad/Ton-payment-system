import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PaymentStatus } from "@prisma/client";

export class PaymentResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty({ enum: PaymentStatus })
    paymentStatus: string;

    @ApiProperty()
    walletAccount: number;

    @ApiProperty()
    walletIndex: number;

    @ApiPropertyOptional({ required: false })
    balance?: string;

    @ApiPropertyOptional({ required: false })
    walletSrc?: string;

    @ApiPropertyOptional({ required: false })
    walletDes?: string;

    @ApiPropertyOptional({ required: false })
    tx?: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
