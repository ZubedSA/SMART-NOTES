const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {
      password: hash,
      role: 'Admin'
    },
    create: {
      email: 'admin@gmail.com',
      name: 'Administrator',
      password: hash,
      role: 'Admin'
    }
  });
  console.log('Admin user ready:', user.email);
}

main().catch(console.error).finally(() => prisma.$disconnect());
