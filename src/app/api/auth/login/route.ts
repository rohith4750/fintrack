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

    // 2. Return 401 if user is not found in the database
    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid PIN or credentials entered" }, { status: 401 });
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

