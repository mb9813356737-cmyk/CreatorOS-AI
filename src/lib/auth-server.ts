import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import { db } from "@/lib/prisma";

export async function auth() {
  let userId: string | null = null;
  let isImpersonated = false;

  try {
    const cookieStore = await cookies();
    
    // Check for custom session token
    const token = cookieStore.get("creatoros_session")?.value;
    const session = token ? await verifyJWT(token) : null;

    if (session) {
      // Query database to ensure user is active, not banned/suspended, and session is valid
      const user = await db.user.findUnique({
        where: { id: session.userId },
        select: { id: true, banned: true, suspendedUntil: true, role: true, password: true },
      });

      if (user && !user.banned && !(user.suspendedUntil && user.suspendedUntil > new Date())) {
        const dbPwVersion = user.password ? user.password.substring(0, 10) : "";
        
        if (session.passwordVersion === dbPwVersion) {
          userId = session.userId;

          // Handle admin impersonation cookie override
          const impersonatedId = cookieStore.get("impersonate_user_id")?.value;
          if (impersonatedId && user.role !== "USER") {
            userId = impersonatedId;
            isImpersonated = true;
          }
        } else {
          console.warn(`[Security] Password mismatch for user ${session.userId}. Expiring cookie.`);
          cookieStore.set("creatoros_session", "", { path: "/", maxAge: 0 });
        }
      } else if (user) {
        console.warn(`[Security] Session accessed by banned or suspended user ${session.userId}. Expiring cookie.`);
        cookieStore.set("creatoros_session", "", { path: "/", maxAge: 0 });
      }
    }
  } catch (err) {
    console.warn("Server auth check failed:", err);
  }

  return {
    userId,
    isImpersonated,
  };
}

export async function currentUser() {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    return user;
  } catch (error) {
    console.warn("Server currentUser lookup failed:", error);
    return null;
  }
}
