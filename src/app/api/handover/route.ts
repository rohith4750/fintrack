import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const handovers = await prisma.cashHandover.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, handovers });
  } catch (error: any) {
    console.error("GET Handover error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const count = await prisma.cashHandover.count();
    const handoverNumber = body.handoverNumber || `HND-2026-${String(count + 1).padStart(3, "0")}`;

    const handover = await prisma.cashHandover.create({
      data: {
        handoverNumber,
        agentId: body.agentId || "USR-02",
        agentName: body.agentName || "Field Agent",
        date: body.date || new Date().toISOString().split("T")[0],
        time: body.time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        totalCashAmount: Number(body.totalCashAmount) || 0,
        totalUpiAmount: Number(body.totalUpiAmount) || 0,
        totalCollections: Number(body.totalCollections) || 0,
        handedOverTo: body.handedOverTo || "Rajesh Kumar (Admin)",
        denominations: body.denominations || {},
        status: (body.status || "SUBMITTED") as any,
        remarks: body.remarks || body.managerRemarks || "Day-End Field Cash Settlement",
      },
    });

    // Also record system notification for Admin
    try {
      await prisma.systemNotification.create({
        data: {
          title: `Cash Handover: ${handover.agentName}`,
          message: `₹${handover.totalCashAmount.toLocaleString("en-IN")} submitted for verification by ${handover.agentName}.`,
          type: "HANDOVER",
          priority: "HIGH",
        },
      });
    } catch (e) {}

    return NextResponse.json({ success: true, handover });
  } catch (error: any) {
    console.error("POST Handover error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const body = await req.json();

    if (id) {
      await prisma.cashHandover.updateMany({
        where: { OR: [{ id }, { handoverNumber: id }] },
        data: {
          ...(body.status ? { status: body.status } : {}),
          ...(body.verifiedBy ? { verifiedBy: body.verifiedBy } : {}),
          ...(body.remarks ? { remarks: body.remarks } : {}),
        },
      });
    }

    return NextResponse.json({ success: true, updated: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
