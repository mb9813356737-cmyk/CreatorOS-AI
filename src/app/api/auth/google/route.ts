import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const client_id = process.env.GOOGLE_CLIENT_ID;
    if (!client_id) {
      return NextResponse.json(
        { error: "Google OAuth Client ID is not configured on the server." },
        { status: 500 }
      );
    }

    // Support dynamic origin checks for Vercel preview branch deployment compatibility
    const urlObj = new URL(req.url);
    const origin = process.env.NEXT_PUBLIC_APP_URL || urlObj.origin;
    const redirect_uri = `${origin}/api/auth/google/callback`;

    const scope = "openid email profile";
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      client_id
    )}&redirect_uri=${encodeURIComponent(
      redirect_uri
    )}&response_type=code&scope=${encodeURIComponent(
      scope
    )}&state=${encodeURIComponent("/")}`;

    return NextResponse.redirect(googleAuthUrl);
  } catch (error: any) {
    console.error("Google OAuth Init error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize Google login session" },
      { status: 500 }
    );
  }
}
