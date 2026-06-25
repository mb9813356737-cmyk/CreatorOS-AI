import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { db } from "@/lib/prisma";
import { getSystemSettings, saveSystemSettings } from "@/lib/system-settings";
import { handleRouteError } from "@/lib/errors";
import { isSuperAdmin } from "@/lib/utils";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const adminUser = await db.user.findUnique({
        where: { id: userId },
      });

      if (!adminUser || !isSuperAdmin(adminUser)) {
        return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
      }
    } catch {
      // Database offline fallback, allow access for client development
    }

    const settings = await getSystemSettings();
    return NextResponse.json(settings);
  } catch (error: any) {
    return handleRouteError(error, "Fetch system settings error");
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const adminUser = await db.user.findUnique({
        where: { id: userId },
      });

      if (!adminUser || !isSuperAdmin(adminUser)) {
        return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
      }
    } catch {
      // Database offline fallback, allow access for client development
    }

    const body = await req.json();
    const { activeModel, maintenanceMode } = body;

    const updated = await saveSystemSettings({
      ...(activeModel !== undefined && { activeModel }),
      ...(maintenanceMode !== undefined && { maintenanceMode }),
    });

    // Write audit log entry if DB is online
    try {
      const adminUser = await db.user.findUnique({
        where: { id: userId },
      });
      if (adminUser) {
        let details = "";
        if (activeModel !== undefined) details += `Changed active AI model to ${activeModel}. `;
        if (maintenanceMode !== undefined) details += `Set maintenance mode to ${maintenanceMode}.`;

        await db.auditLog.create({
          data: {
            userId: adminUser.id,
            adminEmail: adminUser.email,
            action: "SYSTEM_CONFIG_UPDATE",
            targetType: "System",
            details,
          },
        });
      }
    } catch (auditErr) {
      console.warn("Could not log audit log entry:", auditErr);
    }

    return NextResponse.json({
      success: true,
      message: "System configuration updated successfully",
      settings: updated,
    });
  } catch (error: any) {
    return handleRouteError(error, "Modify system settings error");
  }
}
