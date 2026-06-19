import { NextResponse } from "next/server";
import { auth, currentUser } from "@/lib/auth-server";
import { db } from "@/lib/prisma";
import { handleRouteError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user;
    try {
      // Try to find the user in DB
      user = await db.user.findUnique({
        where: { id: userId },
      });
    } catch (dbErr) {
      console.warn("DB Offline in user metrics route, providing offline default:", dbErr);
    }

    if (!user) {
      // Offline fallback profile
      return NextResponse.json({
        plan: "PRO",
        status: "ACTIVE",
        subscriptionEnd: null,
        monthlyCredits: 500,
        creditsUsed: 120,
        niche: "Tech & Coding",
        platform: "YouTube",
        role: "USER",
      });
    }

    return NextResponse.json({
      plan: user.plan,
      status: user.subscriptionStatus,
      subscriptionEnd: user.subscriptionEnd ? user.subscriptionEnd.toISOString() : null,
      monthlyCredits: user.monthlyCredits,
      creditsUsed: user.creditsUsed,
      niche: user.niche,
      platform: user.platform,
      role: user.role || "USER",
    });
  } catch (error: any) {
    return handleRouteError(error, "Usage endpoint error");
  }
}
