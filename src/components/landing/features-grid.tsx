"use client";

import { Card, CardContent } from "@/components/ui/card";
import { GENERATION_TYPES } from "@/lib/constants";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
} as const;

export function FeaturesGrid() {
  const getColors = (color: string) => {
    const maps: Record<string, { bg: string; text: string; border: string; shadow: string }> = {
      brand: { bg: "bg-brand-500/10", text: "text-brand-400", border: "border-brand-500/20", shadow: "hover:shadow-glow-md" },
      accent: { bg: "bg-accent-500/10", text: "text-accent-400", border: "border-accent-500/20", shadow: "hover:shadow-glow-cyan" },
      pink: { bg: "bg-pink-500/10", text: "text-pink-400", border: "border-pink-500/20", shadow: "hover:shadow-glow-pink" },
      emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", shadow: "hover:shadow-emerald" },
      amber: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", shadow: "hover:shadow-amber" },
    };
    return maps[color] || maps.brand;
  };

  return (
    <section className="py-20 max-w-6xl mx-auto px-6 relative z-10 select-none">
      <div className="text-center space-y-3.5 mb-16">
        <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
          Everything You Need to Go <span className="gradient-text">Viral</span>
        </h2>
        <p className="max-w-md mx-auto text-sm text-text-secondary">
          No generic outputs. Expertly crafted prompts tuned for local audiences and Indian creator platforms.
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {Object.entries(GENERATION_TYPES).map(([key, meta]) => {
          const colors = getColors(meta.color);
          return (
            <motion.div key={key} variants={cardVariants}>
              <Card
                variant="glass"
                className={cn(
                  "h-48 flex flex-col justify-between p-5.5 border border-glass-border hover:bg-surface-50/50 hover:border-glass-border-hover transition-all duration-300 relative overflow-hidden",
                  colors.shadow
                )}
                hoverEffect
              >
                <div>
                  <div className={cn("p-2.5 rounded-lg border w-fit mb-4.5", colors.bg, colors.border, colors.text)}>
                    <meta.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-text-primary mb-1 tracking-tight">{meta.label}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">{meta.description}</p>
                </div>

                <div className="flex justify-between items-center text-[10px] font-bold text-text-muted uppercase tracking-widest pt-2 mt-auto">
                  <span>Bharatiya Creator Engine</span>
                  <span className="text-brand-400 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
