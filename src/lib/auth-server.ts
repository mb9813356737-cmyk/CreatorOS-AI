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
      userId = session.userId;

      // Handle admin impersonation cookie override
      const impersonatedId = cookieStore.get("impersonate_user_id")?.value;
      if (impersonatedId) {
        const actualUser = await db.user.findUnique({
          where: { id: session.userId },
        });
        
        // Only allow non-USER role to impersonate
        if (actualUser && actualUser.role !== "USER") {
          userId = impersonatedId;
          isImpersonated = true;
        }
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
