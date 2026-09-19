const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateAdminPin() {
  console.log("Updating Admin USR-01 PIN to 1002...");
  const admin = await prisma.user.update({
    where: { userId: "USR-01" },
    data: {
      pin: "1002",
      role: "ADMIN",
    }
  });

  console.log("Updated Admin Record in PostgreSQL:");
  console.log(`- ID: ${admin.userId}, Name: ${admin.name}, Role: ${admin.role}, PIN: ${admin.pin}, LoginId: ${admin.loginId}`);
}

updateAdminPin().finally(() => prisma.$disconnect());
