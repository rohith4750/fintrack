const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding default branch and area...');
  
  const branch = await prisma.branch.upsert({
    where: { branchId: 'BR-01' },
    update: {},
    create: {
      branchId: 'BR-01',
      code: 'BR-RJY',
      name: 'FinTrack Central Branch',
      city: 'Rajahmundry',
      state: 'Andhra Pradesh',
      phone: '+91 98480 12345',
    },
  });
  console.log('✅ Branch ready:', branch.branchId, branch.name);

  const area = await prisma.area.upsert({
    where: { areaId: 'AREA-01' },
    update: {},
    create: {
      areaId: 'AREA-01',
      name: 'Rajahmundry Urban',
      code: 'RJY-URB',
      description: 'Urban beat operational zone',
      branchId: 'BR-01',
    },
  });
  console.log('✅ Area ready:', area.areaId, area.name);

  const areas = await prisma.area.findMany();
  console.log('Total Areas in DB:', areas.length);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
