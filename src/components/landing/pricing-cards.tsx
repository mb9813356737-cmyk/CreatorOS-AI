"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PLANS } from "@/lib/constants";
import { Card, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { ShaderBackground } from "@/components/ui/shader-background";
import { Entropy } from "@/components/ui/entropy";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } },
} as const;

export function PricingCards() {
  const { isSignedIn } = useAuth();
  const billingPeriod = "monthly";

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
    <section className="py-24 max-w-6xl mx-auto px-6 relative z-10 select-none overflow-hidden" id="pricing">
      {/* Background aesthetics */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[350px] h-[350px] bg-accent-500/5 rounded-full filter blur-[100px] pointer-events-none" />

      {/* WebGL Shader Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 overflow-hidden">
        <ShaderBackground />
      </div>

      {/* Entropy Particle Grid */}
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none opacity-15 mix-blend-screen overflow-hidden">
        <Entropy size={500} />
      </div>


      {/* Header */}
      <div className="text-center space-y-4 mb-16">
        <Badge variant="gradient" className="font-extrabold px-3 py-1 text-xs bg-linear-to-r from-pink-500 to-accent-500 text-white">Pricing Tiers</Badge>
        <h2 className="text-3xl md:text-5xl font-extrabold text-text-primary tracking-tight">
          Flexible Pricing for <span className="bg-linear-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent font-black">Every Scale</span>
        </h2>
        <p className="max-w-md mx-auto text-sm text-text-secondary">
          Start with our free trial tier and unlock premium templates as you scale your creator channels.
        </p>
      </div>

      {/* Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch"
      >
        {plans.map((plan) => {
          const isPopular = plan.key === "PRO";
          return (
            <motion.div key={plan.key} variants={cardVariants} className="flex h-full">
              <Card
                variant="glass"
                className={cn(
                  "w-full flex flex-col justify-between p-6 border transition-all duration-300 relative",
                  isPopular 
                    ? "border-accent-500/40 bg-accent-950/5 shadow-glow-cyan" 
                    : "border-glass-border hover:border-glass-border-hover shadow-elevated",
                  "hover:translate-y-[-4px]"
                )}
                hoverEffect={false}
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

                  {/* Checklist */}
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
                  <Link 
                    href={
                      !isSignedIn 
                        ? "/sign-in" 
                        : plan.key === "FREE" 
                          ? "/dashboard" 
                          : "/billing"
                    } 
                    className="w-full"
                  >
                    <Button
                      variant={isPopular ? "glow" : "secondary"}
                      size="md"
                      className="w-full font-bold shadow-sm"
                    >
                      {plan.key === "FREE" ? "Get Started Free" : `Upgrade to ${plan.name}`}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
