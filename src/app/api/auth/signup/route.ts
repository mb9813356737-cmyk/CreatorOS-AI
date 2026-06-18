import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    // ── Verify DATABASE_URL is set ──────────────────────────────────
    // If missing, log the exact reason and return a clear 500.
    if (!process.env.DATABASE_URL) {
      console.error(
        "[signup] FATAL: DATABASE_URL is not set in Vercel environment variables. " +
        "Go to Vercel → Project → Settings → Environment Variables and add DATABASE_URL, then redeploy."
      );
      return NextResponse.json(
        { error: "Server configuration error: missing database URL. Please contact support." },
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
      // Log the EXACT underlying Postgres / Prisma message so it appears in
      // Vercel runtime logs (Vercel → Project → Functions → Logs).
      const dbErrMsg  = dbErr instanceof Error ? dbErr.message  : String(dbErr);
      const dbErrCode = (dbErr as { code?: string })?.code ?? "N/A";
      console.error(
        `[signup] DB lookup failed — code: ${dbErrCode} | message: ${dbErrMsg}`
      );
      return NextResponse.json(
        {
          error: "Could not reach the database. Please try again in a moment.",
          // include for browser console visibility without exposing internals to real users
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomUUID();
    const verificationExpires = new Date(Date.now() + 24 * 3600 * 1000); // 24 hours

    // Create user in database
    let user;
    try {
      user = await db.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          name,
          plan: "FREE",
          role: "USER",
          subscriptionStatus: "INACTIVE",
          monthlyCredits: 10,
          creditsUsed: 0,
          emailVerified: false,
          emailVerificationToken: verificationToken,
          emailVerificationExpires: verificationExpires,
        },
      });
    } catch (createErr: unknown) {
      const errObj = createErr as { code?: string; message?: string };
      console.error(
        `[signup] user.create failed — Prisma code: ${errObj?.code ?? "N/A"} | message: ${errObj?.message ?? String(createErr)}`
      );
      // P2002 = unique constraint violation (duplicate email race condition)
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

    // Send verification email (non-blocking — never throws)
    try {
      // Dynamic base URL check for dev/production/Vercel
      let appUrl = "http://localhost:3000";
      if (process.env.NODE_ENV === "production") {
        if (process.env.NEXT_PUBLIC_APP_URL) {
          appUrl = process.env.NEXT_PUBLIC_APP_URL;
        } else if (process.env.VERCEL_URL) {
          appUrl = `https://${process.env.VERCEL_URL}`;
        }
      }
      const verificationUrl = `${appUrl}/verify?token=${verificationToken}`;
      const { sendVerificationEmail } = await import("@/lib/email");
      sendVerificationEmail(user.email, name, verificationUrl);
    } catch (emailErr) {
      console.error("Signup email send failed (non-critical):", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Please check your email to verify your account.",
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Internal server error during registration.";
    console.error("Signup unexpected error:", errMsg);
    return NextResponse.json(
      { error: errMsg },
      { status: 500 }
    );
  }
}
