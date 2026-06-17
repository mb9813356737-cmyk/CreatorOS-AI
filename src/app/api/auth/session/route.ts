import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import { db } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("creatoros_session")?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    const payload = await verifyJWT(token);

    if (!payload) {
      return NextResponse.json({ user: null });
    }

    // Retrieve user from DB to ensure freshest state (e.g. niche, platform, plan)
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        niche: true,
        platform: true,
        imageUrl: true,
        monthlyCredits: true,
        creditsUsed: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
  } catch (err: any) {
    console.error("Session GET error:", err);
    return NextResponse.json({ user: null });
  }
}
