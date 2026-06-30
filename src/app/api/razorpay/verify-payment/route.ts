import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import crypto from "crypto";
import { Plan, SubscriptionStatus, PaymentStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      userId, 
      planName 
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId || !planName) {
      return NextResponse.json({ success: false, error: "Missing verification parameters" }, { status: 400 });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(body.toString())
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      return NextResponse.json({ success: false, error: "Payment verification failed" }, { status: 400 });
    }

    // Determine plan type enum and monthly credits
    let planEnum: Plan;
    let monthlyCredits = 10;
    let amountPaise = 0;

    if (planName === "PRO") {
      planEnum = Plan.PRO;
      monthlyCredits = 500;
      amountPaise = 49900; // ₹499 in paise
    } else if (planName === "AGENCY") {
      planEnum = Plan.AGENCY;
      monthlyCredits = -1; // Unlimited
      amountPaise = 199900; // ₹1999 in paise
    } else {
      planEnum = Plan.FREE;
      monthlyCredits = 10;
      amountPaise = 0;
    }

    const currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Update user's subscription status in database and create payment record in transaction
    await db.$transaction([
      db.user.update({
        where: { id: userId },
        data: {
          plan: planEnum,
          subscriptionStatus: SubscriptionStatus.ACTIVE,
          subscriptionEnd: currentPeriodEnd,
          razorpaySubscriptionId: razorpay_order_id, // Link to order/sub id
          monthlyCredits,
          creditsUsed: 0,
          creditsResetAt: new Date(),
        },
      }),
      db.payment.create({
        data: {
          userId,
          razorpayPaymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
          razorpaySignature: razorpay_signature,
          amount: amountPaise,
          currency: "INR",
          status: PaymentStatus.SUCCESS,
          plan: planEnum,
          billingPeriod: "monthly",
          metadata: { note: "Payment verified successfully on client callback" },
        },
      }),
    ]);

    console.log(`[Razorpay Payment] Successfully verified payment for user ${userId} upgraded to ${planEnum}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Razorpay verification handler error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal verification error" }, { status: 500 });
  }
}
