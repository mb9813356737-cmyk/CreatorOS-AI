import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, useUser } from "@/lib/auth";

// List of public auth views
const PUBLIC_PATHS = ["/sign-in", "/sign-up", "/pricing", "/features", "/", "/verify-email"];

export function useAuthGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  // Route guarding flow logic
  useEffect(() => {
    // Wait until auth state is fully loaded to prevent flash and incorrect redirects
    if (!isLoaded) return;

    const isPublic = PUBLIC_PATHS.some((path) => {
      if (path === "/") return pathname === "/";
      return pathname.startsWith(path);
    });

    if (!isSignedIn && !isPublic) {
      // User is not authenticated, redirect to sign-in
      console.log(`[Auth Guard] Guarded path ${pathname}. Redirecting to /sign-in`);
      router.push("/sign-in");
    } else if (isSignedIn && (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up"))) {
      // User is authenticated, redirect away from entry screens to dashboard
      console.log(`[Auth Guard] Already authenticated. Redirecting away from ${pathname} to /dashboard`);
      router.push("/dashboard");
    }
  }, [isSignedIn, isLoaded, pathname, router]);

  return { isAuthenticated: isSignedIn, user, loading: !isLoaded };
}
