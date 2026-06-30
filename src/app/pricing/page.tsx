"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/layout/footer";
import { PLANS } from "@/lib/constants";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, ShieldCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/lib/auth";
import { toast } from "sonner";

export default function PricingPage() {
  const { user, isLoaded } = useUser();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const handleSubscribe = async (planKey: "PRO" | "AGENCY") => {
    if (planKey === "PRO") {
      toast.info("You're being redirected to our secure Razorpay checkout page to complete your CreatorOS AI Pro subscription for ₹499/month.", {
        duration: 3000,
      });
      setTimeout(() => {
        window.location.href = "https://pages.razorpay.com/pl_T7yLK4DuFCDewU/view#";
      }, 2000);
      return;
    }

    if (planKey === "AGENCY") {
      toast.info("You're being redirected to our secure Razorpay checkout to subscribe to the CreatorOS AI Agency Plan for ₹2000/month.", {
        duration: 3000,
      });
      setTimeout(() => {
        window.location.href = "https://pages.razorpay.com/pl_T7yfrNWglBrFGh/view";
      }, 2000);
      return;
    }

    if (!isLoaded) return;

    if (!user) {
      toast.info("Please sign in or create an account to subscribe.");
      window.location.href = `/sign-in?redirect_url=${encodeURIComponent(window.location.href)}`;
      return;
    }

    try {
      setCheckoutLoading(planKey);
      
      const currentUserId = user.id;
      const currentUserName = user.fullName || "Content Creator";
      const currentUserEmail = user.emailAddresses?.[0]?.emailAddress || "";

      const plan = PLANS[planKey as "PRO" | "AGENCY"];
      const amountRupees = plan.price / 100;

      const orderResponse = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountRupees, planName: planKey, userId: currentUserId }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create payment order");
      }

      const { order } = await orderResponse.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "CreatorOS AI",
        description: `${plan.name} Subscription`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            setCheckoutLoading(planKey);
            const verifyResponse = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: currentUserId,
                planName: planKey,
              }),
            });
            const result = await verifyResponse.json();
            if (result.success) {
              toast.success("Payment successful! Your plan has been upgraded.");
              window.location.href = "/billing/success";
            } else {
              toast.error("Payment verification failed. Please contact support.");
            }
          } catch (verifyErr) {
            console.error(verifyErr);
            toast.error("Verification failed. Please contact support.");
          } finally {
            setCheckoutLoading(null);
          }
        },
        prefill: {
          name: currentUserName,
          email: currentUserEmail,
        },
        theme: {
          color: "#7C3AED",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error("Payment setup error:", error);
      toast.error(error.message || "Failed to initialize payment gateway");
    } finally {
      setCheckoutLoading(null);
    }
  };

  const plans = Object.entries(PLANS).map(([key, plan]) => {
    let priceDisplay: string = plan.priceDisplay;
    let period = "mo";

    if (key === "FREE") {
      priceDisplay = "₹0";
      period = "forever";
    }

    return {
      key,
      ...plan,
      priceDisplay,
      period,
    };
  });

  return (
    <div className="relative min-h-screen bg-surface-0 overflow-hidden flex flex-col pt-28">
      {/* Background spotlights */}
      <div className="absolute inset-x-0 top-0 h-[800px] flex items-center justify-center z-0 pointer-events-none opacity-20 overflow-hidden">
        <div
          className="absolute left-[-200px] top-0 w-[600px] h-[600px] rounded-full"
          style={{
            border: "150px solid #6366f1",
            filter: "blur(120px)",
          }}
        />
        <div
          className="absolute right-[-200px] top-0 w-[600px] h-[600px] rounded-full"
          style={{
            border: "150px solid #a855f7",
            filter: "blur(120px)",
          }}
        />
      </div>

      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 relative z-10 w-full flex flex-col justify-center">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <Badge variant="gradient" className="font-extrabold px-3 py-1 text-xs bg-linear-to-r from-pink-500 to-accent-500 text-white">
            Pricing
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold text-text-primary tracking-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="max-w-xl mx-auto text-sm md:text-base text-text-secondary">
            Get instant access to state-of-the-art AI templates built specifically for Indian creators. Cancel or upgrade anytime.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-12">
          {plans.map((plan) => {
            const isPopular = plan.key === "PRO";
            const isAgency = plan.key === "AGENCY";
            const loading = checkoutLoading === plan.key;

            return (
              <Card
                key={plan.key}
                className={cn(
                  "w-full flex flex-col justify-between p-6 border transition-all duration-300 relative",
                  isPopular 
                    ? "border-accent-500/40 bg-accent-950/5 shadow-glow-cyan" 
                    : "border-glass-border hover:border-glass-border-hover shadow-elevated",
                  "hover:translate-y-[-4px] bg-surface-100/50 backdrop-blur-md"
                )}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-linear-to-r from-brand-500 to-accent-500 text-white font-extrabold text-[8px] uppercase tracking-wider shadow-glow-sm">
                    <Sparkles className="h-2.5 w-2.5 fill-current animate-pulse text-white" />
                    Popular
                  </div>
                )}

                <div>
                  <CardHeader className="p-0 mb-6">
                    <h3 className="text-base font-bold text-text-primary uppercase tracking-widest">{plan.name}</h3>
                    <p className="text-xs text-text-secondary leading-relaxed mt-1">{plan.description}</p>
                  </CardHeader>

                  <div className="flex items-baseline gap-1.5 mb-8">
                    <span className="text-4xl font-extrabold text-text-primary tracking-tight">
                      {plan.priceDisplay}
                    </span>
                    <span className="text-xs text-text-secondary">/{plan.period}</span>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-3.5 mb-8">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-text-secondary">
                        <div className={cn(
                          "h-4.5 w-4.5 rounded-full flex items-center justify-center mt-0.5 shrink-0",
                          isPopular
                            ? "bg-accent-500/10 border border-accent-500/20"
                            : "bg-brand-500/10 border border-brand-500/20"
                        )}>
                          <Check className={cn("h-3 w-3", isPopular ? "text-accent-400" : "text-brand-400")} />
                        </div>
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <CardFooter className="p-0 mt-auto pt-6 border-t border-glass-border/20">
                  {plan.key === "FREE" ? (
                    <Link href="/dashboard" className="w-full">
                      <Button variant="secondary" size="md" className="w-full font-bold shadow-sm">
                        Get Started Free
                      </Button>
                    </Link>
                  ) : (
                    <div className="w-full flex flex-col gap-3">
                      <Button
                        variant={isPopular ? "glow" : "secondary"}
                        size="md"
                        className="w-full font-bold shadow-sm"
                        disabled={loading}
                        onClick={() => handleSubscribe(plan.key as "PRO" | "AGENCY")}
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                        ) : (
                          `Subscribe to ${plan.name}`
                        )}
                      </Button>
                      <p className="text-[10px] text-center text-text-muted leading-snug">
                        By subscribing you agree to our{" "}
                        <Link href="/terms-and-conditions" className="underline hover:text-text-primary transition-colors">
                          Terms & Conditions
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy-policy" className="underline hover:text-text-primary transition-colors">
                          Privacy Policy
                        </Link>
                        .
                      </p>
                    </div>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="text-center space-y-3 bg-surface-100/30 border border-glass-border/20 rounded-xl p-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-brand-400 font-semibold text-xs">
            <ShieldCheck className="h-4 w-4" />
            <span>Secure Checkout with Razorpay</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            All payments are securely processed via Razorpay. Prices are inclusive of applicable taxes. Recurring monthly subscriptions can be self-cancelled anytime from your Billing settings dashboard.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
