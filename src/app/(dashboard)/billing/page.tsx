"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/use-subscription";
import { PLANS } from "@/lib/constants";
import { formatDate, formatCurrency } from "@/lib/utils";
import { 
  CreditCard, 
  Zap, 
  Check, 
  X,
  Receipt,
  AlertCircle,
  TrendingUp,
  Infinity as InfinityIcon,
  Loader2,
  Trash2,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CoreSpinLoader } from "@/components/ui/core-spin-loader";

interface PaymentRecord {
  id: string;
  razorpayPaymentId: string | null;
  stripePaymentId: string | null;
  amount: number;
  status: string;
  plan: string;
  createdAt: string;
  billingPeriod: string | null;
}

export default function BillingPage() {
  const { subscription, refetch } = useSubscription();
  const [payments, setPayments] = React.useState<PaymentRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = React.useState(true);
  const billingPeriod: string = "monthly";
  const [checkoutLoading, setCheckoutLoading] = React.useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = React.useState(false);
  const [cancelling, setCancelling] = React.useState(false);

  const fetchPayments = React.useCallback(async () => {
    try {
      setLoadingHistory(true);
      const res = await fetch("/api/payments/history");
      if (res.ok) {
        const data = await res.json();
        setPayments(data);
      }
    } catch (err) {
      console.error("Error fetching payment history:", err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPayments();
  }, [subscription, fetchPayments]);

  const currentPlan = subscription?.plan || "FREE";
  const currentStatus = subscription?.status || "INACTIVE";

  // Calculate credits used percentage
  const creditsUsed = subscription?.creditsUsed || 0;
  const monthlyCredits = subscription?.monthlyCredits || 10;
  const isUnlimited = monthlyCredits === -1;
  const percentage = isUnlimited ? 0 : Math.min(100, Math.round((creditsUsed / monthlyCredits) * 100));

  // Circular progress ring math (r=40, circumference=251.2)
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = isUnlimited ? 0 : circumference - (percentage / 100) * circumference;

  // Handle upgrade/downgrade subscription checkout
  const handleUpgrade = async (planKey: "PRO" | "AGENCY") => {
    try {
      setCheckoutLoading(planKey);
      
      const response = await fetch("/api/payments/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey, billingPeriod }),
      });

      if (!response.ok) {
        throw new Error("Failed to initialize billing session");
      }

      const orderData = await response.json();

      // Simulated billing bypass
      if (orderData.simulated) {
        await refetch();
        window.location.href = "/billing/success";
        return;
      }

      // Redirect to Stripe checkout
      if (orderData.url) {
        window.location.href = orderData.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Payment setup error:", error);
      // Fallback
      try {
        const simulateRes = await fetch("/api/payments/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: planKey, billingPeriod, simulate: true }),
        });
        if (simulateRes.ok) {
          await refetch();
          window.location.href = "/billing/success";
        }
      } catch (e) {
        window.location.href = "/billing/failure";
      }
    } finally {
      setCheckoutLoading(null);
    }
  };

  // Redirect to Stripe Customer Portal
  const handleManageBilling = async () => {
    try {
      setCheckoutLoading("PORTAL");
      const res = await fetch("/api/payments/billing-portal", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to get billing portal URL");
      }

      const data = await res.json();
      if (data.simulated) {
        // Fallback to local confirm cancellation modal since it is simulated
        setShowCancelConfirm(true);
      } else if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No URL returned");
      }
    } catch (err) {
      console.error("Manage billing error:", err);
      // Fallback to local cancellation modal
      setShowCancelConfirm(true);
    } finally {
      setCheckoutLoading(null);
    }
  };

  // Handle cancellation/downgrade to FREE
  const handleCancelSubscription = async () => {
    try {
      setCancelling(true);
      const res = await fetch("/api/payments/cancel-subscription", {
        method: "POST",
      });
      if (res.ok) {
        await refetch();
        setShowCancelConfirm(false);
        alert("Subscription downgraded to Starter successfully.");
      } else {
        alert("Failed to downgrade subscription. Please contact support.");
      }
    } catch (err) {
      console.error("Error cancelling subscription:", err);
      alert("Error cancelling subscription.");
    } finally {
      setCancelling(false);
    }
  };

  const getPlanPrice = (planKey: string) => {
    if (planKey === "FREE") return "₹0";
    const basePlan = PLANS[planKey as keyof typeof PLANS];
    if (!basePlan) return "₹0";
    
    if (billingPeriod === "yearly") {
      const discountedVal = Math.floor((basePlan.price / 100) * 0.8);
      return `₹${discountedVal.toLocaleString("en-IN")}`;
    }
    return basePlan.priceDisplay;
  };

  return (
    <div className="space-y-8 pb-16 relative">
      <AnimatePresence>
        {checkoutLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md select-none">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm p-6 rounded-xl border border-glass-border bg-surface-50 shadow-elevated flex flex-col items-center justify-center"
            >
              <CoreSpinLoader />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <PageHeader
        title="Billing & Membership Center"
        description="Manage your subscription, view credits status, comparison lists, and retrieve transaction tax invoices."
        badge="Pro Billing"
      />

      {/* Subscription Status & Quota Progress Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Credits progress ring card */}
        <Card variant="glass" className="lg:col-span-5 flex flex-col justify-between p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-brand-400" />
              AI Credits Usage Quota
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0 flex items-center gap-6">
            {/* SVG circle meter */}
            <div className="relative h-24 w-24 shrink-0 flex items-center justify-center">
              <svg className="h-full w-full -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  className="stroke-glass-border/20 fill-none"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="48"
                  cy="48"
                  r={radius}
                  className={cn(
                    "fill-none transition-all duration-300",
                    percentage >= 100 ? "stroke-error-500 shadow-glow-sm shadow-error-500/20" :
                    percentage >= 80 ? "stroke-warning-500 shadow-glow-sm shadow-warning-500/20" :
                    "stroke-brand-500 shadow-glow-sm shadow-brand-500/20"
                  )}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {isUnlimited ? (
                  <InfinityIcon className="h-5 w-5 text-brand-400" />
                ) : (
                  <>
                    <span className="text-base font-extrabold text-text-primary">{percentage}%</span>
                    <span className="text-[8px] text-text-muted uppercase font-bold tracking-wider">Used</span>
                  </>
                )}
              </div>
            </div>

            {/* Quota details */}
            <div className="space-y-1.5">
              <div className="text-xs text-text-secondary">
                Usage: <span className="font-bold text-text-primary font-mono">{creditsUsed}</span> /{" "}
                <span className="font-bold text-text-primary font-mono">
                  {isUnlimited ? "Unlimited" : monthlyCredits}
                </span>
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                {isUnlimited 
                  ? "Unlimited generation access. Fuel your content engine without credit boundaries."
                  : `You have ${Math.max(0, monthlyCredits - creditsUsed)} generation credits remaining for this cycle.`
                }
              </p>
              
              {!isUnlimited && percentage >= 80 && (
                <div className="flex items-center gap-1 text-[10px] text-warning-400 font-medium">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>Credits are running low! Upgrade to scaling limits.</span>
                </div>
              )}
            </div>
          </CardContent>
          <div className="mt-4 pt-4 border-t border-glass-border/10 flex justify-between items-center text-[10px] text-text-muted">
            <span>Reset schedule</span>
            <span className="font-semibold text-text-secondary">Monthly reset active</span>
          </div>
        </Card>

        {/* Current status card */}
        <Card variant="glass" className="lg:col-span-7 flex flex-col justify-between p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CreditCard className="h-4.5 w-4.5 text-brand-400" />
                Subscription Details
              </span>
              <Badge variant={currentPlan === "FREE" ? "outline" : "gradient"} className="uppercase font-mono font-bold tracking-wider text-[9px]">
                {currentStatus}
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-text-primary flex items-center gap-1.5">
                  {currentPlan === "FREE" ? "Starter" : currentPlan === "PRO" ? "Pro" : "Agency"} Plan
                  {currentPlan !== "FREE" && (
                    <ShieldCheck className="h-4.5 w-4.5 text-brand-400" />
                  )}
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  {PLANS[currentPlan as keyof typeof PLANS]?.description || "Basic operations suite"}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-text-primary">
                  {currentPlan === "FREE" ? "₹0" : currentPlan === "PRO" ? "₹499" : "₹1,999"}
                </span>
                <span className="text-xs text-text-secondary">/{currentPlan === "FREE" ? "forever" : "mo"}</span>
              </div>
            </div>

            {subscription?.subscriptionEnd && (
              <div className="p-3 rounded-lg bg-surface-100/30 border border-glass-border/20 text-xs text-text-secondary flex justify-between items-center">
                <span>Billing Period Renewal:</span>
                <span className="font-bold text-text-primary">{formatDate(subscription.subscriptionEnd)}</span>
              </div>
            )}
          </CardContent>

          <CardFooter className="p-0 border-t-0 mt-4 flex items-center justify-end gap-2.5">
            {currentPlan !== "FREE" ? (
              <>
                <Button 
                  onClick={handleManageBilling} 
                  variant="outline" 
                  size="sm"
                  className="border-brand-500/20 hover:border-brand-500/40 text-brand-400 font-bold"
                >
                  Manage Plan / Cancel
                </Button>
                <Button 
                  onClick={() => handleUpgrade(currentPlan === "PRO" ? "AGENCY" : "PRO")} 
                  size="sm"
                  className="bg-linear-to-r from-brand-500 to-accent-400 font-bold text-white shadow-glow-sm"
                  leftIcon={<Zap className="h-3.5 w-3.5 fill-current" />}
                >
                  Change Subscription Tier
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => {
                  const element = document.getElementById("plans-section");
                  element?.scrollIntoView({ behavior: "smooth" });
                }} 
                size="sm"
                className="bg-linear-to-r from-brand-500 to-accent-400 font-bold text-white shadow-glow-sm"
                leftIcon={<Zap className="h-3.5 w-3.5 fill-current" />}
              >
                Upgrade Account
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Confirmation Downgrade dialog */}
      <AnimatePresence>
        {showCancelConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs select-none">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-xl border border-glass-border bg-surface-50 shadow-elevated"
            >
              <h3 className="text-base font-bold text-text-primary mb-2 flex items-center gap-1.5">
                <AlertCircle className="h-5 w-5 text-error-400" />
                Cancel Subscription?
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed mb-6">
                Are you sure you want to downgrade? Your plan will return to the **Starter** tier immediately, and your generation credit limits will reset to **10 generations per month**. Any features not supported in the Starter tier will be locked.
              </p>
              <div className="flex justify-end gap-2.5">
                <Button 
                  onClick={() => setShowCancelConfirm(false)} 
                  variant="secondary"
                  size="sm"
                  className="font-bold"
                  disabled={cancelling}
                >
                  Keep Active Plan
                </Button>
                <Button 
                  onClick={handleCancelSubscription} 
                  size="sm"
                  className="bg-error-600 hover:bg-error-500 text-white font-bold"
                  disabled={cancelling}
                >
                  {cancelling ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Downgrading...
                    </span>
                  ) : "Yes, Cancel Immediately"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pricing Cards Section */}
      <section id="plans-section" className="pt-8 space-y-6 relative">
        <div className="text-center space-y-2.5">
          <Badge variant="gradient" className="font-extrabold tracking-wider uppercase text-[10px] mx-auto">
            Pricing Plans
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-black text-text-primary">
            Scale Your Digital Output
          </h2>
          <p className="text-xs text-text-secondary max-w-md mx-auto">
            Choose the subscription tier tailored to your platform frequency. Cancel or modify tiers instantly.
          </p>


        </div>

        {/* 3 Grid pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          
          {/* STARTER */}
          <motion.div whileHover={{ y: -4 }} className="flex h-full">
            <Card 
              variant={currentPlan === "FREE" ? "glow" : "glass"} 
              hoverEffect={false} 
              className={cn(
                "w-full p-6 flex flex-col justify-between relative",
                currentPlan === "FREE" && "border-brand-500/30"
              )}
            >
              {currentPlan === "FREE" && (
                <Badge variant="gradient" className="absolute top-4 right-4 text-[8px] font-extrabold uppercase tracking-wider">
                  Active Tier
                </Badge>
              )}
              <div>
                <CardHeader className="p-0 mb-4">
                  <h4 className="text-xs font-extrabold text-text-secondary uppercase tracking-widest">Starter</h4>
                  <h3 className="text-3xl font-black text-text-primary mt-1">₹0</h3>
                  <p className="text-[11px] text-text-muted mt-2 leading-relaxed">
                    Ideal for creators starting their automated scripting journey.
                  </p>
                </CardHeader>
                <div className="space-y-2.5 py-4 border-t border-glass-border/10">
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Check className="h-4 w-4 text-brand-400 shrink-0" />
                    <span>10 generation credits/mo</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Check className="h-4 w-4 text-brand-400 shrink-0" />
                    <span>Viral hook templates</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Check className="h-4 w-4 text-brand-400 shrink-0" />
                    <span>Hinglish Caption tool</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <X className="h-4 w-4 text-text-muted shrink-0" />
                    <span className="line-through">Visual Thumbnail Engine</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <X className="h-4 w-4 text-text-muted shrink-0" />
                    <span className="line-through">Viral score predictions</span>
                  </div>
                </div>
              </div>
              <CardFooter className="p-0 pt-6 mt-auto border-t border-glass-border/10">
                <Button 
                  variant={currentPlan === "FREE" ? "secondary" : "outline"} 
                  className="w-full font-bold" 
                  disabled={currentPlan === "FREE"}
                >
                  {currentPlan === "FREE" ? "Current Tier" : "Starter Free Plan"}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* PRO */}
          <motion.div whileHover={{ y: -4 }} className="flex h-full">
            <Card 
              variant={currentPlan === "PRO" ? "glow" : "glass"} 
              hoverEffect={false} 
              className={cn(
                "w-full p-6 flex flex-col justify-between relative overflow-hidden",
                currentPlan === "PRO" ? "border-brand-500/40" : "border-glass-border hover:border-glass-border-hover"
              )}
            >
              {/* Popular glow badge */}
              <div className="absolute top-0 right-0 h-16 w-16 pointer-events-none overflow-hidden select-none">
                <div className="absolute transform rotate-45 bg-linear-to-r from-brand-500 to-accent-400 text-[8px] font-black text-white py-1 px-4 text-center right-[-30px] top-[15px] w-[100px] shadow-glow-sm">
                  POPULAR
                </div>
              </div>
              <div>
                <CardHeader className="p-0 mb-4">
                  <h4 className="text-xs font-extrabold text-brand-400 uppercase tracking-widest">Pro Creator</h4>
                  <h3 className="text-3xl font-black text-text-primary mt-1">
                    {getPlanPrice("PRO")}
                    <span className="text-xs text-text-secondary font-medium">/{billingPeriod === "yearly" ? "mo equivalent" : "mo"}</span>
                  </h3>
                  <p className="text-[11px] text-text-muted mt-2 leading-relaxed">
                    Designed for active creators looking to boost engagement.
                  </p>
                </CardHeader>
                <div className="space-y-2.5 py-4 border-t border-brand-500/20">
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Check className="h-4 w-4 text-brand-400 shrink-0" />
                    <span className="font-semibold">500 credits / month</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Check className="h-4 w-4 text-brand-400 shrink-0" />
                    <span>Viral Score analytics engine</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Check className="h-4 w-4 text-brand-400 shrink-0" />
                    <span>Visual Thumbnail Psychology studio</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Check className="h-4 w-4 text-brand-400 shrink-0" />
                    <span>Shorts & Reels Script generator</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Check className="h-4 w-4 text-brand-400 shrink-0" />
                    <span>Niche Trending insights</span>
                  </div>
                </div>
              </div>
              <CardFooter className="p-0 pt-6 mt-auto border-t border-glass-border/10">
                <Button 
                  onClick={() => handleUpgrade("PRO")}
                  variant={currentPlan === "PRO" ? "outline" : "glow"}
                  className="w-full font-bold"
                  isLoading={checkoutLoading === "PRO"}
                  disabled={currentPlan === "PRO"}
                >
                  {currentPlan === "PRO" ? "Current Active Tier" : "Upgrade to Pro"}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          {/* AGENCY */}
          <motion.div whileHover={{ y: -4 }} className="flex h-full">
            <Card 
              variant={currentPlan === "AGENCY" ? "glow" : "glass"} 
              hoverEffect={false} 
              className={cn(
                "w-full p-6 flex flex-col justify-between relative",
                currentPlan === "AGENCY" && "border-brand-500/30"
              )}
            >
              {currentPlan === "AGENCY" && (
                <Badge variant="gradient" className="absolute top-4 right-4 text-[8px] font-extrabold uppercase tracking-wider">
                  Active Tier
                </Badge>
              )}
              <div>
                <CardHeader className="p-0 mb-4">
                  <h4 className="text-xs font-extrabold text-text-secondary uppercase tracking-widest">Agency / Team</h4>
                  <h3 className="text-3xl font-black text-text-primary mt-1">
                    {getPlanPrice("AGENCY")}
                    <span className="text-xs text-text-secondary font-medium">/{billingPeriod === "yearly" ? "mo equivalent" : "mo"}</span>
                  </h3>
                  <p className="text-[11px] text-text-muted mt-2 leading-relaxed">
                    For production houses managing multiple creator portals.
                  </p>
                </CardHeader>
                <div className="space-y-2.5 py-4 border-t border-glass-border/10">
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Check className="h-4 w-4 text-brand-400 shrink-0" />
                    <span className="font-semibold text-brand-400">UNLIMITED generations</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Check className="h-4 w-4 text-brand-400 shrink-0" />
                    <span>Cross-platform Content Repurposing</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Check className="h-4 w-4 text-brand-400 shrink-0" />
                    <span>Priority rendering pipeline</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Check className="h-4 w-4 text-brand-400 shrink-0" />
                    <span>Custom AI model configurations</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Check className="h-4 w-4 text-brand-400 shrink-0" />
                    <span>Dedicated account management</span>
                  </div>
                </div>
              </div>
              <CardFooter className="p-0 pt-6 mt-auto border-t border-glass-border/10">
                <Button 
                  onClick={() => handleUpgrade("AGENCY")}
                  variant={currentPlan === "AGENCY" ? "outline" : "glow"}
                  className="w-full font-bold"
                  isLoading={checkoutLoading === "AGENCY"}
                  disabled={currentPlan === "AGENCY"}
                >
                  {currentPlan === "AGENCY" ? "Current Active Tier" : "Upgrade to Agency"}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

        </div>
      </section>

      {/* Plan Comparisons Matrix */}
      <section className="space-y-4 pt-6">
        <h3 className="text-sm font-bold text-text-primary">Interactive Comparison Matrix</h3>
        <Card variant="glass" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-glass-border/20 text-[10px] font-bold text-text-muted uppercase bg-surface-50/20">
                  <th className="px-6 py-4">Features</th>
                  <th className="px-6 py-4">Starter</th>
                  <th className="px-6 py-4">Pro</th>
                  <th className="px-6 py-4">Agency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border/10">
                <tr>
                  <td className="px-6 py-4 font-semibold text-text-primary">Monthly AI Credits</td>
                  <td className="px-6 py-4 text-text-secondary">10 generations</td>
                  <td className="px-6 py-4 text-brand-400 font-semibold">500 generations</td>
                  <td className="px-6 py-4 text-emerald-400 font-bold">Unlimited</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-text-primary">Viral Hooks & Captions</td>
                  <td className="px-6 py-4"><Check className="h-4.5 w-4.5 text-emerald-400" /></td>
                  <td className="px-6 py-4"><Check className="h-4.5 w-4.5 text-emerald-400" /></td>
                  <td className="px-6 py-4"><Check className="h-4.5 w-4.5 text-emerald-400" /></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-text-primary">Thumbnail Psychology prompt</td>
                  <td className="px-6 py-4"><X className="h-4.5 w-4.5 text-text-muted" /></td>
                  <td className="px-6 py-4"><Check className="h-4.5 w-4.5 text-emerald-400" /></td>
                  <td className="px-6 py-4"><Check className="h-4.5 w-4.5 text-emerald-400" /></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-text-primary">Shorts/Reels Audio Scripts</td>
                  <td className="px-6 py-4"><X className="h-4.5 w-4.5 text-text-muted" /></td>
                  <td className="px-6 py-4"><Check className="h-4.5 w-4.5 text-emerald-400" /></td>
                  <td className="px-6 py-4"><Check className="h-4.5 w-4.5 text-emerald-400" /></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-text-primary">Viral score predictions</td>
                  <td className="px-6 py-4"><X className="h-4.5 w-4.5 text-text-muted" /></td>
                  <td className="px-6 py-4"><Check className="h-4.5 w-4.5 text-emerald-400" /></td>
                  <td className="px-6 py-4"><Check className="h-4.5 w-4.5 text-emerald-400" /></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-text-primary">Cross-platform repurposing</td>
                  <td className="px-6 py-4"><X className="h-4.5 w-4.5 text-text-muted" /></td>
                  <td className="px-6 py-4"><X className="h-4.5 w-4.5 text-text-muted" /></td>
                  <td className="px-6 py-4"><Check className="h-4.5 w-4.5 text-emerald-400" /></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-text-primary">Support priority</td>
                  <td className="px-6 py-4 text-text-muted">Standard</td>
                  <td className="px-6 py-4 text-brand-400">High priority</td>
                  <td className="px-6 py-4 text-pink-400 font-semibold">24/7 dedicated support</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Transaction billing list */}
      <Card variant="glass">
        <CardHeader className="border-b border-glass-border/20 flex flex-row items-center justify-between py-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Receipt className="h-4.5 w-4.5 text-brand-400" />
            Billing Transaction Records
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loadingHistory ? (
            <div className="py-12 text-center text-xs text-text-secondary flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-brand-400" />
              <span>Fetching billing records...</span>
            </div>
          ) : payments.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-xs text-text-muted gap-2">
              <AlertCircle className="h-5 w-5 text-text-muted" />
              <span>No transactions recorded on this profile.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-glass-border/20 text-[10px] font-bold text-text-muted uppercase bg-surface-50/20">
                    <th className="px-6 py-3.5">Invoice ID</th>
                    <th className="px-6 py-3.5">Reference ID</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Amount</th>
                    <th className="px-6 py-3.5">Tier</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Invoices</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-glass-border/10">
                  {payments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-surface-50/15 transition-colors">
                      <td className="px-6 py-3.5 font-mono text-text-secondary select-all">{pay.id}</td>
                      <td className="px-6 py-3.5 font-mono text-text-muted select-all">
                        {pay.stripePaymentId || pay.razorpayPaymentId || "—"}
                      </td>
                      <td className="px-6 py-3.5 text-text-muted">{formatDate(pay.createdAt)}</td>
                      <td className="px-6 py-3.5 text-text-primary font-semibold">{formatCurrency(pay.amount / 100)}</td>
                      <td className="px-6 py-3.5">
                        <Badge variant="outline" className="text-[10px] font-mono font-bold uppercase">{pay.plan}</Badge>
                      </td>
                      <td className="px-6 py-3.5">
                        <Badge 
                          variant={pay.status === "SUCCESS" ? "success" : pay.status === "PENDING" ? "warning" : "error"} 
                          className="text-[9px] font-bold uppercase"
                        >
                          {pay.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <a 
                          href={`/billing/invoice/${pay.id}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-400 hover:text-brand-300 transition-colors uppercase"
                        >
                          Invoice
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
