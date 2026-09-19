import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const areas = await prisma.area.findMany({
      include: {
        routes: true,
        customers: true,
      },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ success: true, areas });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const areaId = body.areaId || `AREA-${Date.now().toString().slice(-4)}`;

    const area = await prisma.area.create({
      data: {
        areaId,
        name: body.name,
        code: body.code.toUpperCase(),
        branchId: body.branchId || "BR-01",
        description: body.description,
      },
    });

    return NextResponse.json({ success: true, area });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
