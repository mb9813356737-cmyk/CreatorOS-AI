import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required." },
        { status: 400 }
      );
    }

    // Find user with matching, unexpired token
    const user = await db.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired verification token." },
        { status: 400 }
      );
    }

    // Update user: emailVerified = true, clear token fields
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    // Generate new session token since email is now verified
    const { signJWT } = await import("@/lib/jwt");
    const { cookies } = await import("next/headers");
    const tokenPayload = await signJWT({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      emailVerified: true,
    });

    const cookieStore = await cookies();
    cookieStore.set("creatoros_session", tokenPayload, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 86400, // 24 hours
    });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully!",
    });
  } catch (err: any) {
    console.error("Email verification error:", err);
    return NextResponse.json(
      { error: "Internal server error during email verification." },
      { status: 500 }
    );
  }
}
