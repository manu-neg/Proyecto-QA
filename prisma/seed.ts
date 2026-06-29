import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// initialize the Prisma Client
const prisma = new PrismaClient();

const roundsOfHashing = 10;

async function main() {
  // create two dummy users
  const passwordSabin = await bcrypt.hash('123456', roundsOfHashing);

  const rol1 = await prisma.roles.create({
        data: {
            name: 'admin'
        }
  })

  const rol2 = await prisma.roles.create({
        data: {
            name: 'client'
        }
    })
  const user1 = await prisma.users.upsert({
    where: { email: 'sabin@adams.com' },
    update: {
      password: passwordSabin,
    },
    create: {
      email: 'sabin@adams.com',
      username: 'Sabin Adams',
      password: passwordSabin,
      rolId: 1
    },
  });
  const user2 = await prisma.users.upsert({
    where: { email: 'aharon@guedez.com' },
    update: {
      password: passwordSabin,
    },
    create: {
      email: 'aharon@guedez.com',
      username: 'aharon',
      password: passwordSabin,
      rolId: 2
    },
  });

  const user3 = await prisma.users.upsert({
    where: { email: 'josue@guedez.com' },
    update: {
      password: passwordSabin,
    },
    create: {
      email: 'josue@guedez.com',
      username: 'josue',
      password: passwordSabin,
      rolId: 2
    },
  });

  const newPage = await prisma.catalogo.create({
    data: {
      titulo: 'Airbnb', // Cambia esto por el título deseado
      description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente', // Cambia esto por el contenido deseado
      url: 'https://www.airbnb.co.ve', // Asumiendo que tienes un ID de autor, ajusta según sea necesario
    },
  });

  const newPage1 = await prisma.catalogo.create({
    data: {
      titulo: 'amazon', // Cambia esto por el título deseado
      description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente', // Cambia esto por el contenido deseado
      url: 'https://www.amazon.com/-/es/', // Asumiendo que tienes un ID de autor, ajusta según sea necesario
    },
  });

  // Órdenes para pruebas de IDOR (TC-SEG-AA-A2-01, TC-SEG-AA-A2-02)
  const orderA1 = await prisma.orders.create({
    data: {
      title: 'Orden de aharon 1',
      description: 'Orden de prueba IDOR',
      typeOrder: 'standard',
      clientId: user2.id, // aharon
    },
  });
  const orderA2 = await prisma.orders.create({
    data: {
      title: 'Orden de aharon 2',
      description: 'Orden de prueba IDOR',
      typeOrder: 'standard',
      clientId: user2.id, // aharon
    },
  });
  const orderB1 = await prisma.orders.create({
    data: {
      title: 'Orden de josue 1',
      description: 'Orden de prueba IDOR',
      typeOrder: 'standard',
      clientId: user3.id, // josue
    },
  });
  const orderB2 = await prisma.orders.create({
    data: {
      title: 'Orden de josue 2',
      description: 'Orden de prueba IDOR',
      typeOrder: 'standard',
      clientId: user3.id, // josue
    },
  });

  const msg1 = prisma.chat.upsert({
    where: { id: 1 },
    update: {
      content: 'hola como estas',
    },
    create: {
      content: 'sabin@adams.com',
      clientName: 'aharon'
    },
  });
}

// execute the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close the Prisma Client at the end
    await prisma.$disconnect();
  });