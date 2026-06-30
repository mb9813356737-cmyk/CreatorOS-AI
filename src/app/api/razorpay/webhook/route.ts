import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import crypto from "crypto";
import { Plan, SubscriptionStatus, PaymentStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing webhook signature header" }, { status: 400 });
    }

    const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
      console.error("[Razorpay Webhook] Missing RAZORPAY_WEBHOOK_SECRET env");
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("[Razorpay Webhook] Signature verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    console.log(`[Razorpay Webhook] Received verified event: ${event.event}`);

    if (event.event === "payment.captured") {
      const paymentEntity = event.payload.payment.entity;
      const paymentId = paymentEntity.id;
      const orderId = paymentEntity.order_id;
      const amount = paymentEntity.amount; // amount in paise
      const currency = paymentEntity.currency || "INR";
      
      // Notes are inherited from order/payment creation
      let userId = paymentEntity.notes?.userId;
      let planName = paymentEntity.notes?.planName;

      const email = paymentEntity.email;

      // Fallback for hosted page payments where notes might be missing
      if (!userId && email) {
        console.log(`[Razorpay Webhook] Missing userId in notes, attempting email fallback for: ${email}`);
        const userByEmail = await db.user.findFirst({
          where: {
            email: {
              equals: email,
              mode: 'insensitive'
            }
          }
        });
        if (userByEmail) {
          userId = userByEmail.id;
          console.log(`[Razorpay Webhook] Email fallback resolved userId: ${userId}`);
        }
      }

      if (!planName) {
        if (amount === 49900) {
          planName = "PRO";
        } else if (amount === 199900 || amount === 200000) {
          planName = "AGENCY";
        }
      }

      if (!userId || !planName) {
        console.warn(`[Razorpay Webhook] Payment captured but could not resolve userId (${userId}) or planName (${planName}) for email: ${email}`);
        return NextResponse.json({ received: true });
      }

      // Check if this payment record is already successfully saved in the DB
      const existingPayment = await db.payment.findUnique({
        where: { razorpayPaymentId: paymentId },
      });

      if (existingPayment && existingPayment.status === PaymentStatus.SUCCESS) {
        console.log(`[Razorpay Webhook] Payment ${paymentId} already processed. Skipping duplicate update.`);
        return NextResponse.json({ received: true });
      }

      // Determine plan type enum and monthly credits
      let planEnum: Plan;
      let monthlyCredits = 10;

      if (planName === "PRO") {
        planEnum = Plan.PRO;
        monthlyCredits = 500;
      } else if (planName === "AGENCY") {
        planEnum = Plan.AGENCY;
        monthlyCredits = -1;
      } else {
        planEnum = Plan.FREE;
        monthlyCredits = 10;
      }

      const currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // Perform user and payment updates
      if (existingPayment) {
        // Update existing pending payment record and upgrade user
        await db.$transaction([
          db.user.update({
            where: { id: userId },
            data: {
              plan: planEnum,
              subscriptionStatus: SubscriptionStatus.ACTIVE,
              subscriptionEnd: currentPeriodEnd,
              razorpaySubscriptionId: orderId,
              monthlyCredits,
              creditsUsed: 0,
              creditsResetAt: new Date(),
            },
          }),
          db.payment.update({
            where: { id: existingPayment.id },
            data: {
              status: PaymentStatus.SUCCESS,
              metadata: { 
                note: "Payment verified successfully by Razorpay webhook event",
                webhook_received_at: new Date().toISOString()
              },
            },
          }),
        ]);
      } else {
        // Create new success payment record and upgrade user
        await db.$transaction([
          db.user.update({
            where: { id: userId },
            data: {
              plan: planEnum,
              subscriptionStatus: SubscriptionStatus.ACTIVE,
              subscriptionEnd: currentPeriodEnd,
              razorpaySubscriptionId: orderId,
              monthlyCredits,
              creditsUsed: 0,
              creditsResetAt: new Date(),
            },
          }),
          db.payment.create({
            data: {
              userId,
              razorpayPaymentId: paymentId,
              razorpayOrderId: orderId,
              amount: amount,
              currency: currency,
              status: PaymentStatus.SUCCESS,
              plan: planEnum,
              billingPeriod: "monthly",
              metadata: { 
                note: "Payment created and verified by Razorpay webhook event",
                webhook_received_at: new Date().toISOString()
              },
            },
          }),
        ]);
      }

      console.log(`[Razorpay Webhook] Successfully processed payment.captured for user ${userId}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("[Razorpay Webhook] Error processing event payload:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
