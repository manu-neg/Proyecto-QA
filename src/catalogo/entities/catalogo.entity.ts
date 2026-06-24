import { ApiProperty } from "@nestjs/swagger";

export class Catalogo {
    @ApiProperty()
    id: number;

    @ApiProperty()
    titulo: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    url: string;
}
