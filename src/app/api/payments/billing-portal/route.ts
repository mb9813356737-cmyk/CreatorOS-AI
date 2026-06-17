import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { db } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { handleRouteError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const stripeCustomerId = user.stripeCustomerId;
    
    // Check if it's a simulated or missing customer ID
    if (!stripeCustomerId || stripeCustomerId.startsWith("sim_")) {
      return NextResponse.json({
        simulated: true,
        message: "You are currently on a simulated developer subscription. Manage billing locally.",
      });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const isStripeConfigured = 
      stripeSecretKey && 
      stripeSecretKey !== "sk_test_placeholder" &&
      !stripeSecretKey.includes("placeholder");

    if (!isStripeConfigured) {
      return NextResponse.json({
        simulated: true,
        message: "Stripe key is placeholder. Billing portal unavailable.",
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    
    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${appUrl}/billing`,
    });

    return NextResponse.json({
      simulated: false,
      url: session.url,
    });

  } catch (error: any) {
    console.error("Create Stripe billing portal error:", error);
    return handleRouteError(error, "Stripe Billing Portal initialization failed");
  }
}
