import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is required to run the seed script.');
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const demoUsers = [
  {
    email: 'admin@loka.test',
    name: 'Loka Admin',
    password: 'Admin12345',
    role: 'ADMIN' as const,
  },
  {
    email: 'user@loka.test',
    name: 'Demo User',
    password: 'User12345',
    role: 'USER' as const,
  },
];

const demoRooms = [
  {
    name: 'Studio A',
    capacity: 6,
    pricePerHour: 75000,
    facilities: ['TV', 'Whiteboard', 'AC'],
  },
  {
    name: 'Meeting Room',
    capacity: 12,
    pricePerHour: 120000,
    facilities: ['Projector', 'Video call'],
  },
  {
    name: 'Rooftop Deck',
    capacity: 20,
    pricePerHour: 150000,
    facilities: ['Open air', 'Power outlets'],
  },
];

async function main() {
  for (const user of demoUsers) {
    const passwordHash = await bcrypt.hash(user.password, 10);

    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role },
      create: {
        email: user.email,
        name: user.name,
        passwordHash,
        role: user.role,
      },
    });

    console.log(`user   ${user.email} (${user.role})`);
  }

  for (const room of demoRooms) {
    await prisma.room.upsert({
      where: { name: room.name },
      update: {
        capacity: room.capacity,
        pricePerHour: room.pricePerHour,
        facilities: room.facilities,
        isActive: true,
      },
      create: room,
    });

    console.log(`room   ${room.name}`);
  }

  await prisma.setting.upsert({
    where: { id: 1 },
    update: { openHour: 9, closeHour: 21, timezone: 'Asia/Jakarta' },
    create: { id: 1, openHour: 9, closeHour: 21, timezone: 'Asia/Jakarta' },
  });

  console.log('setting 09:00-21:00 Asia/Jakarta');
  console.log('\nSeed complete.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
