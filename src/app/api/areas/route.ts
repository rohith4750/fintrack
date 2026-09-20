import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const routes = await prisma.route.findMany({
      select: {
        areaName: true,
      },
    });

    const uniqueAreaNames = Array.from(
      new Set(routes.map((r) => r.areaName).filter(Boolean))
    );

    const areas = uniqueAreaNames.map((name, idx) => ({
      id: `AREA-${idx + 1}`,
      areaId: `AREA-${idx + 1}`,
      name,
      code: name.slice(0, 3).toUpperCase(),
    }));

    if (areas.length === 0) {
      areas.push({
        id: "AREA-01",
        areaId: "AREA-01",
        name: "Rajahmundry Urban",
        code: "RJY",
      });
    }

    return NextResponse.json({ success: true, areas });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({
      success: true,
      area: {
        id: `AREA-${Date.now().toString().slice(-4)}`,
        name: body.name || "Rajahmundry Urban",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

