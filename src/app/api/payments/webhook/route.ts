import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/prisma";
import { Plan, SubscriptionStatus, PaymentStatus } from "@prisma/client";
import Stripe from "stripe";

// Next.js App Router config: bypass body parsing to get raw body
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
      console.error("[Stripe Webhook] Missing STRIPE_WEBHOOK_SECRET env");
      return new Response("Missing webhook secret configuration", { status: 500 });
    }

    const headerPayload = await headers();
    const signature = headerPayload.get("stripe-signature");

    if (!signature) {
      console.error("[Stripe Webhook] Missing stripe-signature header");
      return new Response("Missing signature header", { status: 400 });
    }

    const rawBody = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error(`[Stripe Webhook] Signature verification failed: ${err.message}`);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    console.log(`[Stripe Webhook] Received verified event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const planKey = session.metadata?.plan as Plan;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        if (!userId || !planKey) {
          console.warn("[Stripe Webhook] Session completed missing userId/plan in metadata");
          break;
        }

        // Get subscription details to find period end
        let currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        try {
          const subDetails = (await stripe.subscriptions.retrieve(subscriptionId)) as any;
          currentPeriodEnd = new Date(subDetails.current_period_end * 1000);
          
          // Sync metadata to subscription object in Stripe if not already done
          await stripe.subscriptions.update(subscriptionId, {
            metadata: { userId, plan: planKey },
          });
        } catch (err) {
          console.warn("[Stripe Webhook] Failed to retrieve subscription details:", err);
        }

        const monthlyCredits = planKey === Plan.PRO ? 500 : -1;

        // Update User Subscription details in DB
        await db.user.update({
          where: { id: userId },
          data: {
            plan: planKey,
            subscriptionStatus: SubscriptionStatus.ACTIVE,
            subscriptionEnd: currentPeriodEnd,
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: customerId,
            monthlyCredits,
            creditsUsed: 0,
            creditsResetAt: new Date(),
          },
        });

        console.log(`[Stripe Webhook] User ${userId} upgraded to ${planKey} (Sub: ${subscriptionId})`);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription as string;
        const customerId = invoice.customer as string;

        if (!subscriptionId) break;

        // Retrieve subscription details
        let userId: string | null = null;
        let planKey: Plan = Plan.FREE;
        let currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        try {
          const subDetails = (await stripe.subscriptions.retrieve(subscriptionId)) as any;
          userId = subDetails.metadata?.userId;
          planKey = (subDetails.metadata?.plan as Plan) || Plan.PRO;
          currentPeriodEnd = new Date(subDetails.current_period_end * 1000);
        } catch (err) {
          console.warn("[Stripe Webhook] Failed to fetch subscription for invoice:", err);
        }

        // Fallback user lookup via Customer ID or Subscription ID
        let user = null;
        if (userId) {
          user = await db.user.findUnique({ where: { id: userId } });
        }
        if (!user && customerId) {
          user = await db.user.findFirst({
            where: {
              OR: [
                { stripeCustomerId: customerId },
                { stripeSubscriptionId: subscriptionId },
              ],
            },
          });
        }

        if (!user) {
          console.warn(`[Stripe Webhook] No user profile found for customer ${customerId} / sub ${subscriptionId}`);
          break;
        }

        const monthlyCredits = planKey === Plan.PRO ? 500 : -1;

        // Log successful payment and extend subscription status
        await db.$transaction([
          db.user.update({
            where: { id: user.id },
            data: {
              plan: planKey,
              subscriptionStatus: SubscriptionStatus.ACTIVE,
              subscriptionEnd: currentPeriodEnd,
              stripeSubscriptionId: subscriptionId,
              stripeCustomerId: customerId || user.stripeCustomerId,
              monthlyCredits,
              creditsUsed: 0, // Reset credits on invoice paid
              creditsResetAt: new Date(),
            },
          }),
          db.payment.create({
            data: {
              userId: user.id,
              stripePaymentId: invoice.payment_intent as string || `stripe_invoice_${invoice.id}`,
              stripeSubscriptionId: subscriptionId,
              stripeInvoiceId: invoice.id,
              amount: invoice.amount_paid,
              currency: invoice.currency.toUpperCase(),
              status: PaymentStatus.SUCCESS,
              plan: planKey,
              billingPeriod: "monthly",
              metadata: { invoice_pdf: invoice.invoice_pdf },
            },
          }),
        ]);

        console.log(`[Stripe Webhook] Processed invoice.paid renewal for ${user.id} (${planKey})`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        const subscriptionId = subscription.id;
        const customerId = subscription.customer as string;
        const stripeStatus = subscription.status;

        // Lookup user
        const user = await db.user.findFirst({
          where: {
            OR: [
              { stripeSubscriptionId: subscriptionId },
              { stripeCustomerId: customerId },
            ],
          },
        });

        if (!user) {
          break;
        }

        // Map Stripe status to Prisma status
        let dbStatus: SubscriptionStatus = SubscriptionStatus.INACTIVE;
        if (stripeStatus === "active" || stripeStatus === "trialing") {
          dbStatus = SubscriptionStatus.ACTIVE;
        } else if (stripeStatus === "past_due" || stripeStatus === "unpaid") {
          dbStatus = SubscriptionStatus.PAST_DUE;
        } else if (stripeStatus === "canceled") {
          dbStatus = SubscriptionStatus.CANCELLED;
        } else if (stripeStatus === "incomplete_expired") {
          dbStatus = SubscriptionStatus.EXPIRED;
        }

        const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

        // Update database
        await db.user.update({
          where: { id: user.id },
          data: {
            subscriptionStatus: dbStatus,
            subscriptionEnd: currentPeriodEnd,
          },
        });

        console.log(`[Stripe Webhook] Updated subscription status for ${user.id} to ${dbStatus}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        const subscriptionId = subscription.id;

        // Lookup user
        const user = await db.user.findFirst({
          where: { stripeSubscriptionId: subscriptionId },
        });

        if (!user) break;

        // Downgrade user back to FREE tier
        await db.user.update({
          where: { id: user.id },
          data: {
            plan: Plan.FREE,
            subscriptionStatus: SubscriptionStatus.EXPIRED,
            subscriptionEnd: null,
            stripeSubscriptionId: null,
            monthlyCredits: 10,
          },
        });

        console.log(`[Stripe Webhook] Downgraded user ${user.id} to FREE due to subscription deletion`);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[Stripe Webhook] Error processing event payload:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
