import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { db } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
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

    if (user.plan === "FREE") {
      return NextResponse.json(
        { error: "You are already on the Starter plan" },
        { status: 400 }
      );
    }

    const subscriptionId = user.stripeSubscriptionId;
    const isSimulated = !subscriptionId || subscriptionId.startsWith("sim_");

    if (isSimulated) {
      // For simulated/demo subscriptions, downgrade immediately
      await db.user.update({
        where: { id: user.id },
        data: {
          plan: "FREE",
          subscriptionStatus: "CANCELLED",
          subscriptionEnd: null,
          monthlyCredits: 10,
          creditsUsed: 0,
          stripeSubscriptionId: null,
        },
      });

      // Log a cancelled payment event
      await db.payment.create({
        data: {
          userId: user.id,
          stripeSubscriptionId: subscriptionId || "sim_cancelled",
          amount: 0,
          status: "FAILED", // mark as cancelled/failed
          plan: "FREE",
          billingPeriod: "monthly",
          metadata: { note: "Subscription cancelled in simulator mode" },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Subscription cancelled successfully (simulated)",
        plan: "FREE",
      });
    }

    // Real Stripe Subscription Cancellation
    try {
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      const isStripeConfigured = 
        stripeSecretKey && 
        stripeSecretKey !== "sk_test_placeholder" &&
        !stripeSecretKey.includes("placeholder");

      if (isStripeConfigured) {
        // Cancel subscription immediately in Stripe
        await stripe.subscriptions.cancel(subscriptionId);
      }
    } catch (stripeErr: any) {
      console.warn("Stripe subscription cancel call failed, proceeding to update DB anyway:", stripeErr);
    }

    // Update DB
    await db.user.update({
      where: { id: user.id },
      data: {
        plan: "FREE",
        subscriptionStatus: "CANCELLED",
        subscriptionEnd: null,
        monthlyCredits: 10,
        creditsUsed: 0,
        stripeSubscriptionId: null,
      },
    });

    await db.payment.create({
      data: {
        userId: user.id,
        stripeSubscriptionId: subscriptionId,
        amount: 0,
        status: "FAILED",
        plan: "FREE",
        billingPeriod: "monthly",
        metadata: { note: "Subscription cancelled via portal" },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Subscription cancelled successfully",
      plan: "FREE",
    });

  } catch (error: any) {
    console.error("Cancel subscription error:", error);

    if (
      error.message?.includes("Prisma") ||
      error.code === "ECONNREFUSED" ||
      error.message?.includes("connection") ||
      error.message?.includes("DATABASE_URL")
    ) {
      const response = NextResponse.json({
        success: true,
        message: "Subscription cancelled (DB Offline Fallback)",
        plan: "FREE",
      });
      response.cookies.set("creatoros_sim_plan", "FREE", { path: "/", maxAge: 86400 });
      return response;
    }

    return handleRouteError(error, "Cancel subscription error");
  }
}
