"use client";

import * as React from "react";
import { useUIStore } from "@/stores/ui-store";
import { useSubscription } from "@/hooks/use-subscription";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/constants";
import { Check, Sparkles, Zap, Loader2, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CoreSpinLoader } from "@/components/ui/core-spin-loader";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function UpgradeModal() {
  const { upgradeModalOpen, setUpgradeModalOpen } = useUIStore();
  const { subscription, refetch } = useSubscription();
  const [selectedPlan, setSelectedPlan] = React.useState<"PRO" | "AGENCY">("PRO");
  const [billingPeriod, setBillingPeriod] = React.useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = React.useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      
      // Step 1: Create Stripe checkout session on server
      const response = await fetch("/api/payments/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan, billingPeriod }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const orderData = await response.json();

      // Check if it returned a simulation/mock success directly
      if (orderData.simulated) {
        await refetch();
        setUpgradeModalOpen(false);
        setLoading(false);
        window.location.href = "/billing/success";
        return;
      }

      // Step 2: Redirect to Stripe hosted checkout page
      if (orderData.url) {
        window.location.href = orderData.url;
      } else {
        throw new Error("No checkout URL returned from server");
      }
    } catch (error) {
      console.error("Payment error:", error);
      
      // Fallback for development without API keys
      try {
        const simulateRes = await fetch("/api/payments/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: selectedPlan, billingPeriod, simulate: true }),
        });
        if (simulateRes.ok) {
          await refetch();
          setUpgradeModalOpen(false);
          window.location.href = "/billing/success";
        } else {
          window.location.href = "/billing/failure";
        }
      } catch (e) {
        window.location.href = "/billing/failure";
      }
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
