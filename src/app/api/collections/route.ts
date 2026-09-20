import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const collections = await prisma.collection.findMany({
      include: {
        customer: true,
        loan: true,
        agent: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, collections });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const receiptNumber = body.receiptNumber || `RCP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const loanKey = body.loanNumber || body.loanId;
    const loan = await prisma.loan.findFirst({
      where: {
        OR: [{ id: loanKey }, { loanNumber: loanKey }],
      },
    });

    if (loan && (loan.status === "CLOSED" || loan.outstandingBalance <= 0)) {
      return NextResponse.json(
        {
          success: false,
          error: "This loan is already fully repaid and closed. No further collections are permitted.",
        },
        { status: 400 }
      );
    }

    const amount = Number(body.amount);

    if (loan && amount > loan.outstandingBalance) {
      return NextResponse.json(
        {
          success: false,
          error: `Payment amount (₹${amount}) exceeds remaining outstanding balance (₹${loan.outstandingBalance}).`,
        },
        { status: 400 }
      );
    }

    const balanceAfterPayment = loan ? Math.max(0, loan.outstandingBalance - amount) : 0;

    const collection = await prisma.collection.create({
      data: {
        receiptNumber,
        customerId: body.customerCode || body.customerId,
        loanId: body.loanNumber || body.loanId,
        agentId: body.agentId,
        amount,
        paymentMethod: body.paymentMethod || "CASH",
        upiTransactionId: body.upiTransactionId,
        collectionDate: body.collectionDate || "2026-09-20",
        time: body.time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        areaName: body.areaName,
        routeName: body.routeName,
        installmentNumber: body.installmentNumber,
        balanceAfterPayment,
        remarks: body.remarks,
      },
    });

    // Update Loan balance & status
    if (loan) {
      const newPaid = loan.totalPaidAmount + amount;
      await prisma.loan.update({
        where: { id: loan.id },
        data: {
          totalPaidAmount: newPaid,
          outstandingBalance: balanceAfterPayment,
          status: balanceAfterPayment === 0 ? "CLOSED" : "ACTIVE",
        },
      });
    }

    // Update Customer outstanding
    if (body.customerCode || body.customerId) {
      await prisma.customer.update({
        where: { customerCode: body.customerCode || body.customerId },
        data: {
          totalOutstanding: { decrement: amount },
        },
      });
    }

    return NextResponse.json({ success: true, collection });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
