import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId");

    const whereClause: any = {};
    if (agentId && agentId !== "ALL") whereClause.assignedAgentId = agentId;

    const routes = await prisma.route.findMany({
      where: whereClause,
      include: {
        area: true,
        assignedAgent: true,
        customers: true,
      },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ success: true, routes });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.code) {
      return NextResponse.json(
        { success: false, error: "Route name and code are required." },
        { status: 400 }
      );
    }

    const routeId = body.routeId || `RT-${Date.now().toString().slice(-4)}`;
    const areaId = body.areaId || "AREA-01";

    // Ensure default branch and area exist to prevent foreign key errors
    let area = await prisma.area.findUnique({ where: { areaId } });
    if (!area) {
      const branchId = "BR-01";
      await prisma.branch.upsert({
        where: { branchId },
        update: {},
        create: {
          branchId,
          code: "BR-RJY",
          name: "FinTrack Central Branch",
          city: "Rajahmundry",
          state: "Andhra Pradesh",
          phone: "+91 98480 12345",
        },
      });

      area = await prisma.area.upsert({
        where: { areaId },
        update: {},
        create: {
          areaId,
          name: body.areaName || "Rajahmundry Urban",
          code: "RJY-URB",
          description: "Urban beat operational zone",
          branchId,
        },
      });
    }

    // Verify assigned agent if provided
    let validAgentId: string | null = null;
    if (body.assignedAgentId && body.assignedAgentId !== "UNASSIGNED") {
      const agentUser = await prisma.user.findFirst({
        where: { OR: [{ userId: body.assignedAgentId }, { id: body.assignedAgentId }] },
      });
      if (agentUser) {
        validAgentId = agentUser.userId;
      }
    }

    const route = await prisma.route.create({
      data: {
        routeId,
        name: body.name,
        code: body.code.toUpperCase().trim(),
        areaId: area.areaId,
        assignedAgentId: validAgentId,
        collectionFrequency: body.collectionFrequency || "WEEKLY",
        todayTarget: Number(body.todayTarget) || 25000,
        status: "ACTIVE",
      },
      include: {
        area: true,
        assignedAgent: true,
        customers: true,
      },
    });

    return NextResponse.json({ success: true, route });
  } catch (error: any) {
    console.error("Route creation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const body = await req.json();

    if (id) {
      await prisma.route.updateMany({
        where: { OR: [{ id }, { routeId: id }] },
        data: {
          ...(body.name ? { name: body.name } : {}),
          ...(body.code ? { code: body.code.toUpperCase() } : {}),
          ...(body.assignedAgentId ? { assignedAgentId: body.assignedAgentId } : {}),
          ...(body.todayTarget !== undefined ? { todayTarget: Number(body.todayTarget) } : {}),
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
      await prisma.route.deleteMany({
        where: { OR: [{ id }, { routeId: id }] },
      });
    }

    return NextResponse.json({ success: true, deleted: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
