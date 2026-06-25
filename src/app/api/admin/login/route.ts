import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signJWT } from "@/lib/jwt";
import { handleRouteError } from "@/lib/errors";
import { isSuperAdmin } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const { email, passkey } = await req.json();

    if (!email || !passkey) {
      return NextResponse.json({ error: "Email and passkey are required" }, { status: 400 });
    }

    // Strict validation: Only admin@creatoros.ai and password Mohit1306 can pass
    if (email !== "admin@creatoros.ai") {
      return NextResponse.json({ error: "Access denied. Invalid admin email." }, { status: 401 });
    }

    if (passkey !== "Mohit1306") {
      return NextResponse.json({ error: "Access denied. Invalid admin password." }, { status: 401 });
    }

    // Hash admin password for secure database storage
    const hashedPassword = await bcrypt.hash("Mohit1306", 10);

    // Sync database user details
    let adminUser = await db.user.findUnique({
      where: { email: "admin@creatoros.ai" },
    });

    if (!adminUser) {
      console.log("[Admin Sync] Creating admin user in database...");
      adminUser = await db.user.create({
        data: {
          email: "admin@creatoros.ai",
          name: "Admin User",
          password: hashedPassword,
          role: "SUPER_ADMIN",
          plan: "AGENCY",
          emailVerified: true,
        },
      });
    } else {
      // Check if password, role, or emailVerified needs updating
      const passwordMatch = adminUser.password ? await bcrypt.compare("Mohit1306", adminUser.password) : false;
      if (!passwordMatch || !isSuperAdmin(adminUser) || !adminUser.emailVerified) {
        console.log("[Admin Sync] Updating admin password hash, role, and verification state in database...");
        adminUser = await db.user.update({
          where: { email: "admin@creatoros.ai" },
          data: {
            password: hashedPassword,
            role: "SUPER_ADMIN",
            emailVerified: true,
          },
        });
      }
    }

    // Create session JWT bound to database user details (used by middleware.ts)
    const token = await signJWT({
      userId: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      emailVerified: adminUser.emailVerified,
      passwordVersion: adminUser.password ? adminUser.password.substring(0, 10) : "",
      plan: adminUser.plan,
    });

    // Set secure cookies
    const cookieStore = await cookies();

    // 1. Regular user session cookie (verified by middleware)
    cookieStore.set("creatoros_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    // 2. Admin active session cookie (verified by admin/layout)
    cookieStore.set("admin_session_active", "true", {
      httpOnly: false, // Must be readable by client-side document.cookie in layout.tsx
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return NextResponse.json({
      success: true,
      message: "Admin authentication successful",
      redirect: "/admin?tab=overview",
    });
  } catch (error: any) {
    console.error("[Admin Auth Error]:", error);
    return handleRouteError(error, "Admin login API error");
  }
}
