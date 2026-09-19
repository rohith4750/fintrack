const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- Checking existing users ---");
  const users = await prisma.user.findMany();
  console.log("Count:", users.length);
  users.forEach(u => {
    console.log(`- [${u.role}] ID: ${u.userId}, Name: ${u.name}, Phone: ${u.phone}, PIN: ${u.pin}, LoginId: ${u.loginId}`);
  });

  // Ensure Admin user exists with role: ADMIN, pin: 9999
  console.log("\n--- Upserting Admin user ---");
  const admin = await prisma.user.upsert({
    where: { userId: "USR-01" },
    update: {
      role: "ADMIN",
      pin: "9999",
      loginId: "ADMIN-01",
      name: "Rajesh Kumar (Admin)",
      email: "admin@fintrack.in",
      phone: "+91 98480 12345",
      status: "ACTIVE",
      maxDailyCashLimit: 500000,
      canCollectCash: true,
      canCollectUPI: true,
      canEditCustomer: true,
      canDisburseLoan: true,
    },
    create: {
      userId: "USR-01",
      name: "Rajesh Kumar (Admin)",
      email: "admin@fintrack.in",
      phone: "+91 98480 12345",
      role: "ADMIN",
      status: "ACTIVE",
      pin: "9999",
      loginId: "ADMIN-01",
      recoveryEfficiency: 98.0,
      todayTarget: 150000,
      todayCollected: 94500,
      maxDailyCashLimit: 500000,
      attendanceStatus: "PRESENT",
      canCollectCash: true,
      canCollectUPI: true,
      canEditCustomer: true,
      canDisburseLoan: true,
    }
  });

  console.log("Admin user in DB:", admin);

  console.log("\n--- Final User List in DB ---");
  const updatedUsers = await prisma.user.findMany();
  updatedUsers.forEach(u => {
    console.log(`- [${u.role}] ID: ${u.userId}, Name: ${u.name}, Phone: ${u.phone}, PIN: ${u.pin}, LoginId: ${u.loginId}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
