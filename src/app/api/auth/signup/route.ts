import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signJWT } from "@/lib/jwt";
import { cookies } from "next/headers";
import { z } from "zod";
import { rateLimit } from "@/lib/redis";

// Enforce validation schema using Zod
const signupSchema = z.object({
  email: z.string().trim().email("Invalid email format").min(5).max(100),
  password: z.string().min(8, "Password must be at least 8 characters long").max(100),
  name: z.string().trim().min(2, "Name must be at least 2 characters long").max(50),
});

export async function POST(req: Request) {
  try {
    // ── Rate Limiting (IP-based sliding window: 10 signups per 15 minutes) ──
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const rateLimitResult = await rateLimit(`rate_limit:signup:ip:${ip}`, 10, 900);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again in 15 minutes." },
        { 
          status: 429,
          headers: {
            "Retry-After": "900",
            "X-RateLimit-Limit": String(rateLimitResult.limit),
            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
            "X-RateLimit-Reset": String(rateLimitResult.reset),
          }
        }
      );
    }

    // Parse and validate input
    const body = await req.json();
    const parseResult = signupSchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, name } = parseResult.data;
    
    // Sanitize name to prevent simple HTML/XSS injection
    const sanitizedName = name.replace(/[<>]/g, "");

    // ── Verify DATABASE_URL is set ──────────────────────────────────
    if (!process.env.DATABASE_URL) {
      console.error(
        "[signup] FATAL: DATABASE_URL is not set in Vercel environment variables."
      );
      return NextResponse.json(
        { error: "Server configuration error. Please contact support." },
        { status: 500 }
      );
    }

    // ── Check if email already exists ─────────────────────────────
    let existingUser;
    try {
      existingUser = await db.user.findUnique({
        where: { email: email.toLowerCase() },
      });
    } catch (dbErr: unknown) {
      const dbErrMsg = dbErr instanceof Error ? dbErr.message : String(dbErr);
      const dbErrCode = (dbErr as { code?: string })?.code ?? "N/A";
      console.error(
        `[signup] DB lookup failed — code: ${dbErrCode} | message: ${dbErrMsg}`
      );
      return NextResponse.json(
        {
          error: "Could not reach the database. Please try again in a moment.",
          debug: process.env.NODE_ENV !== "production" ? dbErrMsg : undefined,
        },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 }
      );
    }

    // Hash password with 10 salt rounds
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    let user;
    try {
      user = await db.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          name: sanitizedName,
          plan: "FREE",
          role: "USER",
          subscriptionStatus: "INACTIVE",
          monthlyCredits: 10,
          creditsUsed: 0,
          emailVerified: true,
        },
      });
    } catch (createErr: unknown) {
      const errObj = createErr as { code?: string; message?: string };
      console.error(
        `[signup] user.create failed — Prisma code: ${errObj?.code ?? "N/A"} | message: ${errObj?.message ?? String(createErr)}`
      );
      if (errObj?.code === "P2002" || errObj?.message?.includes("unique")) {
        return NextResponse.json(
          { error: "An account with this email already exists." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Failed to create your account. Please try again.", debug: process.env.NODE_ENV !== "production" ? errObj?.message : undefined },
        { status: 500 }
      );
    }

    // Create session JWT with password-hash signature binding
    const token = await signJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      passwordVersion: user.password ? user.password.substring(0, 10) : "",
      plan: user.plan,
    });

    // Set cookie securely
    const cookieStore = await cookies();
    cookieStore.set("creatoros_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 86400, // 24 hours
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Internal server error during registration.";
    console.error("Signup unexpected error:", errMsg);
    return NextResponse.json(
      { error: "Internal server error during registration." },
      { status: 500 }
    );
  }
}
