import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { signJWT } from "@/lib/jwt";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

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
    } catch (dbErr: any) {
      console.error("Signup DB lookup error:", dbErr?.message || dbErr);
      return NextResponse.json(
        { error: `Database connection failed: ${dbErr?.message || "Unknown DB error"}` },
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
    } catch (createErr: any) {
      console.error("Signup user.create error:", createErr?.message || createErr);
      // Handle duplicate email race condition
      if (createErr?.code === "P2002" || createErr?.message?.includes("unique")) {
        return NextResponse.json(
          { error: "An account with this email already exists." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: `Failed to create account: ${createErr?.message || "Database error"}` },
        { status: 500 }
      );
    }

    // Send verification email (non-blocking — never throws)
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const verificationUrl = `${appUrl}/verify-email?token=${verificationToken}`;
      const { sendVerificationEmail } = await import("@/lib/email");
      sendVerificationEmail(user.email, name, verificationUrl);
    } catch (emailErr) {
      console.error("Signup email send failed (non-critical):", emailErr);
    }

    // Create session JWT
    const token = await signJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      emailVerified: false,
    });

    // Set cookie
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
  } catch (err: any) {
    console.error("Signup unexpected error:", err?.message || err);
    return NextResponse.json(
      { error: err?.message || "Internal server error during registration." },
      { status: 500 }
    );
  }
}
