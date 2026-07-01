"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Sparkles, ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useSubscription } from "@/hooks/use-subscription";

export default function PaymentSuccessPage() {
  const { subscription, refetch } = useSubscription();

  React.useEffect(() => {
    // Refresh subscription status to load the newly updated tier immediately
    refetch();
  }, [refetch]);

  const activePlan = subscription?.plan || "PRO";

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-brand-500/10 rounded-full filter blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-pink-500/10 rounded-full filter blur-[80px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        <Card variant="glow" hoverEffect={false} className="border-brand-500/30 overflow-hidden relative">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-linear-to-r from-brand-500 via-pink-500 to-emerald-500" />
          
          <CardHeader className="text-center pt-8 pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.15 }}
              className="h-16 w-16 mx-auto bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mb-4 shadow-glow-sm shadow-emerald-500/20"
            >
              <CheckCircle2 className="h-9 w-9 text-emerald-400" />
            </motion.div>

            <Badge variant="gradient" className="font-extrabold text-[10px] tracking-wider uppercase mb-2 mx-auto gap-1">
              <Sparkles className="h-3 w-3 fill-current" />
              Order Activated
            </Badge>

            <CardTitle className="text-2xl md:text-3xl font-extrabold tracking-tight text-text-primary">
              {activePlan === "PRO" 
                ? "🎉 Payment Successful!" 
                : activePlan === "AGENCY" 
                  ? "🚀 Payment Successful!" 
                  : "Payment Successful!"}
            </CardTitle>
            <p className="text-xs text-text-secondary mt-1.5 max-w-sm mx-auto leading-relaxed font-semibold">
              {activePlan === "PRO" 
                ? "Your Pro Plan has been activated. All Pro features are now unlocked and ready to use." 
                : activePlan === "AGENCY" 
                  ? "Your Agency Plan has been activated. All Agency features are now unlocked and available for use." 
                  : `Your account is now upgraded to ${activePlan}.`}
            </p>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            <div className="p-4 rounded-lg bg-surface-100/50 border border-glass-border/30 divide-y divide-glass-border/10 text-xs">
              <div className="flex justify-between py-2.5">
                <span className="text-text-secondary">Plan Level</span>
                <span className="font-bold text-text-primary uppercase tracking-wide">{activePlan}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-text-secondary">Subscription Status</span>
                <span className="font-bold text-emerald-400">ACTIVE</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-text-secondary">Credits Provisioned</span>
                <span className="font-bold text-text-primary">
                  {subscription?.monthlyCredits === -1 ? "Unlimited" : subscription?.monthlyCredits || "500"}
                </span>
              </div>
              {subscription?.subscriptionEnd && (
                <div className="flex justify-between py-2.5">
                  <span className="text-text-secondary">Next Renewal Date</span>
                  <span className="font-medium text-text-secondary">
                    {new Date(subscription.subscriptionEnd).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>

            <div className="text-center py-2">
              <p className="text-[11px] text-text-muted leading-relaxed">
                Need details for taxation or records? You can review your transactions and download printable invoices anytime in the billing center.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6">
            <Link href="/dashboard" className="w-full sm:flex-1">
              <Button className="w-full font-bold bg-linear-to-r from-brand-600 to-pink-600 hover:from-brand-500 hover:to-pink-500">
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/billing" className="w-full sm:flex-1">
              <Button variant="secondary" className="w-full font-bold">
                View Billing Center
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
