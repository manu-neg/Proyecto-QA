import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { createTestApp, uniqueEmail, IntegrationContext } from './helpers/bootstrap';

/**
 * Caso de Integración especificado en EEP-SEG-2026-001 v1.3 §4.1,
 * implementado como código real bajo EEP-SEG-2026-001 v1.4 (caja gris).
 *
 * TC-SEG-CI-A3-01: UsersService <-> bcrypt <-> Prisma/BD.
 * Verifica sobre la fila REAL de la BD que la contraseña quedó hasheada con
 * bcrypt (roundsOfHashing=10, src/users/users.service.ts) y que la respuesta
 * HTTP no expone el campo password (UserEntity @Exclude()).
 */
describe('Integración: UsersService <-> bcrypt <-> Prisma (TC-SEG-CI-A3-01)', () => {
  let ctx: IntegrationContext;
  const email = uniqueEmail('hashing');
  const plainPassword = 'SuperSecret123';

  beforeAll(async () => {
    ctx = await createTestApp();
  });

  afterAll(async () => {
    await ctx.prisma.users.deleteMany({ where: { email } });
    await ctx.app.close();
  });

  it('crea el usuario (201), no expone password en la respuesta, y persiste el hash bcrypt en BD', async () => {
    const res = await request(ctx.app.getHttpServer())
      .post('/users/create')
      .send({
        username: 'hashing-user',
        email,
        password: plainPassword,
        rolId: 2,
      });

    expect(res.status).toBe(201);
    expect(res.body).not.toHaveProperty('password');

    const stored = await ctx.prisma.users.findUnique({ where: { email } });

    expect(stored).not.toBeNull();
    expect(stored!.password).not.toBe(plainPassword);
    expect(stored!.password).toMatch(/^\$2[aby]\$/);
    expect(stored!.password.startsWith('$2b$10$')).toBe(true);

    const matches = await bcrypt.compare(plainPassword, stored!.password);
    expect(matches).toBe(true);
  });
});
