import { ApiProperty } from "@nestjs/swagger";
import { Users } from "@prisma/client";
import { Exclude } from "class-transformer";
import { Role } from "src/roles/entities/role.entity";

export class UserEntity implements Users {

    constructor(partial: Partial<UserEntity>) {
        Object.assign(this, partial);
    }

    @ApiProperty()
    id: number;

    @ApiProperty()
    username: string;
    
    @ApiProperty()
    email: string;
    
    @ApiProperty()
    createdAt: Date;
  
    @ApiProperty()
    updatedAt: Date;

    @Exclude()
    password: string;

    @ApiProperty()
    rolId: number;

    @ApiProperty()
    userRol: Role;
}
