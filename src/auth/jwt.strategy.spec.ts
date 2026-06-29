import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from 'src/users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import { jwtSecret } from './auth.module';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UsersService, useValue: { findOne: jest.fn() } },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    usersService = module.get<UsersService>(UsersService);
  });

  // TC-SEG-AA-CTR-001
  it('debe retornar el usuario si el payload JWT es válido', async () => {
    const mockUser = { id: 1, email: 'test@test.com' };
    jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser as any);
    const result = await strategy.validate({ userId: 1 });
    expect(result).toEqual(mockUser);
  });

  // TC-SEG-AA-CTR-002
  it('debe lanzar UnauthorizedException si el userId no corresponde a ningún usuario', async () => {
    jest.spyOn(usersService, 'findOne').mockResolvedValue(null);
    await expect(strategy.validate({ userId: 999 })).rejects.toThrow(UnauthorizedException);
  });

  // TC-SEG-AA-CTR-003 — REGRESIÓN INTENCIONAL, debe FALLAR hasta que se corrija WT-001
  it('el secreto JWT no debe ser un literal hardcodeado en el código fuente', () => {
    // jwtSecret se importa como string literal desde auth.module.ts.
    // Esta prueba documenta la vulnerabilidad: se espera que falle hasta
    // que jwtSecret venga de process.env.JWT_SECRET.
    const isFromEnv = jwtSecret === process.env.JWT_SECRET;
    expect(isFromEnv).toBe(true);
  });
});
