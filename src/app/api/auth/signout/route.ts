import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Expire the session cookie immediately
    cookieStore.set("creatoros_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Signout error:", err);
    return NextResponse.json(
      { error: "Internal server error during sign out." },
      { status: 500 }
    );
  }
}
