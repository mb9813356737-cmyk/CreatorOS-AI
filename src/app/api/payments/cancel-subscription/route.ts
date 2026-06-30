import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { db } from "@/lib/prisma";
import { Plan, SubscriptionStatus } from "@prisma/client";
import { handleRouteError } from "@/lib/errors";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user in DB
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    if (user.plan === Plan.FREE) {
      return NextResponse.json(
        { error: "You are already on the Starter plan" },
        { status: 400 }
      );
    }

    // Downgrade immediately in DB
    await db.user.update({
      where: { id: user.id },
      data: {
        plan: Plan.FREE,
        subscriptionStatus: SubscriptionStatus.CANCELLED,
        subscriptionEnd: null,
        monthlyCredits: 10,
        creditsUsed: 0,
        stripeSubscriptionId: null,
        razorpaySubscriptionId: null,
      },
    });

    // Log cancellation event in payment history
    await db.payment.create({
      data: {
        userId: user.id,
        amount: 0,
        status: "FAILED", // cancel/failed
        plan: Plan.FREE,
        billingPeriod: "monthly",
        metadata: { note: "Subscription cancelled successfully by user" },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Subscription cancelled successfully",
      plan: "FREE",
    });

  } catch (error: any) {
    console.error("Cancel subscription error:", error);
    return handleRouteError(error, "Cancel subscription failed");
  }
}
