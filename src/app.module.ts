import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { CatalogoModule } from './catalogo/catalogo.module';

@Module({
  imports: [UsersModule, OrdersModule, PrismaModule, AuthModule, RolesModule, CatalogoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
