import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { signJWT } from "@/lib/jwt";
import { cookies } from "next/headers";
import { Plan, SubscriptionStatus } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const urlObj = new URL(req.url);
    const code = urlObj.searchParams.get("code");
    const errorParam = urlObj.searchParams.get("error");

    const origin = process.env.NEXT_PUBLIC_APP_URL || urlObj.origin;
    const redirect_uri = `${origin}/api/auth/google/callback`;

    // Handle user cancellation or other OAuth errors from Google
    if (errorParam || !code) {
      console.warn("Google OAuth callback error or missing code:", errorParam);
      return NextResponse.redirect(`${origin}/sign-in?error=google_cancelled`);
    }

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.error("Google client credentials are not configured in env variables.");
      return NextResponse.redirect(`${origin}/sign-in?error=server_configuration`);
    }

    // Exchange authorization code for token payload
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errBody = await tokenResponse.text();
      console.error("Token exchange failed:", errBody);
      return NextResponse.redirect(`${origin}/sign-in?error=invalid_token`);
    }

    const tokens = await tokenResponse.json();

    // Fetch user details from Google user info endpoint
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoResponse.ok) {
      console.error("User info retrieval failed");
      return NextResponse.redirect(`${origin}/sign-in?error=network_error`);
    }

    const googleUser = await userInfoResponse.json();
    const email = googleUser.email?.toLowerCase();

    if (!email) {
      console.error("Email not provided in Google profile");
      return NextResponse.redirect(`${origin}/sign-in?error=unauthorized_access`);
    }

    // Check database for existing account with the same email
    let user = await db.user.findUnique({
      where: { email },
    });

    let isNewUser = false;

    if (user) {
      // Impose banned and suspension restrictions
      if (user.banned || (user.suspendedUntil && user.suspendedUntil > new Date())) {
        return NextResponse.redirect(`${origin}/sign-in?error=suspended`);
      }

      // Update avatar or name if missing in existing user profile
      const updates: any = {};
      if (!user.imageUrl && googleUser.picture) {
        updates.imageUrl = googleUser.picture;
      }
      if (!user.name && googleUser.name) {
        updates.name = googleUser.name;
      }

      if (Object.keys(updates).length > 0) {
        user = await db.user.update({
          where: { id: user.id },
          data: updates,
        });
      }
    } else {
      // Create a brand new user automatically if not registered
      user = await db.user.create({
        data: {
          email,
          name: googleUser.name || "Content Creator",
          imageUrl: googleUser.picture || null,
          plan: Plan.FREE,
          subscriptionStatus: SubscriptionStatus.INACTIVE,
          emailVerified: true,
        },
      });
      isNewUser = true;
    }

    // Sign the custom JWT session token
    const token = await signJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      passwordVersion: user.password ? user.password.substring(0, 10) : "",
      plan: user.plan,
    });

    // Save secure session cookie
    const cookieStore = await cookies();
    cookieStore.set("creatoros_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 86400, // 24 hours
    });

    // Redirect to onboarding for new users or direct dashboard for returning users
    const redirectPath = isNewUser ? "/onboarding" : "/dashboard";
    return NextResponse.redirect(`${origin}${redirectPath}`);
  } catch (error: any) {
    console.error("Google OAuth Callback Handler error:", error);
    const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${origin}/sign-in?error=network_error`);
  }
}
