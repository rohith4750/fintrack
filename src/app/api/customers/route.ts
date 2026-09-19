import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        area: true,
        route: true,
        loans: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, customers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Ensure Branch and Area exist
    let area = await prisma.area.findFirst();
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
          description: "Main Commercial Belt",
          branchId: branch.branchId,
        },
      });
    }

    // Ensure Route exists
    let route = null;
    if (body.routeId) {
      route = await prisma.route.findFirst({
        where: { OR: [{ id: body.routeId }, { routeId: body.routeId }, { code: body.routeId }] },
      });
    }
    if (!route) {
      route = await prisma.route.findFirst();
      if (!route) {
        route = await prisma.route.create({
          data: {
            routeId: "RT-01",
            name: "Main Road & Kotipalli Beat",
            code: "RT-RJY-01",
            areaId: area.areaId,
            collectionFrequency: "WEEKLY",
            todayTarget: 25000,
            status: "ACTIVE",
          },
        });
      }
    }

    const count = await prisma.customer.count();
    const areaPrefix = area.code || "RJY";
    const customerCode = body.customerCode || `CUST-${areaPrefix}-${String(count + 101).padStart(3, "0")}`;

    const customerData = {
      customerCode,
      name: body.name || body.fullName || "Unnamed Borrower",
      mobileNumber: body.mobileNumber || body.phone || "+91 98480 00000",
      aadhaarNumber: body.aadhaarNumber || "N/A",
      address: body.address || body.locationAddress || "Rajahmundry",
      areaId: route.areaId || area.areaId,
      routeId: route.routeId,
      occupation: body.occupation || "Self Employed",
      monthlyIncome: Number(body.monthlyIncome) || 30000,
      referenceName: body.referenceName || body.guarantorName || "",
      referenceContact: body.referenceContact || body.guarantorPhone || "",
      status: (body.status || "ACTIVE") as any,
      creditScore: Number(body.creditScore) || 750,
      latitude: body.latitude ? Number(body.latitude) : null,
      longitude: body.longitude ? Number(body.longitude) : null,
      landmark: body.landmark || null,
      locationAddress: body.locationAddress || body.address || null,
    };

    const customer = await prisma.customer.create({
      data: customerData,
      include: {
        area: true,
        route: true,
      },
    });

    return NextResponse.json({ success: true, customer });
  } catch (error: any) {
    console.error("Customer POST error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const body = await req.json();

    if (id) {
      await prisma.customer.updateMany({
        where: { OR: [{ id }, { customerCode: id }] },
        data: {
          ...(body.name || body.fullName ? { name: body.name || body.fullName } : {}),
          ...(body.mobileNumber || body.phone ? { mobileNumber: body.mobileNumber || body.phone } : {}),
          ...(body.address ? { address: body.address } : {}),
          ...(body.guarantorName || body.referenceName ? { referenceName: body.guarantorName || body.referenceName } : {}),
          ...(body.guarantorPhone || body.referenceContact ? { referenceContact: body.guarantorPhone || body.referenceContact } : {}),
          ...(body.latitude !== undefined ? { latitude: body.latitude ? Number(body.latitude) : null } : {}),
          ...(body.longitude !== undefined ? { longitude: body.longitude ? Number(body.longitude) : null } : {}),
          ...(body.landmark !== undefined ? { landmark: body.landmark } : {}),
          ...(body.locationAddress !== undefined ? { locationAddress: body.locationAddress } : {}),
          ...(body.status ? { status: body.status } : {}),
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
      await prisma.customer.deleteMany({
        where: { OR: [{ id }, { customerCode: id }] },
      });
    }
    return NextResponse.json({ success: true, deleted: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

