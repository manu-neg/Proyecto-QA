import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateCatalogoDto {
        @IsNotEmpty()
        @IsString()
        @ApiProperty()
        @MinLength(3)
        titulo: string;
    
        @ApiProperty()
        @IsNotEmpty()
        @IsString()
        description: string;
    
        @ApiProperty()
        @IsString()
        @IsNotEmpty()
        url: string;
    
}
