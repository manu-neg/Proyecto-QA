import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@test.com',
    password: '$2b$10$hashedpasswordvalue',
    rolId: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: { users: { findUnique: jest.fn() } },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('mocked-jwt-token') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  // TC-SEG-AA-SRV-001
  it('debe lanzar NotFoundException si el usuario no existe', async () => {
    jest.spyOn(prisma.users, 'findUnique').mockResolvedValue(null);
    await expect(service.login('noexiste@test.com', '123456')).rejects.toThrow(NotFoundException);
  });

  // TC-SEG-AA-SRV-002
  it('debe lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
    jest.spyOn(prisma.users, 'findUnique').mockResolvedValue(mockUser as any);
    jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));
    await expect(service.login(mockUser.email, 'wrongpass')).rejects.toThrow(UnauthorizedException);
  });

  // TC-SEG-CI-SRV-002
  it('debe invocar bcrypt.compare con la contraseña en texto plano y el hash almacenado', async () => {
    jest.spyOn(prisma.users, 'findUnique').mockResolvedValue(mockUser as any);
    const compareSpy = jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
    await service.login(mockUser.email, '123456');
    expect(compareSpy).toHaveBeenCalledWith('123456', mockUser.password);
  });

  // TC-SEG-AA-SRV-003
  it('debe firmar el JWT con el userId correcto del usuario autenticado', async () => {
    jest.spyOn(prisma.users, 'findUnique').mockResolvedValue(mockUser as any);
    jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
    const signSpy = jest.spyOn(jwtService, 'sign');
    await service.login(mockUser.email, '123456');
    expect(signSpy).toHaveBeenCalledWith({ userId: mockUser.id });
  });

  // TC-SEG-CI-SRV-001 — REGRESIÓN INTENCIONAL, debe FALLAR hasta que se corrija WT-003
  it('el objeto retornado por login() NO debe incluir el campo password', async () => {
    jest.spyOn(prisma.users, 'findUnique').mockResolvedValue(mockUser as any);
    jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
    const result = await service.login(mockUser.email, '123456');
    expect(result.userInfo).not.toHaveProperty('password');
  });
});
