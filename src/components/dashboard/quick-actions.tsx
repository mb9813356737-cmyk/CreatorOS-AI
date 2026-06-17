"use client";

import Link from "next/link";
import { useSubscription } from "@/hooks/use-subscription";
import { useUIStore } from "@/stores/ui-store";
import { Card, CardContent } from "@/components/ui/card";
import { GENERATION_TYPES, PLANS } from "@/lib/constants";
import { ArrowRight, Lock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
} as const;

export function QuickActions() {
  const { subscription } = useSubscription();
  const { setUpgradeModalOpen } = useUIStore();

  const userPlan = subscription?.plan || "FREE";

  const tools = Object.entries(GENERATION_TYPES).map(([type, meta]) => {
    // Find required plans for access
    let requiredPlans: string[] = ["FREE", "PRO", "AGENCY"];
    if (type === "SCRIPT" || type === "THUMBNAIL" || type === "TREND" || type === "VIRAL_SCORE") {
      requiredPlans = ["PRO", "AGENCY"];
    } else if (type === "REPURPOSE") {
      requiredPlans = ["AGENCY"];
    }

    const isLocked = !requiredPlans.includes(userPlan);
    const badge = type === "REPURPOSE" ? "Agency" : (type === "SCRIPT" || type === "THUMBNAIL" || type === "TREND" || type === "VIRAL_SCORE" ? "Pro" : null);

    return {
      type,
      isLocked,
      badge,
      ...meta,
    };
  });

  const handleToolClick = (e: React.MouseEvent, isLocked: boolean) => {
    if (isLocked) {
      e.preventDefault();
      setUpgradeModalOpen(true);
    }
  };

  const getColors = (color: string) => {
    const maps: Record<string, { bg: string; text: string; border: string; glow: string }> = {
      brand: {
        bg: "bg-brand-500/10",
        text: "text-brand-400",
        border: "border-brand-500/20",
        glow: "hover:shadow-glow-md",
      },
      accent: {
        bg: "bg-accent-500/10",
        text: "text-accent-400",
        border: "border-accent-500/20",
        glow: "hover:shadow-glow-cyan",
      },
      pink: {
        bg: "bg-pink-500/10",
        text: "text-pink-400",
        border: "border-pink-500/20",
        glow: "hover:shadow-glow-pink",
      },
      emerald: {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        border: "border-emerald-500/20",
        glow: "hover:shadow-glow-emerald",
      },
      amber: {
        bg: "bg-amber-500/10",
        text: "text-amber-400",
        border: "border-amber-500/20",
        glow: "hover:shadow-glow-amber",
      },
    };
    return maps[color] || maps.brand;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-text-primary">Content Suite Tools</h2>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5"
      >
        {tools.map((tool) => {
          const colors = getColors(tool.color);
          return (
            <motion.div key={tool.type} variants={itemVariants}>
              <Link
                href={tool.href}
                onClick={(e) => handleToolClick(e, tool.isLocked)}
                className="block group"
              >
                <Card
                  variant="glass"
                  className={cn(
                    "h-48 flex flex-col justify-between p-5 border border-glass-border hover:bg-surface-50/80 transition-all select-none duration-300 relative overflow-hidden",
                    colors.glow,
                    tool.isLocked && "opacity-75"
                  )}
                  hoverEffect
                >
                  <div>
                    {/* Header: Icon + Badge */}
                    <div className="flex justify-between items-center mb-4">
                      <div className={cn("p-2.5 rounded-lg border", colors.bg, colors.border, colors.text)}>
                        <tool.icon className="h-5 w-5" />
                      </div>
                      
                      {tool.isLocked ? (
                        <div className="flex items-center gap-1 bg-surface-100 border border-glass-border/60 text-text-muted px-2 py-0.5 rounded-full text-[10px] font-bold">
                          <Lock className="h-2.5 w-2.5" />
                          <span>Locked</span>
                        </div>
                      ) : tool.badge ? (
                        <span className={cn(
                          "text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                          tool.badge === "Agency" ? "bg-pink-500/20 text-pink-400 border border-pink-500/30" : "bg-brand-500/20 text-brand-400 border border-brand-500/30"
                        )}>
                          {tool.badge}
                        </span>
                      ) : null}
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1">
                      <h4 className="font-bold text-text-primary text-sm tracking-tight flex items-center gap-1.5 group-hover:text-brand-400 transition-colors">
                        {tool.label}
                        {!tool.isLocked && <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />}
                      </h4>
                      <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <div className="text-[10px] font-semibold text-text-muted mt-2 uppercase tracking-widest flex justify-between items-center">
                    <span>Active engine</span>
                    <span className="opacity-0 group-hover:opacity-100 text-brand-400 font-bold transition-all duration-300">launch &rarr;</span>
                  </div>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
