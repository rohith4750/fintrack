const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateAdmin() {
  console.log("Updating Admin USR-01 credentials...");
  
  await prisma.user.update({
    where: { userId: "USR-01" },
    data: {
      name: "Rajesh Kumar (Admin)",
      email: "admin@fintrack.in",
      phone: "+91 98480 12345",
      role: "ADMIN",
      status: "ACTIVE",
      loginId: "ADMIN-01",
      pin: "9999",
      password: "adminpassword",
      maxDailyCashLimit: 500000,
      canCollectCash: true,
      canCollectUPI: true,
      canEditCustomer: true,
      canDisburseLoan: true,
      attendanceStatus: "PRESENT",
      recoveryEfficiency: 98.0,
      todayTarget: 150000,
      todayCollected: 94500,
    }
  });

  // Also ensure all other users have non-null password
  await prisma.user.updateMany({
    where: { password: null },
    data: { password: "agentpassword" }
  });

  console.log("Querying Admin directly from PostgreSQL:");
  const admin = await prisma.user.findUnique({
    where: { userId: "USR-01" }
  });
  console.log(admin);
}

updateAdmin().finally(() => prisma.$disconnect());
