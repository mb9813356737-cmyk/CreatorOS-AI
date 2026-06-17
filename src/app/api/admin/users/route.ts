import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { db } from "@/lib/prisma";
import { getMockUsers } from "@/lib/mockDb";
import { handleRouteError } from "@/lib/errors";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const filterPlan = searchParams.get("plan") || "all";
    const filterRole = searchParams.get("role") || "all";
    const filterBanned = searchParams.get("banned") || "all";

    let users: any[] = [];
    let dbOffline = false;

    try {
      const actualUser = await db.user.findUnique({
        where: { id: userId },
      });

      if (!actualUser || actualUser.role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // Build Prisma query filters
      const where: any = {};
      
      if (search) {
        where.OR = [
          { email: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
        ];
      }

      if (filterPlan !== "all") {
        where.plan = filterPlan;
      }

      if (filterRole !== "all") {
        where.role = filterRole;
      }

      if (filterBanned !== "all") {
        where.banned = filterBanned === "true";
      }

      users = await db.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 50,
      });

    } catch (dbErr) {
      console.warn("Database offline in admin users GET, returning mock users:", dbErr);
      dbOffline = true;
    }

    // Dynamic mock users for developer fallback (only in development environment)
    if ((dbOffline || users.length === 0) && process.env.NODE_ENV !== "production") {
      const allMockUsers = getMockUsers();

      users = allMockUsers.filter(u => {
        if (search && !u.email.toLowerCase().includes(search.toLowerCase()) && !u.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterPlan !== "all" && u.plan !== filterPlan) return false;
        if (filterRole !== "all" && u.role !== filterRole) return false;
        if (filterBanned !== "all" && String(u.banned) !== filterBanned) return false;
        return true;
      });
    }

    return NextResponse.json({ dbOffline, users });

  } catch (error: any) {
    return handleRouteError(error, "Fetch users error");
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, targetUserId, amount, role, banned, suspensionDays } = await req.json();

    if (!targetUserId) {
      return NextResponse.json({ error: "Missing target user ID" }, { status: 400 });
    }

    let user;
    let dbOffline = false;

    try {
      const adminUser = await db.user.findUnique({
        where: { id: userId },
      });

      if (!adminUser || adminUser.role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
      }

      // Execute appropriate administration task
      if (action === "adjustCredits") {
        user = await db.user.update({
          where: { id: targetUserId },
          data: {
            monthlyCredits: {
              set: amount,
            },
          },
        });
      } else if (action === "changeRole") {
        user = await db.user.update({
          where: { id: targetUserId },
          data: { role },
        });
      } else if (action === "toggleBan") {
        user = await db.user.update({
          where: { id: targetUserId },
          data: { banned },
        });
      } else if (action === "suspendUser") {
        const until = new Date();
        until.setDate(until.getDate() + (suspensionDays || 0));
        
        user = await db.user.update({
          where: { id: targetUserId },
          data: {
            suspendedUntil: suspensionDays > 0 ? until : null,
          },
        });
      }
    } catch (dbErr) {
      console.warn("Database offline in admin users action. Simulating updates:", dbErr);
      dbOffline = true;
      user = { id: targetUserId, plan: "PRO", role: "USER", banned: false };
    }

    // Handles user impersonation session cookies
    if (action === "impersonate_start") {
      const response = NextResponse.json({
        success: true,
        impersonating: true,
        message: `Impersonation started for user ${targetUserId}`,
      });

      // Set cookie to route requests as this target user
      response.cookies.set("impersonate_user_id", targetUserId, {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });

      return response;
    } else if (action === "impersonate_stop") {
      const response = NextResponse.json({
        success: true,
        impersonating: false,
        message: "Impersonation session terminated",
      });

      response.cookies.delete("impersonate_user_id");
      return response;
    }

    return NextResponse.json({
      success: true,
      dbOffline,
      message: `Action ${action} successfully complete`,
      user,
    });

  } catch (error: any) {
    return handleRouteError(error, "Admin user action POST error");
  }
}
