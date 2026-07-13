import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // 1. Buat password hash untuk 'admin123'
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // 2. Buat atau perbarui user admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {
      password: hashedPassword,
      role: 'Admin',
      name: 'Administrator'
    },
    create: {
      email: 'admin@gmail.com',
      name: 'Administrator',
      password: hashedPassword,
      role: 'Admin'
    }
  });

  console.log('Admin user seeded successfully!');
  console.log('Email:', admin.email);
  console.log('Password: admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
