import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { db } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { handleRouteError } from "@/lib/errors";

export async function POST(req: Request) {
  let plan: string | null = null;
  let billingPeriod = "monthly";
  let simulate = false;

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const body = await req.json();
      plan = body.plan;
      billingPeriod = body.billingPeriod || "monthly";
      simulate = body.simulate || false;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (plan !== "PRO" && plan !== "AGENCY") {
      return NextResponse.json({ error: "Invalid plan selection" }, { status: 400 });
    }

    if (billingPeriod !== "monthly" && billingPeriod !== "yearly") {
      return NextResponse.json({ error: "Invalid billing period" }, { status: 400 });
    }

    // Find user in DB
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    // Determine config status
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const isStripeConfigured = 
      stripeSecretKey && 
      stripeSecretKey !== "sk_test_placeholder" &&
      !stripeSecretKey.includes("placeholder");

    // Retrieve Price IDs
    const priceProMonthly = process.env.STRIPE_PRICE_ID_PRO_MONTHLY;
    const priceProYearly = process.env.STRIPE_PRICE_ID_PRO_YEARLY;
    const priceAgencyMonthly = process.env.STRIPE_PRICE_ID_AGENCY_MONTHLY;
    const priceAgencyYearly = process.env.STRIPE_PRICE_ID_AGENCY_YEARLY;

    const arePricesConfigured = 
      priceProMonthly && priceProYearly && priceAgencyMonthly && priceAgencyYearly &&
      !priceProMonthly.includes("placeholder") &&
      !priceProYearly.includes("placeholder") &&
      !priceAgencyMonthly.includes("placeholder") &&
      !priceAgencyYearly.includes("placeholder");

    if (!isStripeConfigured || !arePricesConfigured) {
      console.error("[Stripe API] Stripe payment credentials or price IDs are not configured.");
      return NextResponse.json({ error: "Stripe payment gateway is currently unavailable" }, { status: 503 });
    }

    // Real Stripe Integration
    let priceId = "";
    if (plan === "PRO") {
      priceId = billingPeriod === "yearly" ? priceProYearly! : priceProMonthly!;
    } else {
      priceId = billingPeriod === "yearly" ? priceAgencyYearly! : priceAgencyMonthly!;
    }

    // Create or locate stripe customer
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
        },
      });
      stripeCustomerId = customer.id;
      
      // Save customer ID in database
      await db.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      });
    }

    // Create checkout session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/billing/failure`,
      metadata: {
        userId: user.id,
        plan,
        billingPeriod,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          plan,
        },
      },
    });

    return NextResponse.json({
      simulated: false,
      url: session.url,
    });

  } catch (error: any) {
    console.error("Create Stripe checkout session error:", error);
    return handleRouteError(error, "Stripe Checkout session initialization failed");
  }
}
