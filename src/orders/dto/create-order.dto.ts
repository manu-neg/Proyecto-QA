import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateOrderDto {

    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    @MinLength(5)
    title: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    typeOrder: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ required: false})
    img?: string;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty()
    clientId: number;
}

