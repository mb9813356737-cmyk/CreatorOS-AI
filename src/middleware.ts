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

// ─── Plan Gated Routes (allowed plan configurations) ───────
const PLAN_GATED_ROUTES = [
  { prefix: "/scripts", allowedPlans: ["PRO", "AGENCY"] },
  { prefix: "/thumbnails", allowedPlans: ["PRO", "AGENCY"] },
  { prefix: "/trends", allowedPlans: ["PRO", "AGENCY"] },
  { prefix: "/viral-score", allowedPlans: ["PRO", "AGENCY"] },
  { prefix: "/repurpose", allowedPlans: ["AGENCY"] },
];

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Retrieve token from cookie
  const token = req.cookies.get("creatoros_session")?.value;
  let session = null;
  let clearCookie = false;

  if (token) {
    session = await verifyJWT(token);
    if (!session) {
      clearCookie = true;
    }
  }

  // Set up default response
  let response = NextResponse.next();

  // Redirect authenticated users away from sign-in/up pages to dashboard
  if (session && (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up"))) {
    response = NextResponse.redirect(new URL("/dashboard", req.url));
  } 
  // Allow public routes through without any checks
  else if (isPublicPath(pathname)) {
    // Keep response as is (NextResponse.next())
  }
  // Redirect unauthenticated users on protected routes to sign-in
  else if (!session && isProtectedPath(pathname)) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    response = NextResponse.redirect(signInUrl);
  }
  // Gating plan restrictions for authenticated users
  else if (session && PLAN_GATED_ROUTES.some((route) => pathname.startsWith(route.prefix))) {
    const gatedRoute = PLAN_GATED_ROUTES.find((route) => pathname.startsWith(route.prefix))!;
    const userPlan = (session.plan || "FREE") as string;
    if (!gatedRoute.allowedPlans.includes(userPlan)) {
      response = NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }
  // Block non-admin users from admin routes
  else if (isAdminPath(pathname)) {
    if (!session) {
      response = NextResponse.redirect(new URL("/admin/login", req.url));
    } else {
      const role = session.role;
      if (role !== "SUPER_ADMIN" && role !== "FINANCE_ADMIN") {
        response = NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
  }
  // Require authentication for all other non-public routes
  else if (!session && !isPublicPath(pathname)) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    response = NextResponse.redirect(signInUrl);
  }

  if (clearCookie) {
    response.cookies.set("creatoros_session", "", { path: "/", maxAge: 0 });
  }

  return response;
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Run for API routes
    "/(api|trpc)(.*)",
  ],
};
