"use client";

import * as React from "react";
import { useUIStore } from "@/stores/ui-store";
import { useSubscription } from "@/hooks/use-subscription";
import { useUser } from "@/lib/auth";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/constants";
import { Check, Sparkles, Zap, Loader2, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { CoreSpinLoader } from "@/components/ui/core-spin-loader";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function UpgradeModal() {
  const { upgradeModalOpen, setUpgradeModalOpen } = useUIStore();
  const { subscription, refetch } = useSubscription();
  const { user } = useUser();
  const [selectedPlan, setSelectedPlan] = React.useState<"PRO" | "AGENCY">("PRO");
  const [billingPeriod, setBillingPeriod] = React.useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = React.useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      
      const currentUserId = user?.id || "";
      const currentUserName = user?.fullName || "Content Creator";
      const currentUserEmail = user?.emailAddresses?.[0]?.emailAddress || "";

      if (!currentUserId) {
        toast.error("Please sign in to upgrade your plan.");
        return;
      }

      const planInfo = PLANS[selectedPlan];
      const amountRupees = planInfo.price / 100;

      const orderResponse = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountRupees, planName: selectedPlan, userId: currentUserId }),
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
        description: `${planInfo.name} Subscription`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            setLoading(true);
            const verifyResponse = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: currentUserId,
                planName: selectedPlan,
              }),
            });
            const result = await verifyResponse.json();
            if (result.success) {
              setUpgradeModalOpen(false);
              toast.success("Payment successful! Your plan has been upgraded.");
              await refetch();
              window.location.href = "/billing/success";
            } else {
              toast.error("Payment verification failed. Please contact support.");
            }
          } catch (verifyErr) {
            console.error(verifyErr);
            toast.error("Verification failed. Please contact support.");
          } finally {
            setLoading(false);
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
      console.error("Payment error:", error);
      toast.error(error.message || "Failed to initialize payment gateway");
    } finally {
      setLoading(false);
    }
  };

  const plan = PLANS[selectedPlan];

  // Calculate pricing display based on period
  let priceDisplay: string = plan.priceDisplay;
  let periodSuffix = billingPeriod === "yearly" ? "mo, billed yearly" : "mo";
  
  if (billingPeriod === "yearly") {
    const monthlyEquivalent = Math.floor((plan.price / 100) * 0.8);
    priceDisplay = `₹${monthlyEquivalent.toLocaleString("en-IN")}`;
  }

  return (
    <Dialog
      isOpen={upgradeModalOpen}
      onClose={() => setUpgradeModalOpen(false)}
      className="max-w-2xl bg-surface-50 border-glass-border/40 p-0 overflow-hidden"
    >
      <div className="grid grid-cols-1 md:grid-cols-12 overflow-hidden rounded-xl relative">
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-surface-0/80 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6"
            >
              <CoreSpinLoader />
            </motion.div>
          )}
        </AnimatePresence>
        {/* Left Side: Tier selection & checkout */}
        <div className="p-6 md:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="gradient" className="gap-1 font-bold">
                <Sparkles className="h-3 w-3 fill-current" />
                SaaS Upgrade Panel
              </Badge>
            </div>
            
            <h2 className="text-xl font-bold text-text-primary mb-1">Scale Your Content Engine</h2>
            <p className="text-xs text-text-secondary mb-5">Unlock premium tools, higher limits, and priority AI generation.</p>

            {/* Billing Period Selector */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-surface-100/50 border border-glass-border/30 mb-4 select-none">
              <span className="text-[10px] font-bold text-text-secondary uppercase">Billing Cycle</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setBillingPeriod("monthly")}
                  className={cn(
                    "px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer",
                    billingPeriod === "monthly" 
                      ? "bg-surface-200 text-text-primary shadow-xs" 
                      : "text-text-muted hover:text-text-secondary"
                  )}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod("yearly")}
                  className={cn(
                    "px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1",
                    billingPeriod === "yearly" 
                      ? "bg-brand-500 text-white shadow-glow-sm" 
                      : "text-text-muted hover:text-text-secondary"
                  )}
                >
                  Yearly
                  <span className="bg-emerald-500/20 text-emerald-400 px-1 py-0.2 rounded text-[8px] font-extrabold uppercase">
                    -20%
                  </span>
                </button>
              </div>
            </div>

            {/* Selector Toggles */}
            <div className="grid grid-cols-2 gap-2.5 p-1 rounded-lg bg-surface-100/50 border border-glass-border/30 mb-5">
              <button
                type="button"
                onClick={() => setSelectedPlan("PRO")}
                className={`py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  selectedPlan === "PRO"
                    ? "bg-brand-500 text-white shadow-glow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Pro Tier
              </button>
              <button
                type="button"
                onClick={() => setSelectedPlan("AGENCY")}
                className={`py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  selectedPlan === "AGENCY"
                    ? "bg-brand-500 text-white shadow-glow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Agency Tier
              </button>
            </div>

            {/* Price display */}
            <div className="flex items-baseline gap-2 mb-5">
              <span className="text-3xl font-extrabold text-text-primary">{priceDisplay}</span>
              <span className="text-xs text-text-secondary">/{periodSuffix}</span>
            </div>

            {/* Feature lists */}
            <div className="space-y-2.5 mb-6">
              {plan.features.slice(0, 5).map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-text-secondary">
                  <div className="h-4 w-4 rounded-full bg-brand-500/10 border border-brand-500/30 flex items-center justify-center mt-0.5 shrink-0">
                    <Check className="h-2.5 w-2.5 text-brand-400" />
                  </div>
                  <span className="leading-snug">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={handleCheckout}
            isLoading={loading}
            className="w-full h-11 text-white font-bold"
            leftIcon={!loading && <Zap className="h-4 w-4 fill-current" />}
          >
            {loading ? "Connecting Gateway..." : "Secure Upgrade Checkout"}
          </Button>
          <p className="text-[10px] text-center text-text-muted leading-snug mt-3">
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

        {/* Right Side: Visual banner */}
        <div className="md:col-span-5 bg-gradient-hero-subtle p-6 flex flex-col justify-center items-center text-center relative border-l border-glass-border/30 select-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(99,102,241,0.1)_0%,transparent_80%)]" />
          
          <div className="relative z-10 space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-brand-500 to-accent-400 shadow-glow-md mx-auto">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-text-primary">10x Engagement Velocity</h3>
              <p className="text-[10px] text-text-secondary px-2 leading-relaxed">
                Unlock viral score trackers, thumbnail emotional diagnostics, and infinite generations with lightning servers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
