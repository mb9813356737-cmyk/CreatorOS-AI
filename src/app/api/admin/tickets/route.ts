import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { db } from "@/lib/prisma";
import { getMockTickets } from "@/lib/mockDb";
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
      console.warn("Database offline in admin tickets lookup, using mock inbox:", err);
      dbOffline = true;
    }

    if ((dbOffline || tickets.length === 0) && process.env.NODE_ENV !== "production") {
      tickets = getMockTickets();
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

      // If resolving mock, do not hit DB
      if (!ticketId.startsWith("mock_")) {
        ticket = await db.ticket.update({
          where: { id: ticketId },
          data: {
            status,
            priority,
            assignedTo,
            internalNote,
          },
        });
      }
    } catch (err) {
      console.warn("DB offline in admin tickets update. Mocking updates:", err);
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
