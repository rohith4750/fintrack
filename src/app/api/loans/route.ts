import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId");
    const routeId = searchParams.get("routeId");

    const whereClause: any = {};
    if (agentId && agentId !== "ALL") whereClause.agentId = agentId;
    if (routeId && routeId !== "ALL") whereClause.routeId = routeId;

    const loans = await prisma.loan.findMany({
      where: whereClause,
      include: {
        customer: true,
        route: true,
        agent: true,
        installments: {
          orderBy: { installmentNumber: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, loans });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Resolve Customer by id or customerCode
    const rawCustomerId = body.customerCode || body.customerId;
    let customer = await prisma.customer.findFirst({
      where: {
        OR: [{ id: rawCustomerId }, { customerCode: rawCustomerId }],
      },
    });

    if (!customer) {
      // Create customer on the fly if needed
      let area = await prisma.area.findFirst();
      let route = await prisma.route.findFirst();
      if (!area) {
        const branch = await prisma.branch.upsert({
          where: { branchId: "BR-01" },
          update: {},
          create: {
            branchId: "BR-01",
            code: "BR-RJY",
            name: "Rajahmundry Central Branch",
            city: "Rajahmundry",
            state: "Andhra Pradesh",
            phone: "+91 883 245 6789",
          },
        });
        area = await prisma.area.create({
          data: {
            areaId: "AREA-01",
            name: "Rajahmundry Urban",
            code: "RJY",
            branchId: branch.branchId,
          },
        });
      }
      if (!route) {
        route = await prisma.route.create({
          data: {
            routeId: "RT-01",
            name: "Main Road Beat",
            code: "RT-RJY-01",
            areaId: area.areaId,
          },
        });
      }

      customer = await prisma.customer.create({
        data: {
          customerCode: rawCustomerId || `CUST-RJY-${Date.now().toString().slice(-4)}`,
          name: body.customerName || "Borrower",
          mobileNumber: body.phone || "+91 98480 12345",
          areaId: route.areaId || area.areaId,
          routeId: route.routeId,
        },
      });
    }

    // 2. Resolve Route
    let route = await prisma.route.findFirst({
      where: {
        OR: [{ id: body.routeId || customer.routeId }, { routeId: body.routeId || customer.routeId }],
      },
    });
    if (!route) {
      route = await prisma.route.findFirst() || await prisma.route.create({
        data: {
          routeId: "RT-01",
          name: "Main Road Beat",
          code: "RT-RJY-01",
          areaId: customer.areaId,
        },
      });
    }

    // 3. Resolve Agent
    let agent = null;
    if (body.agentId) {
      agent = await prisma.user.findFirst({
        where: {
          OR: [{ id: body.agentId }, { userId: body.agentId }],
        },
      });
    }

    const count = await prisma.loan.count();
    const loanNumber = body.loanNumber || `LN-2026-${String(count + 101).padStart(4, "0")}`;

    const principal = Number(body.principalAmount) || 20000;
    const interestRate = Number(body.interestRatePercentage || body.interestRate || 14);
    const totalInterest = Number(body.totalInterestAmount || (principal * (interestRate / 100)));
    const totalRepayable = Number(body.totalRepayableAmount || (principal + totalInterest));
    const durationUnits = Number(body.durationUnits) || 20;
    const installmentAmount = Number(body.installmentAmount || (totalRepayable / durationUnits));

    const loan = await prisma.loan.create({
      data: {
        loanNumber,
        customerId: customer.customerCode,
        routeId: route.routeId,
        agentId: agent ? agent.userId : null,
        loanType: (body.loanType || "WEEKLY") as any,
        principalAmount: principal,
        interestRatePercentage: interestRate,
        totalInterestAmount: totalInterest,
        totalRepayableAmount: totalRepayable,
        installmentAmount: installmentAmount,
        durationUnits: durationUnits,
        disbursementDate: body.disbursementDate || "2026-09-20",
        startDate: body.startDate || "2026-09-27",
        endDate: body.endDate || "2027-02-15",
        totalPaidAmount: 0,
        outstandingBalance: totalRepayable,
        nextDueDate: body.nextDueDate || "2026-09-27",
        status: (body.status || "ACTIVE") as any,
        remarks: body.remarks || null,
        productName: body.productName || null,
        productId: body.productId || null,
      },
      include: {
        customer: true,
        route: true,
        agent: true,
      },
    });

    try {
      await prisma.customer.update({
        where: { customerCode: customer.customerCode },
        data: {
          totalLoans: { increment: 1 },
          activeLoanAmount: { increment: principal },
          totalOutstanding: { increment: totalRepayable },
        },
      });
    } catch (e) {}

    return NextResponse.json({ success: true, loan });
  } catch (error: any) {
    console.error("Loan POST error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const body = await req.json();

    if (id) {
      await prisma.loan.updateMany({
        where: { OR: [{ id }, { loanNumber: id }] },
        data: {
          ...(body.status ? { status: body.status } : {}),
          ...(body.totalPaidAmount !== undefined ? { totalPaidAmount: Number(body.totalPaidAmount) } : {}),
          ...(body.outstandingBalance !== undefined ? { outstandingBalance: Number(body.outstandingBalance) } : {}),
        },
      });
    }

    return NextResponse.json({ success: true, updated: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      await prisma.loan.deleteMany({
        where: { OR: [{ id }, { loanNumber: id }] },
      });
    }

    return NextResponse.json({ success: true, deleted: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

