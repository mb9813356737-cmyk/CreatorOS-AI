"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { PLANS } from "@/lib/constants";
import { Card, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { Sparkles as SparklesComp } from "@/components/ui/sparkles";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";

export function PricingCards() {
  const { isSignedIn } = useAuth();
  const pricingRef = useRef<HTMLDivElement>(null);

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.4,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
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
    <section 
      ref={pricingRef}
      className="py-24 max-w-6xl mx-auto px-6 relative z-10 select-none overflow-hidden w-full" 
      id="pricing"
    >
      {/* Background Aesthetics from User Code */}
      <TimelineContent
        animationNum={4}
        timelineRef={pricingRef}
        customVariants={revealVariants}
        className="absolute top-0 left-0 h-96 w-screen overflow-hidden [mask-image:radial-gradient(50%_50%,white,transparent)] pointer-events-none z-0"
      >
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#3a3a3a01_1px,transparent_1px)] bg-[size:70px_80px]" />
        <SparklesComp
          density={1200}
          direction="bottom"
          speed={0.8}
          color="#FFFFFF"
          className="absolute inset-x-0 bottom-0 h-full w-full [mask-image:radial-gradient(50%_50%,white,transparent_85%)] opacity-30"
        />
      </TimelineContent>

      <TimelineContent
        animationNum={5}
        timelineRef={pricingRef}
        customVariants={revealVariants}
        className="absolute left-0 top-[-114px] w-full h-[113.625vh] flex flex-col items-start justify-start content-start flex-none flex-nowrap gap-2.5 overflow-hidden p-0 z-0 pointer-events-none"
      >
        <div className="w-full h-full relative">
          <div
            className="absolute left-[-200px] top-0 w-[600px] h-[600px] rounded-full opacity-20"
            style={{
              border: "150px solid #6366f1",
              filter: "blur(92px)",
              WebkitFilter: "blur(92px)",
            }}
          />
          <div
            className="absolute right-[-200px] top-0 w-[600px] h-[600px] rounded-full opacity-20"
            style={{
              border: "150px solid #a855f7",
              filter: "blur(92px)",
              WebkitFilter: "blur(92px)",
            }}
          />
        </div>
      </TimelineContent>

      {/* Header with Vertical Cut Reveal Typography */}
      <div className="text-center space-y-4 mb-16 relative z-10">
        <Badge variant="gradient" className="font-extrabold px-3 py-1 text-xs bg-linear-to-r from-pink-500 to-accent-500 text-white">
          Pricing Tiers
        </Badge>
        
        <h2 className="text-3xl md:text-5xl font-extrabold text-text-primary tracking-tight">
          <VerticalCutReveal
            splitBy="words"
            staggerDuration={0.12}
            staggerFrom="first"
            reverse={true}
            containerClassName="justify-center flex-wrap"
            transition={{
              type: "spring",
              stiffness: 250,
              damping: 40,
              delay: 0,
            }}
          >
            Flexible Pricing for Every Scale
          </VerticalCutReveal>
        </h2>
        
        <TimelineContent
          as="p"
          animationNum={0}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="max-w-md mx-auto text-sm text-text-secondary"
        >
          Start with our free trial tier and unlock premium templates as you scale your creator channels.
        </TimelineContent>
      </div>

      {/* Grid with staggered card entries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch relative z-10">
        {plans.map((plan, index) => {
          const isPopular = plan.key === "PRO";
          return (
            <TimelineContent
              key={plan.key}
              as="div"
              animationNum={1 + index}
              timelineRef={pricingRef}
              customVariants={revealVariants}
              className="flex h-full"
            >
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
            </TimelineContent>
          );
        })}
      </div>
    </section>
  );
}
