import { Test, TestingModule } from '@nestjs/testing';
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { jwtSecret } from 'src/auth/auth.module';

/**
 * Arnés compartido por las suites de integración (EEP-SEG-2026-001 v1.4 §4.1).
 *
 * Replica fielmente la configuración de src/main.ts:11-12. Si la app de prueba
 * no monta los mismos pipes/interceptors que producción, la prueba no verifica
 * la interacción real de componentes y el nivel de Integración vuelve a ser
 * ficticio — que es justamente la brecha que este trabajo cierra.
 */
export interface IntegrationContext {
  app: INestApplication;
  prisma: PrismaService;
  jwt: JwtService;
}

export async function createTestApp(): Promise<IntegrationContext> {
  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();

  // Idéntico a main.ts:11-12 — NO cambiar sin cambiar main.ts.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  await app.init();

  return {
    app,
    prisma: moduleRef.get(PrismaService),
    jwt: moduleRef.get(JwtService),
  };
}

/**
 * Firma un JWT con el payload que espera JwtStrategy.validate (`{ userId }`,
 * ver src/auth/jwt.strategy.ts:17).
 *
 * `secret` por defecto es el jwtSecret real de producción (auth.module.ts:11).
 * Pasar un secreto distinto produce un token con firma inválida; pasar
 * `expiresIn: '-1h'` produce uno ya expirado. No requiere `jsonwebtoken` como
 * dependencia directa: JwtService (@nestjs/jwt) ya está en el árbol.
 */
export function signToken(
  jwt: JwtService,
  payload: Record<string, unknown>,
  opts: { secret?: string; expiresIn?: string } = {},
): string {
  return jwt.sign(payload, {
    secret: opts.secret ?? jwtSecret,
    expiresIn: opts.expiresIn ?? '5h',
  });
}

export interface SeedIds {
  admin: { id: number; email: string };
  clientA: { id: number; email: string };
  clientB: { id: number; email: string };
  orderOfClientA: { id: number; clientId: number };
  orderOfClientB: { id: number; clientId: number };
}

/**
 * Resuelve por consulta los IDs de los datos sembrados por prisma/seed.ts.
 *
 * NUNCA hardcodear IDs: seed.ts crea las órdenes con `create` (no `upsert`,
 * ver prisma/seed.ts:78-110), así que re-sembrar duplica filas y desplaza los
 * autoincrementos. La colección Postman sí los hardcodea
 * (security-environment.postman_environment.json:15-16) y por eso es frágil;
 * las suites de integración no repiten ese error.
 */
export async function resolveSeedIds(prisma: PrismaService): Promise<SeedIds> {
  const [admin, clientA, clientB] = await Promise.all([
    prisma.users.findUnique({ where: { email: 'sabin@adams.com' } }),
    prisma.users.findUnique({ where: { email: 'aharon@guedez.com' } }),
    prisma.users.findUnique({ where: { email: 'josue@guedez.com' } }),
  ]);

  if (!admin || !clientA || !clientB) {
    throw new Error(
      'Datos de seed ausentes. Ejecutar `npx prisma db seed` contra la BD de pruebas antes de correr la suite de integración.',
    );
  }

  const [orderOfClientA, orderOfClientB] = await Promise.all([
    prisma.orders.findFirst({
      where: { clientId: clientA.id },
      orderBy: { id: 'asc' },
    }),
    prisma.orders.findFirst({
      where: { clientId: clientB.id },
      orderBy: { id: 'asc' },
    }),
  ]);

  if (!orderOfClientA || !orderOfClientB) {
    throw new Error(
      'Órdenes de seed ausentes. TC-SEG-RNR-A4-01/02 requieren al menos una orden por cliente.',
    );
  }

  return {
    admin: { id: admin.id, email: admin.email },
    clientA: { id: clientA.id, email: clientA.email },
    clientB: { id: clientB.id, email: clientB.email },
    orderOfClientA: { id: orderOfClientA.id, clientId: orderOfClientA.clientId },
    orderOfClientB: { id: orderOfClientB.id, clientId: orderOfClientB.clientId },
  };
}

/** Email único por ejecución — evita colisionar con el `@unique` de Users.email. */
export function uniqueEmail(prefix = 'itest'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@integration.test`;
}
