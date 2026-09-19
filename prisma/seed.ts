import { PrismaClient } from "@prisma/client";
import {
  initialAreas,
  initialBranches,
  initialCollections,
  initialCustomers,
  initialExpenses,
  initialLoans,
  initialProductFinanceOrders,
  initialProducts,
  initialRoutes,
  initialUsers,
  initialAttendance,
} from "../src/lib/mockData";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding FinTrack database DD...");

  // 1. Branches
  for (const b of initialBranches) {
    await prisma.branch.upsert({
      where: { branchId: b.id },
      update: {},
      create: { branchId: b.id, code: b.code, name: b.name, city: b.city, state: b.state, phone: b.phone },
    });
  }
  console.log("✓ Branches seeded");

  // 2. Users
  for (const u of initialUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        userId: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role as any,
        status: u.status,
        recoveryEfficiency: u.recoveryEfficiency || 90,
        todayTarget: u.todayTarget || 0,
        todayCollected: u.todayCollected || 0,
        attendanceStatus: (u.attendanceStatus || "PRESENT") as any,
      },
    });
  }
  console.log("✓ Users seeded");

  // 3. Areas
  for (const a of initialAreas) {
    await prisma.area.upsert({
      where: { code: a.code },
      update: {},
      create: {
        areaId: a.id,
        name: a.name,
        code: a.code,
        branchId: a.branchId,
        description: a.description,
        totalCustomers: a.totalCustomers,
        activeLoansCount: a.activeLoansCount,
        totalOutstanding: a.totalOutstanding,
      },
    });
  }
  console.log("✓ Areas seeded");

  // 4. Routes
  for (const r of initialRoutes) {
    await prisma.route.upsert({
      where: { code: r.code },
      update: {},
      create: {
        routeId: r.id,
        name: r.name,
        code: r.code,
        areaId: r.areaId,
        assignedAgentId: r.assignedAgentId,
        collectionFrequency: r.collectionFrequency,
        totalCustomers: r.totalCustomers,
        todayTarget: r.todayTarget,
        todayCollected: r.todayCollected,
        status: r.status,
      },
    });
  }
  console.log("✓ Routes seeded");

  // 5. Customers
  for (const c of initialCustomers) {
    await prisma.customer.upsert({
      where: { customerCode: c.customerCode },
      update: {},
      create: {
        customerCode: c.customerCode,
        name: c.name,
        mobileNumber: c.mobileNumber,
        aadhaarNumber: c.aadhaarNumber,
        address: c.address,
        areaId: c.areaId,
        routeId: c.routeId,
        occupation: c.occupation,
        monthlyIncome: c.monthlyIncome,
        referenceName: c.referenceName,
        referenceContact: c.referenceContact,
        status: c.status as any,
        creditScore: c.creditScore,
        joinDate: c.joinDate,
        totalLoans: c.totalLoans,
        activeLoanAmount: c.activeLoanAmount,
        totalOutstanding: c.totalOutstanding,
      },
    });
  }
  console.log("✓ Customers seeded");

  // 6. Products
  for (const p of initialProducts) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        sku: p.sku,
        name: p.name,
        category: p.category as any,
        brand: p.brand,
        productCost: p.productCost,
        sellingPrice: p.sellingPrice,
        stockQuantity: p.stockQuantity,
        standardDownPayment: p.standardDownPayment,
        standardTenureMonths: p.standardTenureMonths,
        status: p.status,
      },
    });
  }
  console.log("✓ Products seeded");

  // 7. Loans
  for (const l of initialLoans) {
    await prisma.loan.upsert({
      where: { loanNumber: l.loanNumber },
      update: {},
      create: {
        loanNumber: l.loanNumber,
        customerId: l.customerCode,
        routeId: l.routeId,
        agentId: l.agentId,
        loanType: l.loanType as any,
        principalAmount: l.principalAmount,
        interestRatePercentage: l.interestRatePercentage,
        totalInterestAmount: l.totalInterestAmount,
        totalRepayableAmount: l.totalRepayableAmount,
        installmentAmount: l.installmentAmount,
        durationUnits: l.durationUnits,
        disbursementDate: l.disbursementDate,
        startDate: l.startDate,
        endDate: l.endDate,
        totalPaidAmount: l.totalPaidAmount,
        outstandingBalance: l.outstandingBalance,
        nextDueDate: l.nextDueDate,
        status: l.status as any,
        remarks: l.remarks,
        productName: l.productName,
        productId: l.productId,
      },
    });
  }
  console.log("✓ Loans seeded");

  // 8. Collections
  for (const col of initialCollections) {
    await prisma.collection.upsert({
      where: { receiptNumber: col.receiptNumber },
      update: {},
      create: {
        receiptNumber: col.receiptNumber,
        customerId: col.customerCode,
        loanId: col.loanNumber,
        agentId: col.agentId,
        amount: col.amount,
        paymentMethod: col.paymentMethod as any,
        upiTransactionId: col.upiTransactionId,
        collectionDate: col.collectionDate,
        time: col.time,
        areaName: col.areaName,
        routeName: col.routeName,
        installmentNumber: col.installmentNumber,
        balanceAfterPayment: col.balanceAfterPayment,
        remarks: col.remarks,
      },
    });
  }
  console.log("✓ Collections seeded");

  // 9. Expenses
  for (const exp of initialExpenses) {
    await prisma.expense.upsert({
      where: { voucherNumber: exp.voucherNumber },
      update: {},
      create: {
        voucherNumber: exp.voucherNumber,
        category: exp.category,
        title: exp.title,
        amount: exp.amount,
        date: exp.date,
        paidTo: exp.paidTo,
        paymentMethod: exp.paymentMethod as any,
        approvedBy: exp.approvedBy,
        notes: exp.notes,
      },
    });
  }
  console.log("✓ Expenses seeded");

  console.log("🎉 All tables successfully migrated and seeded in database DD!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
