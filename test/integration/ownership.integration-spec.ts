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
 * src/orders/orders.controller.ts:40 (PATCH) y :48 (DELETE). Sin el guard,
 * el controlador no solo deja pasar peticiones sin dueño verificado: ni
 * siquiera hay noción de "usuario autenticado" en la request, por lo que
 * cualquier cliente puede mutar o borrar órdenes ajenas.
 *
 * REGLA DEL SEMÁFORO: el expect(401) codifica el criterio de seguridad
 * correcto ("clientA no debe poder tocar una orden de clientB"), no el
 * comportamiento observado hoy. Estos 2 casos DEBEN FALLAR mientras WT-007
 * siga abierto.
 *
 * PROTECCIÓN DEL SEED: como el guard está comentado, el PATCH/DELETE se
 * ejecuta de verdad contra la BD. Para no arriesgar las órdenes sembradas
 * por prisma/seed.ts (usadas por otras suites vía resolveSeedIds), este
 * archivo crea sus PROPIAS órdenes desechables, propiedad de clientB, en
 * beforeAll, y las limpia en afterAll (deleteMany tolera que ya no existan
 * si el DELETE bajo prueba llegó a ejecutarse).
 */
describe('Integración: OrdersController <-> OrdersService <-> BD (TC-SEG-RNR-A4)', () => {
  let ctx: IntegrationContext;
  let seed: SeedIds;
  let clientAToken: string;

  let disposablePatchOrderId: number;
  let disposableDeleteOrderId: number;

  beforeAll(async () => {
    ctx = await createTestApp();
    seed = await resolveSeedIds(ctx.prisma);

    clientAToken = signToken(ctx.jwt, { userId: seed.clientA.id });

    const patchOrder = await ctx.prisma.orders.create({
      data: {
        title: 'Orden desechable de josue (PATCH ownership)',
        description: 'Creada por ownership.integration-spec.ts, no es una orden sembrada',
        typeOrder: 'standard',
        clientId: seed.clientB.id,
      },
    });
    disposablePatchOrderId = patchOrder.id;

    const deleteOrder = await ctx.prisma.orders.create({
      data: {
        title: 'Orden desechable de josue (DELETE ownership)',
        description: 'Creada por ownership.integration-spec.ts, no es una orden sembrada',
        typeOrder: 'standard',
        clientId: seed.clientB.id,
      },
    });
    disposableDeleteOrderId = deleteOrder.id;
  });

  afterAll(async () => {
    // Tolerante a que el PATCH/DELETE bajo prueba ya haya mutado/borrado estas
    // filas de verdad (justamente lo que WT-007 permite). deleteMany no falla
    // si el id ya no existe.
    await ctx.prisma.orders.deleteMany({
      where: { id: { in: [disposablePatchOrderId, disposableDeleteOrderId] } },
    });

    await ctx.app.close();
  });

  describe('TC-SEG-RNR-A4-01: propietario verificado tras UPDATE', () => {
    it('clientA no puede hacer PATCH sobre una orden propiedad de clientB', async () => {
      const res = await request(ctx.app.getHttpServer())
        .patch(`/orders/${disposablePatchOrderId}`)
        .set('Authorization', `Bearer ${clientAToken}`)
        .send({ title: 'tomada por A' });

      const observado = res.status;
      expect(observado).toBe(401); // FALLA ESPERADA (WT-007): guard comentado en orders.controller.ts:40 -> responde 200 y muta la orden ajena
    });
  });

  describe('TC-SEG-RNR-A4-02: propietario verificado tras DELETE', () => {
    it('clientA no puede hacer DELETE sobre una orden propiedad de clientB', async () => {
      const res = await request(ctx.app.getHttpServer())
        .delete(`/orders/${disposableDeleteOrderId}`)
        .set('Authorization', `Bearer ${clientAToken}`);

      const observado = res.status;
      expect(observado).toBe(401); // FALLA ESPERADA (WT-007): guard comentado en orders.controller.ts:48 -> responde 200 y borra la orden ajena
    });
  });
});
