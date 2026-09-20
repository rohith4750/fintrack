import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const onlyAgents = searchParams.get("onlyAgents") === "true";

    const agents = await prisma.user.findMany({
      where: onlyAgents ? { role: "AGENT" } : { role: { in: ["AGENT", "ADMIN"] } },
      include: {
        routes: true,
        attendanceRecords: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: [
        { role: "asc" },
        { createdAt: "desc" },
      ],
    });

    const mappedAgents = agents.map((a: any) => ({
      id: a.id || a.userId,
      userId: a.userId,
      name: a.name,
      email: a.email,
      phone: a.phone,
      role: a.role,
      status: a.status,
      loginId: a.loginId || (a.role === "ADMIN" ? "ADMIN" : `AGT-${a.userId?.replace('USR-', '')}`),
      pin: a.pin || "1234",
      password: a.password || "agentpassword",
      recoveryEfficiency: Number(a.recoveryEfficiency) || 94.0,
      todayCollected: Number(a.todayCollected) || 0,
      attendanceStatus: a.attendanceStatus || "ON_FIELD",
      maxDailyCashLimit: Number(a.maxDailyCashLimit) || (a.role === "ADMIN" ? 500000 : 75000),
      assignedRouteIds: a.assignedRouteIds || a.routes?.map((r: any) => r.routeId) || [],
      permissions: {
        canCollectCash: a.role === "ADMIN" ? true : (a.canCollectCash ?? true),
        canCollectUPI: a.role === "ADMIN" ? true : (a.canCollectUPI ?? true),
        canEditCustomer: a.role === "ADMIN" ? true : (a.canEditCustomer ?? false),
        canDisburseLoan: a.role === "ADMIN" ? true : (a.canDisburseLoan ?? false),
        maxDailyCashLimit: Number(a.maxDailyCashLimit) || (a.role === "ADMIN" ? 500000 : 75000),
      },
      routes: a.routes,
    }));

    return NextResponse.json({ success: true, agents: mappedAgents });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Attendance update
    if (body.type === "ATTENDANCE") {
      const attendance = await prisma.agentAttendance.create({
        data: {
          agentId: body.agentId,
          date: body.date || "2026-09-20",
          checkInTime: body.checkInTime || "08:30 AM",
          status: body.status || "ON_FIELD",
          startKilometers: Number(body.startKilometers) || 0,
          remarks: body.remarks,
        },
      });

      try {
        await prisma.user.updateMany({
          where: { OR: [{ id: body.agentId }, { userId: body.agentId }] },
          data: {
            attendanceStatus: body.status || "ON_FIELD",
          },
        });
      } catch (e) {}

      return NextResponse.json({ success: true, attendance });
    }

    // New Agent create
    const count = await prisma.user.count({ where: { role: "AGENT" } });
    const userId = body.userId || `USR-${String(count + 2).padStart(2, "0")}`;
    const email = body.email || `${body.loginId?.toLowerCase() || userId.toLowerCase()}@fintrack.in`;

    const permissions = body.permissions || {};

    const agent = await prisma.user.create({
      data: {
        userId,
        name: body.name,
        email,
        phone: body.phone || "+91 98480 00000",
        role: (body.role as any) || "AGENT",
        status: body.status || "ACTIVE",
        loginId: body.loginId || `AGT-${userId.replace('USR-', '')}`,
        pin: body.pin || "1234",
        password: body.password || "agentpassword",
        recoveryEfficiency: Number(body.recoveryEfficiency) || 92.5,
        todayCollected: 0,
        maxDailyCashLimit: Number(body.maxDailyCashLimit || permissions.maxDailyCashLimit) || 75000,
        assignedRouteIds: Array.isArray(body.assignedRouteIds) ? body.assignedRouteIds : [],
        canCollectCash: permissions.canCollectCash ?? true,
        canCollectUPI: permissions.canCollectUPI ?? true,
        canEditCustomer: permissions.canEditCustomer ?? false,
        canDisburseLoan: permissions.canDisburseLoan ?? false,
        attendanceStatus: "ON_FIELD",
      },
    });

    return NextResponse.json({ success: true, agent });
  } catch (error: any) {
    console.error("Agent POST error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const body = await req.json();

    if (id) {
      const permissions = body.permissions;
      await prisma.user.updateMany({
        where: { OR: [{ id }, { userId: id }] },
        data: {
          ...(body.name ? { name: body.name } : {}),
          ...(body.role ? { role: body.role as any } : {}),
          ...(body.email ? { email: body.email } : {}),
          ...(body.phone ? { phone: body.phone } : {}),
          ...(body.status ? { status: body.status } : {}),
          ...(body.pin ? { pin: body.pin } : {}),
          ...(body.password ? { password: body.password } : {}),
          ...(body.loginId ? { loginId: body.loginId } : {}),
          ...(body.maxDailyCashLimit !== undefined ? { maxDailyCashLimit: Number(body.maxDailyCashLimit) } : {}),
          ...(Array.isArray(body.assignedRouteIds) ? { assignedRouteIds: body.assignedRouteIds } : {}),
          ...(permissions?.canCollectCash !== undefined ? { canCollectCash: permissions.canCollectCash } : {}),
          ...(permissions?.canCollectUPI !== undefined ? { canCollectUPI: permissions.canCollectUPI } : {}),
          ...(permissions?.canEditCustomer !== undefined ? { canEditCustomer: permissions.canEditCustomer } : {}),
          ...(permissions?.canDisburseLoan !== undefined ? { canDisburseLoan: permissions.canDisburseLoan } : {}),
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
      const userToDelete = await prisma.user.findFirst({
        where: { OR: [{ id }, { userId: id }] },
      });
      if (userToDelete?.role === "ADMIN") {
        return NextResponse.json(
          { success: false, error: "Administrator accounts are protected and cannot be deleted." },
          { status: 403 }
        );
      }

      await prisma.user.deleteMany({
        where: { OR: [{ id }, { userId: id }] },
      });
    }

    return NextResponse.json({ success: true, deleted: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

