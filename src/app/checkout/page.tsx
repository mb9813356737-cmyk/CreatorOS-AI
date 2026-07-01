"use client";

import React, { useState } from "react";
import Script from "next/script";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Sparkles, AlertCircle, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}


// Reusable React Wrapper for Razorpay Pre-built Payment Button
function RazorpayPaymentButton() {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;

    // Clear existing children to prevent duplicate buttons during hot reloads
    containerRef.current.innerHTML = "";

    const form = document.createElement("form");
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/payment-button.js";
    script.setAttribute("data-payment_button_id", "pl_T8JhtfA6dZD5hN");
    script.async = true;

    form.appendChild(script);
    containerRef.current.appendChild(form);
  }, []);

  return (
    <div ref={containerRef} className="w-full flex justify-center py-4 bg-surface-200/30 rounded-xl border border-glass-border/10 shadow-inner" />
  );
}

export default function StandardCheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [amountRupees, setAmountRupees] = useState("499");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "failed">("idle");
  const [transactionId, setTransactionId] = useState("");

  const handleStandardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const rupees = parseFloat(amountRupees);
    if (isNaN(rupees) || rupees < 1) {
      toast.error("Please enter a valid amount of at least ₹1.");
      return;
    }

    // Convert to paise (minimum 100 paise)
    const amountPaise = Math.round(rupees * 100);

    try {
      setLoading(true);
      setPaymentStatus("idle");

      // 1. Create order on backend
      const createRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountPaise, currency: "INR" }),
      });

      if (!createRes.ok) {
        const errorData = await createRes.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create payment order");
      }

      const orderData = await createRes.json();
      const { order_id } = orderData;

      // 2. Configure and Open Razorpay standard checkout modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_T8J7DlorSVputK",
        amount: amountPaise,
        currency: "INR",
        name: "CreatorOS AI Checkout",
        description: "Standard Web Payment Gateway",
        order_id: order_id,
        handler: async function (response: any) {
          try {
            setLoading(true);
            
            // 3. Verify payment signature on backend
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              toast.success("Payment verified successfully!");
              setPaymentStatus("success");
              setTransactionId(response.razorpay_payment_id);
            } else {
              throw new Error(verifyData.error || "Signature verification failed");
            }
          } catch (err: any) {
            toast.error(err.message || "Payment verification failed");
            setPaymentStatus("failed");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            toast.info("Payment window was dismissed by the user.");
            setLoading(false);
          },
        },
        prefill: {
          name: "Creator Sandbox",
          email: "sandbox@creatoros.ai",
          contact: "9999999999",
        },
        theme: {
          color: "#7c3aed",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (resp: any) {
        console.error("Payment failed callback:", resp.error);
        toast.error(`Payment failed: ${resp.error.description}`);
        setPaymentStatus("failed");
        setLoading(false);
      });

      rzp.open();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong initiating checkout");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-surface-0 overflow-hidden flex flex-col pt-28">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Glow spotlights */}
      <div className="absolute inset-x-0 top-0 h-[800px] flex items-center justify-center z-0 pointer-events-none opacity-20">
        <div className="absolute left-[-200px] top-0 w-[600px] h-[600px] rounded-full border-[150px] border-brand-500 blur-[120px]" />
        <div className="absolute right-[-200px] top-0 w-[600px] h-[600px] rounded-full border-[150px] border-accent-500 blur-[120px]" />
      </div>

      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 relative z-10 w-full flex flex-col justify-center">
        {/* Header */}
        <div className="text-center space-y-4 mb-10">
          <Badge variant="gradient" className="font-extrabold px-3 py-1 text-xs bg-linear-to-r from-brand-500 to-accent-500 text-white">
            Secure Payment Portal
          </Badge>
          <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
            Razorpay Gateway Sandbox
          </h1>
          <p className="max-w-md mx-auto text-xs text-text-secondary">
            Compare Standard Web overlay modal checkouts and pre-built hosted payment buttons.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Card containing checkout interface */}
          <Card className="border border-glass-border/20 bg-surface-100/50 backdrop-blur-md p-6 flex flex-col justify-between">
          <CardHeader className="p-0 flex flex-row items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-text-primary">Standard Integration Checkout</CardTitle>
              <p className="text-[11px] text-text-muted">Enter the test payment amount to open Razorpay's overlay frame.</p>
            </div>
          </CardHeader>

          <CardContent className="p-0 space-y-6">
            {paymentStatus === "success" && (
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-emerald-400">Payment Processed Successfully</p>
                  <p className="text-text-secondary leading-relaxed">
                    Signature was matched against HMAC-SHA256 expectations. 
                  </p>
                  <p className="text-[10px] text-text-muted">Transaction ID: {transactionId}</p>
                </div>
              </div>
            )}

            {paymentStatus === "failed" && (
              <div className="p-4 rounded-lg bg-error-500/10 border border-error-500/20 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-error-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-error-400">Payment Failed</p>
                  <p className="text-text-secondary leading-relaxed">
                    The payment validation sequence failed. You can attempt checkouts again.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleStandardPayment} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="amount" className="text-xs font-bold text-text-primary uppercase tracking-wide">
                  Payment Amount (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm font-semibold">₹</span>
                  <input
                    type="number"
                    id="amount"
                    value={amountRupees}
                    onChange={(e) => setAmountRupees(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full text-sm bg-surface-200/50 border border-glass-border/20 rounded-lg pl-8 pr-4 py-2.5 text-text-primary focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-text-muted"
                    required
                    min="1"
                    disabled={loading}
                  />
                </div>
                <p className="text-[10px] text-text-muted">
                  Minimum payment is ₹1 (100 paise) as defined by Razorpay.
                </p>
              </div>

              <Button
                type="submit"
                variant="glow"
                className="w-full font-bold flex items-center justify-center gap-2 h-10"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    Connecting Razorpay...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4.5 w-4.5" />
                    Pay with Razorpay
                  </>
                )}
              </Button>
            </form>

            <div className="pt-4 border-t border-glass-border/10 flex items-center justify-between text-[10px] text-text-muted">
              <div className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-brand-400" />
                <span>Test Mode Activated</span>
              </div>
              <span>Secured by Razorpay</span>
            </div>
          </CardContent>
        </Card>

        {/* Card containing the pre-built button script */}
        <Card className="border border-glass-border/20 bg-surface-100/50 backdrop-blur-md p-6 flex flex-col justify-between">
          <div>
            <CardHeader className="p-0 mb-4 flex flex-row items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center text-accent-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-text-primary">Pre-built Payment Button</CardTitle>
                <p className="text-[11px] text-text-muted">Hosted button configuration matching button ID <code>pl_T8JhtfA6dZD5hN</code>.</p>
              </div>
            </CardHeader>

            <CardContent className="p-0 space-y-5">
              <p className="text-xs text-text-secondary leading-relaxed">
                This integration is rendered dynamically using a secure Razorpay javascript loader script inside a React life-cycle portal wrapper. It opens a checkout modal configured on your Razorpay dashboard.
              </p>

              {/* Render Payment Button wrapper component */}
              <RazorpayPaymentButton />
            </CardContent>
          </div>

          <div className="pt-4 border-t border-glass-border/10 flex items-center justify-between text-[10px] text-text-muted mt-6">
            <div className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-accent-400" />
              <span>Button ID: pl_T8JhtfA6dZD5hN</span>
            </div>
            <span>Hosted by Razorpay</span>
          </div>
        </Card>
      </div>
    </main>

      <Footer />
    </div>
  );
}
