const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgres://eb78e5819986a19df61041f562907f786592f45a9ca29893168864b0737d3a71:sk_lbO7Q7H_DW1EJcMcN-568@pooled.db.prisma.io:5432/postgres?sslmode=require',
    },
  },
});

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fintrack.com' },
    update: {},
    create: {
      userId: 'USR-01',
      name: 'Admin',
      email: 'admin@fintrack.com',
      phone: '+91 98480 00001',
      role: 'ADMIN',
      status: 'ACTIVE',
      loginId: 'admin',
      pin: '1234',
      password: 'admin123',
    },
  });
  console.log('✅ Admin created:', admin.userId, '| Login:', admin.loginId, '| PIN:', admin.pin);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
