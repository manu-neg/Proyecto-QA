import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: {
            orders: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  // TC-SEG-RNR-DAT-002
  it('create() debe persistir la orden con los datos exactos del DTO', async () => {
    const dto = { title: 'Test', description: 'desc', typeOrder: 'standard', clientId: 1 };
    jest.spyOn(prisma.orders, 'create').mockResolvedValue(dto as any);
    await service.create(dto as any);
    expect(prisma.orders.create).toHaveBeenCalledWith({ data: dto });
  });

  // TC-SEG-RNR-DAT-003
  it('remove() debe eliminar la orden por el id correcto', async () => {
    jest.spyOn(prisma.orders, 'delete').mockResolvedValue({} as any);
    await service.remove(5);
    expect(prisma.orders.delete).toHaveBeenCalledWith({ where: { id: 5 } });
  });

  // TC-SEG-RNR-DAT-001 — REGRESIÓN INTENCIONAL, debe FALLAR hasta que se corrija WT-extra/WT-007
  it('findOne() debe retornar un objeto único, no un array', async () => {
    jest.spyOn(prisma.orders, 'findMany').mockResolvedValue([{ id: 1 }] as any);
    const result = await service.findOne(1);
    expect(Array.isArray(result)).toBe(false);
  });

  // TC-SEG-RNR-DAT-004 — REGRESIÓN INTENCIONAL, debe FALLAR hasta que se corrija WT-012
  it('findAll() debe filtrar por usuario autenticado, no devolver todas las órdenes', async () => {
    // Documenta que el método actual no acepta ningún parámetro de usuario.
    // Se espera que falle hasta que findAll() reciba el userId del contexto
    // de autenticación y filtre por él.
    expect(service.findAll.length).toBeGreaterThan(0); // findAll() actual no recibe argumentos
  });
});
