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

    // Retrieve user from DB to ensure freshest state and validate session integrity
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
        banned: true,
        suspendedUntil: true,
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    // Enforce ban, suspension, and password version check
    if (user.banned || (user.suspendedUntil && user.suspendedUntil > new Date())) {
      console.warn(`[Security] Session rejected: user ${user.id} is banned or suspended.`);
      const response = NextResponse.json({ user: null });
      cookieStore.set("creatoros_session", "", { path: "/", maxAge: 0 });
      return response;
    }

    const dbPwVersion = user.password ? user.password.substring(0, 10) : "";
    if (payload.passwordVersion !== dbPwVersion) {
      console.warn(`[Security] Session rejected: passwordVersion mismatch for user ${user.id}.`);
      const response = NextResponse.json({ user: null });
      cookieStore.set("creatoros_session", "", { path: "/", maxAge: 0 });
      return response;
    }

    // Strip database password and ban fields before returning to client
    const { password: _pw, banned: _banned, suspendedUntil: _susp, ...safeUser } = user;

    return NextResponse.json({ user: safeUser });
  } catch (err: any) {
    console.error("Session GET error:", err);
    return NextResponse.json({ user: null });
  }
}
