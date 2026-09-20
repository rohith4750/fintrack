import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
  initialNotifications
} from "@/lib/mockData";

export async function POST() {
  try {
    // 2. Seed Users / Agents
    for (const u of initialUsers) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {
          name: u.name,
          phone: u.phone,
          role: u.role as any,
          status: u.status,
          pin: u.pin || "1234",
          loginId: u.loginId,
          recoveryEfficiency: u.recoveryEfficiency || 90,
          todayCollected: u.todayCollected || 0,
          attendanceStatus: (u.attendanceStatus || "PRESENT") as any,
          maxDailyCashLimit: u.permissions?.maxDailyCashLimit || 75000,
          canCollectCash: u.permissions?.canCollectCash ?? true,
          canCollectUPI: u.permissions?.canCollectUPI ?? true,
          canEditCustomer: u.permissions?.canEditCustomer ?? (u.role === "ADMIN"),
          canDisburseLoan: u.permissions?.canDisburseLoan ?? (u.role === "ADMIN"),
        },
        create: {
          userId: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role as any,
          status: u.status,
          pin: u.pin || "1234",
          loginId: u.loginId,
          recoveryEfficiency: u.recoveryEfficiency || 90,
          todayCollected: u.todayCollected || 0,
          attendanceStatus: (u.attendanceStatus || "PRESENT") as any,
          maxDailyCashLimit: u.permissions?.maxDailyCashLimit || 75000,
          canCollectCash: u.permissions?.canCollectCash ?? true,
          canCollectUPI: u.permissions?.canCollectUPI ?? true,
          canEditCustomer: u.permissions?.canEditCustomer ?? (u.role === "ADMIN"),
          canDisburseLoan: u.permissions?.canDisburseLoan ?? (u.role === "ADMIN"),
        },
      });
    }

    // 4. Seed Routes
    for (const r of initialRoutes) {
      await prisma.route.upsert({
        where: { code: r.code },
        update: {
          name: r.name,
          areaName: "Rajahmundry Urban",
          assignedAgentId: r.assignedAgentId,
          collectionFrequency: r.collectionFrequency,
          totalCustomers: r.totalCustomers,
          todayCollected: r.todayCollected,
          status: r.status,
        },
        create: {
          routeId: r.id,
          name: r.name,
          code: r.code,
          areaName: "Rajahmundry Urban",
          assignedAgentId: r.assignedAgentId,
          collectionFrequency: r.collectionFrequency,
          totalCustomers: r.totalCustomers,
          todayCollected: r.todayCollected,
          status: r.status,
        },
      });
    }

    // 5. Seed Customers
    for (const c of initialCustomers) {
      await prisma.customer.upsert({
        where: { customerCode: c.customerCode },
        update: {
          name: c.name,
          mobileNumber: c.mobileNumber,
          aadhaarNumber: c.aadhaarNumber,
          address: c.address,
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
        create: {
          customerCode: c.customerCode,
          name: c.name,
          mobileNumber: c.mobileNumber,
          aadhaarNumber: c.aadhaarNumber,
          address: c.address,
          areaName: "Rajahmundry Urban",
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

    // 6. Seed Products
    for (const p of initialProducts) {
      await prisma.product.upsert({
        where: { sku: p.sku },
        update: {
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

    // 7. Seed Loans
    for (const l of initialLoans) {
      await prisma.loan.upsert({
        where: { loanNumber: l.loanNumber },
        update: {
          totalPaidAmount: l.totalPaidAmount,
          outstandingBalance: l.outstandingBalance,
          status: l.status as any,
          nextDueDate: l.nextDueDate,
        },
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

    // 8. Seed Collections
    for (const col of initialCollections) {
      await prisma.collection.upsert({
        where: { receiptNumber: col.receiptNumber },
        update: {
          amount: col.amount,
          balanceAfterPayment: col.balanceAfterPayment,
        },
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

    // 9. Seed Expenses
    for (const exp of initialExpenses) {
      await prisma.expense.upsert({
        where: { voucherNumber: exp.voucherNumber },
        update: { amount: exp.amount },
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

    return NextResponse.json({
      success: true,
      message: "Database DD successfully seeded with regional finance records!",
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
