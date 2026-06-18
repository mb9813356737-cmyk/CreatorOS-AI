import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { db } from "@/lib/prisma";
import { handleRouteError } from "@/lib/errors";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let tickets: any[] = [];
    let dbOffline = false;

    try {
      const adminUser = await db.user.findUnique({
        where: { id: userId },
      });

      if (!adminUser || adminUser.role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      tickets = await db.ticket.findMany({
        include: {
          user: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (err) {
      console.error("Database connection issue in admin tickets lookup GET:", err);
      return NextResponse.json({ error: "Database offline. Unable to load support tickets." }, { status: 500 });
    }

    return NextResponse.json({ dbOffline, tickets });
  } catch (error: any) {
    return handleRouteError(error, "Fetch tickets error");
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ticketId, status, priority, assignedTo, internalNote } = await req.json();

    let dbOffline = false;
    let ticket;

    try {
      const adminUser = await db.user.findUnique({
        where: { id: userId },
      });

      if (!adminUser || adminUser.role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      ticket = await db.ticket.update({
        where: { id: ticketId },
        data: {
          status,
          priority,
          assignedTo,
          internalNote,
        },
      });
    } catch (err) {
      console.error("Database connection issue in admin tickets update:", err);
      dbOffline = true;
    }

    return NextResponse.json({
      success: true,
      dbOffline,
      message: "Ticket updated successfully",
      ticket,
    });
  } catch (error: any) {
    return handleRouteError(error, "Update ticket error");
  }
}
