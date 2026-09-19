const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function showAll() {
  const users = await prisma.user.findMany();
  console.log(JSON.stringify(users, null, 2));
}

showAll().finally(() => prisma.$disconnect());
