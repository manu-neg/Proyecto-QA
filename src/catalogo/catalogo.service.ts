import { Injectable } from '@nestjs/common';
import { CreateCatalogoDto } from './dto/create-catalogo.dto';
import { UpdateCatalogoDto } from './dto/update-catalogo.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CatalogoService {
  constructor(private prisma: PrismaService) {}
  
  create(createCatalogoDto: CreateCatalogoDto) {
    return this.prisma.catalogo.create({data: createCatalogoDto});
  }

  findAll() {
    return this.prisma.catalogo.findMany();
  }

  findOne(id: number) {
    return this.prisma.catalogo.findFirst({ where: {id} });
  }
  

  remove(id: number) {
    return this.prisma.catalogo.delete({ where: {id} });
  }
}
