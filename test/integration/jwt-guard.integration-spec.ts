import * as request from 'supertest';
import {
  createTestApp,
  IntegrationContext,
  resolveSeedIds,
  signToken,
  SeedIds,
} from './helpers/bootstrap';

/**
 * Casos de Integración especificados en EEP-SEG-2026-001 v1.3 §4.1,
 * implementados como código real bajo EEP-SEG-2026-001 v1.4 (caja gris).
 *
 * Defecto confirmado WT-007: `@UseGuards(JwtAuthGuard)` está comentado en
 * src/orders/orders.controller.ts:23 (entre otros). El guard nunca se invoca,
 * así que JwtStrategy jamás llega a rechazar un token inválido/expirado
 * porque nunca se ejecuta: el controlador responde 200 directamente.
 *
 * REGLA DEL SEMÁFORO: el expect(401) codifica el criterio de seguridad
 * correcto, no el comportamiento observado hoy. Estos 3 casos DEBEN FALLAR
 * mientras WT-007 siga abierto.
 */
describe('Integración: JwtStrategy <-> AuthGuard (TC-SEG-AA-A1/A3)', () => {
  let ctx: IntegrationContext;
  let seed: SeedIds;

  beforeAll(async () => {
    ctx = await createTestApp();
    seed = await resolveSeedIds(ctx.prisma);
  });

  afterAll(async () => {
    await ctx.app.close();
  });

  describe('TC-SEG-AA-A1-02: JWT con firma inválida (rol manipulado, secreto de atacante)', () => {
    it('rechaza GET /orders con un token firmado con un secreto distinto al de producción', async () => {
      const forgedToken = signToken(
        ctx.jwt,
        { userId: seed.clientA.id, rol: 'admin' },
        { secret: 'secreto-atacante' },
      );

      const res = await request(ctx.app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${forgedToken}`);

      const observado = res.status;
      expect(observado).toBe(401); // FALLA ESPERADA (WT-007): guard comentado en orders.controller.ts:23 -> responde 200
    });
  });

  describe('TC-SEG-AA-A3-01: token expirado', () => {
    it('rechaza GET /orders con un token válido pero ya expirado', async () => {
      const expiredToken = signToken(
        ctx.jwt,
        { userId: seed.clientA.id },
        { expiresIn: '-1h' },
      );

      const res = await request(ctx.app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${expiredToken}`);

      const observado = res.status;
      expect(observado).toBe(401); // FALLA ESPERADA (WT-007): guard comentado en orders.controller.ts:23 -> responde 200
    });
  });

  describe('TC-SEG-AA-A3-02: secreto incorrecto (payload válido, firma con otro secreto)', () => {
    it('rechaza GET /orders con payload {userId} válido firmado con un secreto que no es el de producción', async () => {
      const wrongSecretToken = signToken(
        ctx.jwt,
        { userId: seed.clientA.id },
        { secret: 'otro-secreto-cualquiera' },
      );

      const res = await request(ctx.app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${wrongSecretToken}`);

      const observado = res.status;
      expect(observado).toBe(401); // FALLA ESPERADA (WT-007): guard comentado en orders.controller.ts:23 -> responde 200
    });
  });
});
