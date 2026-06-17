import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required." },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Return success anyway to prevent user enumeration security attacks
      return NextResponse.json({
        success: true,
        message: "If that email exists, a password reset link has been generated.",
      });
    }

    // Generate secure reset token
    const resetToken = crypto.randomUUID();
    const expiry = new Date(Date.now() + 3600000); // 1 hour from now

    await db.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: expiry,
      },
    });

    // Generate reset URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

    // Under production we'd mail this link. For testing/convenience we log it and return it in a test field.
    console.log(`[AUTH SERVICE] Password reset requested for ${email}. Link: ${resetUrl}`);

    return NextResponse.json({
      success: true,
      message: "If that email exists, a password reset link has been generated.",
      // For development ease of testing, return link under test mode
      _testUrl: process.env.NODE_ENV !== "production" ? resetUrl : undefined,
    });
  } catch (err: any) {
    console.error("Forgot password error:", err);
    return NextResponse.json(
      { error: "Internal server error during password reset request." },
      { status: 500 }
    );
  }
}
