"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Check } from "lucide-react";
import { motion } from "framer-motion";

export function CTASection() {
  return (
    <section className="py-24 px-6 max-w-5xl mx-auto relative z-10 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="rounded-2xl border border-brand-500/30 bg-gradient-to-br from-brand-950/20 via-surface-50/40 to-accent-950/20 p-8 md:p-14 text-center space-y-6 relative overflow-hidden shadow-glow-md"
      >
        {/* Background grids and glowing mesh */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_80%,transparent_100%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.12)_0%,transparent_60%)] pointer-events-none" />
        
        {/* Neon blur shapes floating in background */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-brand-500/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-accent-400/10 blur-2xl pointer-events-none" />

        <div className="flex justify-center mb-2">
          <Badge variant="gradient" className="gap-1 font-bold">
            <Sparkles className="h-3 w-3 fill-current" />
            Get Instant Access
          </Badge>
        </div>

        <h2 className="text-3xl md:text-5xl font-extrabold text-text-primary tracking-tight leading-tight max-w-2xl mx-auto">
          Start Generating <span className="gradient-text">Viral Creator Content</span> Today
        </h2>
        
        <p className="max-w-md mx-auto text-xs sm:text-sm text-text-secondary leading-relaxed">
          Create hooks, translate Hinglish captions, storyboard script timelines, and predict your video reach in seconds. Join the next generation of Indian creators.
        </p>

        {/* Feature Checkpoints */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-text-secondary pt-2">
          <div className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            <span>10 Free Credits</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            <span>All 7 Tools Unlocked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            <span>Razorpay Secured</span>
          </div>
        </div>

        <div className="pt-6 flex justify-center">
          <Link href="/sign-in">
            <Button
              variant="primary"
              size="lg"
              className="h-12 shadow-glow-sm hover:shadow-glow-md group font-bold"
              rightIcon={<ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-0.5 transition-transform" />}
            >
              Unlock Your CreatorOS AI
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
