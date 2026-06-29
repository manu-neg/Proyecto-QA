import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: { users: { create: jest.fn(), update: jest.fn() } },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  // TC-SEG-CI-DAT-001
  it('debe invocar bcrypt.hash antes de crear el usuario', async () => {
    const hashSpy = jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashed') as any);
    jest.spyOn(prisma.users, 'create').mockResolvedValue({} as any);
    await service.create({ username: 'x', email: 'x@x.com', password: '123456', rolId: 2 });
    expect(hashSpy).toHaveBeenCalledWith('123456', 10);
  });

  // TC-SEG-CI-DAT-002
  it('roundsOfHashing debe ser >= 10', () => {
    const { roundsOfHashing } = require('./users.service');
    expect(roundsOfHashing).toBeGreaterThanOrEqual(10);
  });

  // TC-SEG-CI-DAT-003
  it('debe invocar bcrypt.hash en update() solo si se provee password', async () => {
    const hashSpy = jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashed') as any);
    jest.spyOn(prisma.users, 'update').mockResolvedValue({} as any);
    await service.update(1, { password: 'newpass123' });
    expect(hashSpy).toHaveBeenCalled();
  });

  it('NO debe invocar bcrypt.hash en update() si no se provee password', async () => {
    const hashSpy = jest.spyOn(bcrypt, 'hash');
    jest.spyOn(prisma.users, 'update').mockResolvedValue({} as any);
    await service.update(1, { username: 'nuevoNombre' });
    expect(hashSpy).not.toHaveBeenCalled();
  });

  // TC-SEG-CI-DAT-004 — REGRESIÓN INTENCIONAL, debe FALLAR hasta que se corrija WT-013
  it('create() NO debe aceptar un rolId arbitrario sin validación', async () => {
    jest.spyOn(prisma.users, 'create').mockResolvedValue({} as any);
    // Documenta la vulnerabilidad: hoy no existe ninguna validación de rolId
    // contra el rol del solicitante. Se espera que esto falle hasta que se
    // implemente una restricción server-side.
    const createDto = { username: 'attacker', email: 'a@a.com', password: '123456', rolId: 1 };
    await service.create(createDto as any);
    // No hay manera de "pasar" esta prueba sin que el servicio rechace rolId=1
    // viniendo de un registro público — se deja como false a propósito.
    expect(false).toBe(true);
  });
});
