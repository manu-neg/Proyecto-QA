import * as request from 'supertest';
import { createTestApp, IntegrationContext } from './helpers/bootstrap';

/**
 * Casos de Integración especificados en EEP-SEG-2026-001 v1.3 §4.1,
 * implementados como código real bajo EEP-SEG-2026-001 v1.4 (caja gris).
 *
 * TC-SEG-CI-A1-01: ValidationPipe <-> Controller.
 * TC-SEG-CI-A1-02: ValidationPipe/DTO <-> persistencia (inyección SQL vía campo email).
 *
 * REGLA DEL SEMÁFORO: el expect codifica el criterio de seguridad correcto,
 * nunca el comportamiento observado. No se ajustan expects para que pasen.
 */
describe('Integración: ValidationPipe <-> UsersController (TC-SEG-CI-A1)', () => {
  let ctx: IntegrationContext;

  beforeAll(async () => {
    ctx = await createTestApp();
  });

  afterAll(async () => {
    await ctx.app.close();
  });

  describe('TC-SEG-CI-A1-01: rechazo de payload con campos inválidos', () => {
    it('rechaza POST /users/create sin el campo email (400) y no persiste', async () => {
      const before = await ctx.prisma.users.count();

      const res = await request(ctx.app.getHttpServer())
        .post('/users/create')
        .send({
          username: 'sin-email-user',
          password: 'validPass123',
          rolId: 2,
        });

      const after = await ctx.prisma.users.count();

      expect(res.status).toBe(400);
      expect(after).toBe(before);
    });

    it('rechaza POST /users/create con body vacío {} (400) y no persiste', async () => {
      const before = await ctx.prisma.users.count();

      const res = await request(ctx.app.getHttpServer())
        .post('/users/create')
        .send({});

      const after = await ctx.prisma.users.count();

      expect(res.status).toBe(400);
      expect(after).toBe(before);
    });

    it('rechaza POST /users/create con type mismatch en rolId (string en vez de number) (400) y no persiste', async () => {
      const before = await ctx.prisma.users.count();

      const res = await request(ctx.app.getHttpServer())
        .post('/users/create')
        .send({
          username: 'type-mismatch-user',
          email: 'type-mismatch@integration.test',
          password: 'validPass123',
          rolId: 'dos',
        });

      const after = await ctx.prisma.users.count();

      expect(res.status).toBe(400);
      expect(after).toBe(before);
    });
  });

  describe('TC-SEG-CI-A1-02: rechazo de inyección SQL vía campo email', () => {
    // Si el POST devuelve 201 por accidente, se limpia aquí para no ensuciar la BD compartida.
    const injectedEmail = "' OR '1'='1";

    afterAll(async () => {
      await ctx.prisma.users.deleteMany({ where: { email: injectedEmail } });
    });

    it('rechaza POST /users/create con email de inyección SQL (400)', async () => {
      const res = await request(ctx.app.getHttpServer())
        .post('/users/create')
        .send({
          username: 'sqli-user',
          email: injectedEmail,
          password: 'validPass123',
          rolId: 2,
        });

      // Criterio de seguridad correcto: el payload de inyección debe ser rechazado.
      expect(res.status).toBe(400);
    });
  });
});
