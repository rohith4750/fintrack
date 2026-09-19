import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, expenses });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const count = await prisma.expense.count();
    const voucherNumber = body.voucherNumber || `VCH-2026-${String(count + 50).padStart(3, "0")}`;

    const expense = await prisma.expense.create({
      data: {
        voucherNumber,
        category: body.category || "FUEL",
        title: body.title,
        amount: Number(body.amount),
        date: body.date || "2026-09-20",
        paidTo: body.paidTo || "Staff",
        paymentMethod: body.paymentMethod || "CASH",
        approvedBy: body.approvedBy || "K. Srikanth Naidu",
        notes: body.notes,
      },
    });

    return NextResponse.json({ success: true, expense });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
