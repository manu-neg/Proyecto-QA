import { Module } from '@nestjs/common';
import { CatalogoService } from './catalogo.service';
import { CatalogoController } from './catalogo.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [CatalogoController],
  providers: [CatalogoService],
  imports:[PrismaModule]
})
export class CatalogoModule {}
