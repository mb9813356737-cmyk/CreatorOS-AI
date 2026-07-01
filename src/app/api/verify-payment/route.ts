import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import crypto from "crypto";
import { Plan, SubscriptionStatus, PaymentStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      userId,
      planName
    } = body;

    // Missing fields validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required verification fields" },
        { status: 400 }
      );
    }

    // Signature verification algorithm
    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    if (!secret) {
      return NextResponse.json(
        { error: "Razorpay secret key is not configured on the server." },
        { status: 500 }
      );
    }

    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(text)
      .digest("hex");

    const signaturesMatch = generatedSignature === razorpay_signature;

    if (!signaturesMatch) {
      return NextResponse.json(
        { error: "Payment signature mismatch verification failed" },
        { status: 400 }
      );
    }

    // Prevent duplicate activations for the same payment transaction
    const existingPayment = await db.payment.findUnique({
      where: { razorpayPaymentId: razorpay_payment_id },
    });

    if (existingPayment && existingPayment.status === PaymentStatus.SUCCESS) {
      console.log(`[Verify API] Payment ${razorpay_payment_id} already processed. Skipping duplicate update.`);
      return NextResponse.json({ success: true });
    }

    // If userId and planName are provided, upgrade subscription
    if (userId && planName) {
      let planEnum: Plan;
      let monthlyCredits = 10;
      let amountPaise = 0;

      if (planName === "PRO") {
        planEnum = Plan.PRO;
        monthlyCredits = 500;
        amountPaise = 49900;
      } else if (planName === "AGENCY") {
        planEnum = Plan.AGENCY;
        monthlyCredits = -1;
        amountPaise = 199900;
      } else {
        planEnum = Plan.FREE;
        monthlyCredits = 10;
        amountPaise = 0;
      }

      const currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await db.$transaction([
        db.user.update({
          where: { id: userId },
          data: {
            plan: planEnum,
            subscriptionStatus: SubscriptionStatus.ACTIVE,
            subscriptionEnd: currentPeriodEnd,
            razorpaySubscriptionId: razorpay_order_id,
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

      console.log(`[Verify API] Successfully verified and upgraded user ${userId} to ${planEnum}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Razorpay standard verify signature error:", error);
    return NextResponse.json(
      { error: error.message || "Internal verification error" },
      { status: 500 }
    );
  }
}
