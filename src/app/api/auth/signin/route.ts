import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { signJWT } from "@/lib/jwt";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { z } from "zod";
import { rateLimit } from "@/lib/redis";

// Validation schema using Zod
const signinSchema = z.object({
  email: z.string().trim().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: Request) {
  try {
    // ── Rate Limiting by IP (IP sliding window: 10 signin attempts per 5 minutes) ──
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const ipRateLimit = await rateLimit(`rate_limit:signin:ip:${ip}`, 10, 300);
    
    if (!ipRateLimit.success) {
      return NextResponse.json(
        { error: "Too many signin attempts. Please try again in 5 minutes." },
        { 
          status: 429,
          headers: {
            "Retry-After": "300",
            "X-RateLimit-Limit": String(ipRateLimit.limit),
            "X-RateLimit-Remaining": String(ipRateLimit.remaining),
            "X-RateLimit-Reset": String(ipRateLimit.reset),
          }
        }
      );
    }

    // Parse and validate inputs
    const body = await req.json();
    const parseResult = signinSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = parseResult.data;

    // ── Rate Limiting by Target Account (Email sliding window: 5 signin attempts per 5 minutes) ──
    const emailKey = email.toLowerCase();
    const emailRateLimit = await rateLimit(`rate_limit:signin:email:${emailKey}`, 5, 300);
    if (!emailRateLimit.success) {
      return NextResponse.json(
        { error: "Too many failed attempts on this account. Please try again in 5 minutes." },
        { 
          status: 429,
          headers: {
            "Retry-After": "300",
            "X-RateLimit-Limit": String(emailRateLimit.limit),
            "X-RateLimit-Remaining": String(emailRateLimit.remaining),
            "X-RateLimit-Reset": String(emailRateLimit.reset),
          }
        }
      );
    }

    // Find user in database
    const user = await db.user.findUnique({
      where: { email: emailKey },
    });

    if (!user || !user.password) {
      // Return safe, generic error to prevent account verification enumeration
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Enforce Ban and Suspension Checks
    if (user.banned || (user.suspendedUntil && user.suspendedUntil > new Date())) {
      const suspensionMsg = user.suspendedUntil
        ? `Your account is suspended until ${user.suspendedUntil.toLocaleString()}.`
        : "Your account has been suspended.";
      return NextResponse.json(
        { error: suspensionMsg },
        { status: 403 }
      );
    }

    // Verify password match
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Create session JWT with password-hash signature binding
    const token = await signJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      passwordVersion: user.password.substring(0, 10),
      plan: user.plan,
    });

    // Set secure cookie
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
    console.error("Signin error:", err);
    return NextResponse.json(
      { error: "Internal server error during sign in." },
      { status: 500 }
    );
  }
}
