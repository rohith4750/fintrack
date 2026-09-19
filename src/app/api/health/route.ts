import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const customerCount = await prisma.customer.count();
    const loanCount = await prisma.loan.count();
    const collectionCount = await prisma.collection.count();

    return NextResponse.json({
      status: "healthy",
      database: "DD",
      connected: true,
      stats: {
        customers: customerCount,
        loans: loanCount,
        collections: collectionCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "unhealthy",
        database: "DD",
        connected: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
