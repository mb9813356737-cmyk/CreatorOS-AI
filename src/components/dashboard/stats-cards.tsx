"use client";

import { useSubscription } from "@/hooks/use-subscription";
import { useUsage } from "@/hooks/use-usage";
import { useGenerationStore } from "@/stores/generation-store";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, History, TrendingUp } from "lucide-react";
import * as React from "react";
import { motion } from "framer-motion";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { useUIStore } from "@/stores/ui-store";

export function StatsCards() {
  const { subscription, isLoading: subLoading } = useSubscription();
  const { usage, isLoading: usageLoading } = useUsage();
  const { setUpgradeModalOpen } = useUIStore();
  const recentGenerations = useGenerationStore((state) => state.recentGenerations);

  // Calculate stats from generation history
  const totalGenerations = recentGenerations.length;
  const scores = recentGenerations.map((h: any) => h.viralScore).filter((s: any): s is number => s !== undefined);
  const avgViralScore = scores.length > 0 
    ? Math.round(scores.reduce((acc: number, curr: number) => acc + curr, 0) / scores.length) 
    : 0;

  const planName = subscription?.plan || "FREE";

  // Circular gauge settings for Credit tracking
  const radius = 22;
  const strokeWidth = 4.5;
  const circumference = 2 * Math.PI * radius;
  const usagePercentage = usage ? usage.percentage : 0;
  const strokeDashoffset = circumference - ((100 - usagePercentage) / 100) * circumference;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
      
      {/* 1. Plan Card */}
      <Card variant="glass" className="relative group overflow-hidden border border-glass-border hover:border-brand-500/35 transition-all duration-300 hover:shadow-glow-sm">
        <div 
          className="absolute top-0 right-0 h-24 w-24 pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(circle, var(--color-brand-500) 0%, transparent 70%)', opacity: 0.15 }}
        />
        <CardContent className="pt-6 pb-5 space-y-4">
          <div className="flex justify-between items-start select-none">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Active Plan</p>
              <h3 className="text-2xl font-extrabold text-text-primary tracking-tight mt-0.5">
                {subLoading ? (
                  <span className="h-6 w-20 bg-surface-200 animate-pulse rounded block" />
                ) : (
                  planName
                )}
              </h3>
            </div>
            <div className="p-2.5 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 group-hover:scale-105 transition-transform duration-300">
              <Zap className="h-4.5 w-4.5 fill-current" />
            </div>
          </div>
          <div className="flex items-center justify-between gap-1.5 pt-2">
            <Badge variant={planName === "FREE" ? "outline" : "gradient"} className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 select-none">
              {planName === "FREE" ? "Standard Limits" : "Creator Premium"}
            </Badge>
            {planName === "FREE" && (
              <MagneticButton>
                <button
                  onClick={() => setUpgradeModalOpen(true)}
                  className="text-[10px] font-extrabold text-brand-400 hover:text-brand-300 transition-colors uppercase tracking-widest cursor-pointer select-none"
                >
                  Upgrade &rarr;
                </button>
              </MagneticButton>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 2. Credit circular Gauge Card */}
      <Card variant="glass" className="relative group overflow-hidden border border-glass-border hover:border-accent-500/35 transition-all duration-300 hover:shadow-glow-cyan">
        <div 
          className="absolute top-0 right-0 h-24 w-24 pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(circle, var(--color-accent-500) 0%, transparent 70%)', opacity: 0.15 }}
        />
        <CardContent className="pt-6 pb-5 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest select-none">Credits Remaining</p>
              <h3 className="text-2xl font-extrabold text-text-primary tracking-tight mt-0.5">
                {usageLoading ? (
                  <span className="h-6 w-16 bg-surface-200 animate-pulse rounded block" />
                ) : usage?.isUnlimited ? (
                  "Unlimited"
                ) : (
                  <AnimatedCounter target={usage ? usage.creditsRemaining : 0} />
                )}
              </h3>
            </div>
            
            {/* SVG Circular Ring Gauge */}
            {!usageLoading && usage && !usage.isUnlimited ? (
              <div className="relative h-12 w-12 flex items-center justify-center select-none">
                <svg className="h-full w-full transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    className="stroke-glass-border/30 fill-none"
                    strokeWidth={strokeWidth}
                  />
                  <motion.circle
                    cx="24"
                    cy="24"
                    r={radius}
                    className="stroke-accent-500 fill-none"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.0, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-[9px] font-extrabold text-text-secondary">
                  {Math.round(100 - usagePercentage)}%
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-accent-500/10 border border-accent-500/20 text-accent-500 group-hover:scale-105 transition-transform duration-300">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
            )}
          </div>

          <div className="pt-2 text-[10px] text-text-muted flex justify-between select-none">
            {!usageLoading && usage && !usage.isUnlimited && (
              <>
                <span>Credits reset monthly</span>
                <span className="font-bold text-text-secondary">{usage.creditsUsed} / {usage.monthlyCredits} used</span>
              </>
            )}
            {usage?.isUnlimited && (
              <span className="text-emerald-400 font-extrabold tracking-wider uppercase text-[9px]">Active Agency Quota</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 3. Generations Card */}
      <Card variant="glass" className="relative group overflow-hidden border border-glass-border hover:border-emerald-500/35 transition-all duration-300 hover:shadow-glow-emerald">
        <div 
          className="absolute top-0 right-0 h-24 w-24 pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(circle, var(--color-emerald-500) 0%, transparent 70%)', opacity: 0.15 }}
        />
        <CardContent className="pt-6 pb-5 space-y-4">
          <div className="flex justify-between items-start select-none">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Generations</p>
              <h3 className="text-2xl font-extrabold text-text-primary tracking-tight mt-0.5">
                <AnimatedCounter target={totalGenerations} />
              </h3>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform duration-300">
              <History className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="text-[10px] text-text-muted pt-2 select-none">Current active session count</p>
        </CardContent>
      </Card>

      {/* 4. Virality Card */}
      <Card variant="glass" className="relative group overflow-hidden border border-glass-border hover:border-amber-500/35 transition-all duration-300 hover:shadow-glow-amber">
        <div 
          className="absolute top-0 right-0 h-24 w-24 pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(circle, var(--color-amber-500) 0%, transparent 70%)', opacity: 0.15 }}
        />
        <CardContent className="pt-6 pb-5 space-y-4">
          <div className="flex justify-between items-start select-none">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Avg Viral Score</p>
              <h3 className="text-2xl font-extrabold text-text-primary tracking-tight mt-0.5">
                <AnimatedCounter target={avgViralScore} suffix="/100" />
              </h3>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform duration-300">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="text-[10px] text-text-muted pt-2 select-none">Audience virality rating index</p>
        </CardContent>
      </Card>
      
    </div>
  );
}
