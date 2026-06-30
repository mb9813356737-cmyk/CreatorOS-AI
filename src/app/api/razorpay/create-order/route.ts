import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { db } from "@/lib/prisma";
import Razorpay from "razorpay";
import { handleRouteError } from "@/lib/errors";

// Avoid throwing module-level error during static analysis or build steps when environment variables are unset.
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "mock_key_id",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "mock_key_secret",
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Razorpay API keys are not configured.");
      return NextResponse.json({ error: "Razorpay integration is not configured on the server." }, { status: 500 });
    }

    const { amount, currency = "INR", planName } = await req.json();

    if (!amount || !planName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify user exists in database
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create the Razorpay Order
    const order = await razorpay.orders.create({
      amount: amount * 100, // amount in paise
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: { 
        planName, 
        userId: user.id 
      },
    });

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error("Razorpay create order error:", error);
    return handleRouteError(error, "Failed to initialize payment order");
  }
}
