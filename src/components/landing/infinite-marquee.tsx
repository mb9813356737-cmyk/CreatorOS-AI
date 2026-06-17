"use client";

import React from "react";
import { Sparkles, TrendingUp, Zap, Heart, MessageSquare } from "lucide-react";

const TAGS_ROW1 = [
  { label: "#HinglishCaptions", icon: Sparkles, color: "text-brand-400 border-brand-500/25 bg-brand-500/5" },
  { label: "Viral Hook 9.8 CTR", icon: TrendingUp, color: "text-emerald-400 border-emerald-500/25 bg-emerald-500/5" },
  { label: "#IndianCreators", icon: Zap, color: "text-amber-400 border-amber-500/25 bg-amber-500/5" },
  { label: "Script Timeline generator", icon: Sparkles, color: "text-pink-400 border-pink-500/25 bg-pink-500/5" },
  { label: "AI Thumbnail Prompt", icon: TrendingUp, color: "text-brand-400 border-brand-500/25 bg-brand-500/5" },
  { label: "Engagement Boost +42%", icon: Heart, color: "text-emerald-400 border-emerald-500/25 bg-emerald-500/5" },
];

const TAGS_ROW2 = [
  { label: "Hinglish Slang Vocabulary", icon: MessageSquare, color: "text-pink-400 border-pink-500/25 bg-pink-500/5" },
  { label: "#ShortsViralSecrets", icon: Zap, color: "text-brand-400 border-brand-500/25 bg-brand-500/5" },
  { label: "Score Predictor: 92/100", icon: TrendingUp, color: "text-emerald-400 border-emerald-500/25 bg-emerald-500/5" },
  { label: "#FinanceHindiVlogs", icon: Sparkles, color: "text-amber-400 border-amber-500/25 bg-amber-500/5" },
  { label: "10,000+ Hours Saved", icon: Heart, color: "text-brand-400 border-brand-500/25 bg-brand-500/5" },
  { label: "Cross-Platform Repurposing", icon: MessageSquare, color: "text-pink-400 border-pink-500/25 bg-pink-500/5" },
];

export function InfiniteMarquee() {
  return (
    <section className="py-16 overflow-hidden relative select-none w-full space-y-6">
      {/* Background radial gradients for ambient coloring */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[350px] h-[350px] bg-brand-500/5 rounded-full filter blur-[100px] pointer-events-none" />

      {/* Row 1 (Left to Right) */}
      <div className="flex w-max relative">
        <div className="flex gap-4 items-center animate-[marquee_20s_linear_infinite] shrink-0 px-4">
          {TAGS_ROW1.concat(TAGS_ROW1).map((tag, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-2 px-4 py-2 border rounded-full text-xs font-semibold backdrop-blur-xs shadow-elevated ${tag.color}`}
            >
              <tag.icon className="h-3.5 w-3.5" />
              <span>{tag.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2 (Right to Left) */}
      <div className="flex w-max relative">
        <div className="flex gap-4 items-center animate-[marquee-reverse_22s_linear_infinite] shrink-0 px-4">
          {TAGS_ROW2.concat(TAGS_ROW2).map((tag, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-2 px-4 py-2 border rounded-full text-xs font-semibold backdrop-blur-xs shadow-elevated ${tag.color}`}
            >
              <tag.icon className="h-3.5 w-3.5" />
              <span>{tag.label}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee-reverse {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0%);
          }
        }
      `}</style>
    </section>
  );
}
