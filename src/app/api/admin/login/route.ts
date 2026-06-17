import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { handleRouteError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const { email, passkey } = await req.json();

    if (!email || !passkey) {
      return NextResponse.json({ error: "Missing email or passkey" }, { status: 400 });
    }

    const correctPasskey = process.env.ADMIN_SECRET_KEY;
    if (!correctPasskey && process.env.NODE_ENV === "production") {
      console.error("[Admin Auth] ADMIN_SECRET_KEY is not configured in production. Login blocked.");
      return NextResponse.json({ error: "Admin login is currently unavailable" }, { status: 503 });
    }
    const finalPasskey = correctPasskey || "admin123";
    const isValid = passkey === finalPasskey && (email === "admin@creatoros.ai" || email.endsWith("@creatoros.ai"));

    if (!isValid) {
      return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
    }

    // Set secure admin session cookie
    const response = NextResponse.json({
      success: true,
      message: "Admin authentication successful",
      redirect: "/admin?tab=overview",
    });

    const cookieStore = await cookies();
    cookieStore.set("admin_session_active", "true", {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error: any) {
    return handleRouteError(error, "Admin login API error");
  }
}
