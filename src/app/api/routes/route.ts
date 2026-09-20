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
        name: body.name.trim(),
        code: body.code.toUpperCase().trim(),
        areaName: body.areaName?.trim() || "Rajahmundry Urban",
        assignedAgentId: validAgentId,
        collectionFrequency: body.collectionFrequency || "WEEKLY",
        todayTarget: Number(body.todayTarget) || 25000,
        status: "ACTIVE",
      },
      include: {
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
          ...(body.areaName ? { areaName: body.areaName } : {}),
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

