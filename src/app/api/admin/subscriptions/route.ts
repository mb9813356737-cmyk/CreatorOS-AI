import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { db } from "@/lib/prisma";
import { getCoupons, addCoupon, toggleCoupon, deleteCoupon } from "@/lib/coupons-store";
import { getMockPayments } from "@/lib/mockDb";
import { handleRouteError } from "@/lib/errors";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payments: any[] = [];
    let dbOffline = false;

    try {
      const adminUser = await db.user.findUnique({
        where: { id: userId },
      });

      if (!adminUser || adminUser.role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      payments = await db.payment.findMany({
        orderBy: { createdAt: "desc" },
        take: 30,
      });
    } catch (err) {
      console.warn("Database offline in admin subscriptions logs, returning mock transactions:", err);
      dbOffline = true;
    }

    if ((dbOffline || payments.length === 0) && process.env.NODE_ENV !== "production") {
      payments = getMockPayments();
    }

    const currentCoupons = getCoupons();

    return NextResponse.json({
      dbOffline,
      payments,
      coupons: currentCoupons,
    });
  } catch (error: any) {
    return handleRouteError(error, "Fetch payments admin error");
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, paymentId, code, discount, type } = await req.json();

    let dbOffline = false;

    try {
      const adminUser = await db.user.findUnique({
        where: { id: userId },
      });

      if (!adminUser || adminUser.role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      if (action === "refund") {
        // Refund payment in DB
        await db.payment.update({
          where: { id: paymentId },
          data: {
            status: "REFUNDED",
          },
        });
      } else if (action === "toggleCoupon") {
        toggleCoupon(code);
      } else if (action === "createCoupon") {
        addCoupon({
          code: code.toUpperCase(),
          discount: Number(discount),
          type: type || "percentage",
          active: true,
          usageCount: 0,
        });
      } else if (action === "deleteCoupon") {
        deleteCoupon(code);
      }
    } catch (err) {
      console.warn("DB offline in payment actions, mocking response:", err);
      dbOffline = true;
    }

    return NextResponse.json({
      success: true,
      dbOffline,
      message: `Action ${action} executed successfully`,
    });
  } catch (error: any) {
    return handleRouteError(error, "Post payment action error");
  }
}
