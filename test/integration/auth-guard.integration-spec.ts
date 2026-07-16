import * as request from 'supertest';
import { createTestApp, IntegrationContext } from './helpers/bootstrap';

/**
 * Casos de Integración especificados en EEP-SEG-2026-001 v1.3 §4.1,
 * implementados como código real bajo EEP-SEG-2026-001 v1.4 (caja gris).
 *
 * Defecto confirmado WT-007: `@UseGuards(JwtAuthGuard)` está comentado en
 * src/orders/orders.controller.ts:23. Sin el guard montado, el controlador
 * atiende la petición sin exigir ninguna cabecera Authorization ni validar
 * su forma.
 *
 * REGLA DEL SEMÁFORO: el expect(401) codifica el criterio de seguridad
 * correcto, no el comportamiento observado hoy. Estos 2 casos DEBEN FALLAR
 * mientras WT-007 siga abierto.
 */
describe('Integración: AuthGuard <-> OrdersController (TC-SEG-AA-A4)', () => {
  let ctx: IntegrationContext;

  beforeAll(async () => {
    ctx = await createTestApp();
  });

  afterAll(async () => {
    await ctx.app.close();
  });

  describe('TC-SEG-AA-A4-01: ausencia total de token', () => {
    it('rechaza GET /orders sin cabecera Authorization', async () => {
      const res = await request(ctx.app.getHttpServer()).get('/orders');

      const observado = res.status;
      expect(observado).toBe(401); // FALLA ESPERADA (WT-007): guard comentado en orders.controller.ts:23 -> responde 200
    });
  });

  describe('TC-SEG-AA-A4-02: token malformado', () => {
    it('rechaza GET /orders con Authorization: Bearer not-a-jwt', async () => {
      const res = await request(ctx.app.getHttpServer())
        .get('/orders')
        .set('Authorization', 'Bearer not-a-jwt');

      const observado = res.status;
      expect(observado).toBe(401); // FALLA ESPERADA (WT-007): guard comentado en orders.controller.ts:23 -> responde 200
    });

    it('rechaza GET /orders con Authorization: Bearer abc.def.ghi (estructura JWT inválida)', async () => {
      const res = await request(ctx.app.getHttpServer())
        .get('/orders')
        .set('Authorization', 'Bearer abc.def.ghi');

      const observado = res.status;
      expect(observado).toBe(401); // FALLA ESPERADA (WT-007): guard comentado en orders.controller.ts:23 -> responde 200
    });
  });
});
