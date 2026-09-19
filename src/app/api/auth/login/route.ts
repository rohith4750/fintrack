import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const pin = (body.pin || body.userId || "").trim();

    if (!pin) {
      return NextResponse.json({ success: false, message: "PIN is required" }, { status: 400 });
    }

    // 1. Check if database user exists with this PIN or userId or phone or loginId
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { pin: pin },
          { userId: pin },
          { loginId: pin },
          { phone: pin },
        ],
      },
      include: {
        routes: true,
      },
    });

    // 2. Admin PIN handling (9999, 0000, 1111)
    const isAdminPin = pin === "9999" || pin === "0000" || pin === "1111";

    if (!user && isAdminPin) {
      // Find or create Admin
      user = await prisma.user.findFirst({
        where: { role: "ADMIN" },
        include: { routes: true },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            userId: "USR-01",
            name: "Rajesh Kumar (Admin)",
            email: "admin@fintrack.in",
            phone: "+91 98480 12345",
            role: "ADMIN",
            status: "ACTIVE",
            pin: "9999",
            loginId: "ADMIN-01",
            recoveryEfficiency: 98.0,
            todayTarget: 150000,
            todayCollected: 94500,
            maxDailyCashLimit: 500000,
            attendanceStatus: "PRESENT",
          },
          include: { routes: true },
        });
      }
    }

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid PIN entered" }, { status: 401 });
    }

    const permissions = {
      canCollectCash: user.canCollectCash ?? true,
      canCollectUPI: user.canCollectUPI ?? true,
      canEditCustomer: user.canEditCustomer ?? (user.role === 'ADMIN'),
      canDisburseLoan: user.canDisburseLoan ?? (user.role === 'ADMIN'),
      maxDailyCashLimit: Number(user.maxDailyCashLimit) || 75000,
    };

    const mappedUser = {
      id: user.id || user.userId,
      userId: user.userId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      loginId: user.loginId || `AGT-${user.userId?.replace('USR-', '')}`,
      pin: user.pin || pin,
      password: user.password || "agentpassword",
      recoveryEfficiency: Number(user.recoveryEfficiency) || 94.0,
      todayTarget: Number(user.todayTarget) || 30000,
      todayCollected: Number(user.todayCollected) || 0,
      attendanceStatus: user.attendanceStatus || "ON_FIELD",
      maxDailyCashLimit: Number(user.maxDailyCashLimit) || 75000,
      assignedRouteIds: user.assignedRouteIds || user.routes?.map((r: any) => r.routeId) || [],
      permissions,
    };

    return NextResponse.json({
      success: true,
      user: mappedUser,
      token: `jwt-fintrack-${user.id}-${Date.now()}`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

