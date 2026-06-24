import { ApiProperty } from "@nestjs/swagger";
import { UserEntity } from "src/users/entities/user.entity";

export class Order {

    @ApiProperty()
    id: number;

    @ApiProperty()
    title: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    typeOrder: string;
    
    @ApiProperty({ required: false})
    img?: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    @ApiProperty({ required: true })
    clientId: number;

    @ApiProperty({ required: false, type: UserEntity })
    client?: UserEntity

    constructor({ client, ...data }: Partial<Order>) {
        Object.assign(this, data);
    
        if (client) {
          this.client = new UserEntity(client);
        }
      }
}
