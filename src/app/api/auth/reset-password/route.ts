import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { rateLimit } from "@/lib/redis";
import crypto from "crypto";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters long").max(100),
});

export async function POST(req: Request) {
  try {
    // ── Rate Limiting by IP (IP sliding window: 5 attempts per 15 minutes) ──
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const ipRateLimit = await rateLimit(`rate_limit:reset_password:ip:${ip}`, 5, 900);
    
    if (!ipRateLimit.success) {
      return NextResponse.json(
        { error: "Too many attempts from this IP. Please try again in 15 minutes." },
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
    const parseResult = resetPasswordSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { token, password } = parseResult.data;

    // Hash input token with SHA-256 to lookup database
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with matching, unexpired reset token
    const user = await db.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired password reset token." },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token fields
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Your password has been reset successfully. Existing sessions have been terminated.",
    });
  } catch (err: any) {
    console.error("Reset password error:", err);
    return NextResponse.json(
      { error: "Internal server error during password reset." },
      { status: 500 }
    );
  }
}
