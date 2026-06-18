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

    // Verify DATABASE_URL is present
    if (!process.env.DATABASE_URL) {
      console.error("Signup error: DATABASE_URL is not set in environment variables.");
      return NextResponse.json(
        { error: "Database configuration error. Please contact support." },
        { status: 500 }
      );
    }

    // Check if email already exists
    let existingUser;
    try {
      existingUser = await db.user.findUnique({
        where: { email: email.toLowerCase() },
      });
    } catch (dbErr: unknown) {
      const dbErrMsg = dbErr instanceof Error ? dbErr.message : String(dbErr);
      console.error("Signup DB lookup error:", dbErrMsg);
      return NextResponse.json(
        { error: `Database connection failed: ${dbErrMsg}` },
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
      console.error("Signup user.create error:", errObj?.message || errObj);
      // Handle duplicate email race condition
      if (errObj?.code === "P2002" || errObj?.message?.includes("unique")) {
        return NextResponse.json(
          { error: "An account with this email already exists." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: `Failed to create account: ${errObj?.message || "Database error"}` },
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
