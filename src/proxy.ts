import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "@/lib/jwt";

// ─── Public Routes (no auth required) ──────────────────────
const PUBLIC_PATHS = [
  "/",
  "/pricing",
  "/features",
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/sso-callback",
  "/admin/login",
  "/api/admin/login",
  "/api/webhooks",
  "/api/payments/webhook",
  "/api/auth",
  "/verify-email",
];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  });
}

// ─── Admin Routes ──────────────────────────────────────────
function isAdminPath(pathname: string) {
  return pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
}

// ─── Protected Routes (auth required) ──────────────────────
function isProtectedPath(pathname: string) {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/hooks") ||
    pathname.startsWith("/captions") ||
    pathname.startsWith("/scripts") ||
    pathname.startsWith("/thumbnails") ||
    pathname.startsWith("/trends") ||
    pathname.startsWith("/viral-score") ||
    pathname.startsWith("/repurpose") ||
    pathname.startsWith("/history") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/billing") ||
    pathname.startsWith("/api/ai") ||
    pathname.startsWith("/api/user")
  );
}

export default async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Retrieve token from cookie
  const token = req.cookies.get("creatoros_session")?.value;
  const session = token ? await verifyJWT(token) : null;

  // Redirect authenticated users away from sign-in/up pages to dashboard
  if (session && (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up"))) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Allow public routes through without any checks
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Redirect unverified users to the verification pending page
  if (session && !session.emailVerified && !pathname.startsWith("/verify-email")) {
    return NextResponse.redirect(new URL("/verify-email/pending", req.url));
  }

  // Redirect unauthenticated users on protected routes to sign-in
  if (!session && isProtectedPath(pathname)) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Block non-admin users from admin routes
  if (isAdminPath(pathname)) {
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    const role = session.role;
    if (role !== "SUPER_ADMIN" && role !== "FINANCE_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Require authentication for all other non-public routes
  if (!session) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Run for API routes
    "/(api|trpc)(.*)",
  ],
};
