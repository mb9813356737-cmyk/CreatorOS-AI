"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Quote } from "lucide-react";
import { motion } from "framer-motion";

const TESTIMONIALS = [
  {
    quote: "Hinglish captions generator is absolute gold. It writes exactly how I speak to my audience, saving me 2 hours of editing time every single day.",
    name: "Rohan Verma",
    handle: "@rohaninvests",
    niche: "Finance & Investing",
    views: "5M+ Views",
  },
  {
    quote: "The Viral Score predictor actually works. I rewritten my script hooks based on its breakdown, and my last Reels hit 1.2M views in 4 days.",
    name: "Tanya Sharma",
    handle: "@techwithtanya",
    niche: "Tech & Gadgets",
    views: "2M+ Subscribers",
  },
  {
    quote: "Thumbnail prompts are amazing. I copy the DALL-E prompt, run it, and get CTRs of over 11% on my YouTube videos. Game-changing OS.",
    name: "Kabir Mehta",
    handle: "@kabirvlogs",
    niche: "Travel & Lifestyle",
    views: "10M+ Monthly Views",
  },
] as const;

export function Testimonials() {
  return (
    <section className="py-20 max-w-6xl mx-auto px-6 relative z-10 select-none">
      <div className="text-center space-y-3.5 mb-16">
        <Badge variant="gradient" className="font-extrabold px-3 py-1 text-xs">Testimonials</Badge>
        <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
          Validated by <span className="gradient-text">Top Bharatiya Creators</span>
        </h2>
        <p className="max-w-md mx-auto text-sm text-text-secondary">
          Join thousands of Indian YouTubers and influencers who trust CreatorOS AI to drive their traffic.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {TESTIMONIALS.map((test, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="flex"
          >
            <Card
              variant="glass"
              className="p-5.5 flex flex-col justify-between border border-glass-border hover:border-glass-border-hover shadow-elevated bg-surface-50/20"
              hoverEffect
            >
              <div>
                <Quote className="h-7 w-7 text-brand-500/25 mb-4" />
                <p className="text-sm italic text-text-secondary leading-relaxed mb-6 font-medium">
                  &ldquo;{test.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 border-t border-glass-border/20 pt-4 mt-auto">
                <div className="h-10 w-10 rounded-full bg-linear-to-br from-brand-500 to-accent-400 flex items-center justify-center font-extrabold text-white text-sm shadow-glow-sm select-none">
                  {test.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-text-primary text-xs tracking-tight">{test.name}</h4>
                  <p className="text-[10px] text-text-muted">{test.handle}</p>
                </div>
                <div className="ml-auto text-right space-y-1 select-none">
                  <Badge variant="outline" className="text-[9px] font-bold block">{test.niche}</Badge>
                  <span className="text-[9px] text-brand-400 font-extrabold block">{test.views}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
