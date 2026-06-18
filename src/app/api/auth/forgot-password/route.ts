import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { z } from "zod";
import { rateLimit } from "@/lib/redis";
import crypto from "crypto";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Invalid email format"),
});

export async function POST(req: Request) {
  try {
    // ── Rate Limiting by IP (IP sliding window: 3 attempts per 15 minutes) ──
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const ipRateLimit = await rateLimit(`rate_limit:forgot_password:ip:${ip}`, 3, 900);
    
    if (!ipRateLimit.success) {
      return NextResponse.json(
        { error: "Too many reset attempts from this IP. Please try again in 15 minutes." },
        { 
          status: 429,
          headers: {
            "Retry-After": "900",
            "X-RateLimit-Limit": String(ipRateLimit.limit),
            "X-RateLimit-Remaining": String(ipRateLimit.remaining),
            "X-RateLimit-Reset": String(ipRateLimit.reset),
          }
        }
      );
    }

    // Parse and validate input
    const body = await req.json();
    const parseResult = forgotPasswordSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = parseResult.data;
    const emailKey = email.toLowerCase();

    // ── Rate Limiting by Email (Email sliding window: 3 attempts per 15 minutes) ──
    const emailRateLimit = await rateLimit(`rate_limit:forgot_password:email:${emailKey}`, 3, 900);
    if (!emailRateLimit.success) {
      return NextResponse.json(
        { error: "Too many reset attempts for this email. Please try again in 15 minutes." },
        { 
          status: 429,
          headers: {
            "Retry-After": "900",
            "X-RateLimit-Limit": String(emailRateLimit.limit),
            "X-RateLimit-Remaining": String(emailRateLimit.remaining),
            "X-RateLimit-Reset": String(emailRateLimit.reset),
          }
        }
      );
    }

    const user = await db.user.findUnique({
      where: { email: emailKey },
    });

    if (!user) {
      // Prevent user enumeration attacks by returning generic success message
      return NextResponse.json({
        success: true,
        message: "If that email exists, a password reset link has been generated.",
      });
    }

    // Generate secure random token (32 bytes = 64 characters hex)
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    // Store only the SHA-256 hash of the token in the database
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 hour from now

    await db.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: expiry,
      },
    });

    // Generate reset URL containing the plaintext token
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

    // Under production, send verification email (Resend API etc.).
    // For convenience in testing/development, log to console and return in dev mode.
    console.log(`[AUTH SERVICE] Password reset requested for ${email}. Link: ${resetUrl}`);

    return NextResponse.json({
      success: true,
      message: "If that email exists, a password reset link has been generated.",
      // Return test URL only in development environments
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
