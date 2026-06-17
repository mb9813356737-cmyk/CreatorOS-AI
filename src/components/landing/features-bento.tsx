"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, Image, Zap, Film, LayoutGrid, HelpCircle } from "lucide-react";
import { ShaderBackground } from "@/components/ui/shader-background";
import { Entropy } from "@/components/ui/entropy";

export function FeaturesBento() {
  // Mock states for Caption Converter Demo
  const [captionInput, setCaptionInput] = useState("This new gadget will change how you work.");
  const [captionOutput, setCaptionOutput] = useState("Yeh naya gadget aapka kaam karne ka tareeka badal dega! 🤯💻 Check out this video...");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const demos = [
      {
        in: "How to save money on tax in India.",
        out: "Tax bachana ab hoga simple! 💸 Yeh 3 secret tricks jo CAs aapko nahi batate. Share this reel right now!",
      },
      {
        in: "I visited the best hotel in Goa.",
        out: "Goa ka sabse premium secret hotel! 🌴 View dekh ke dimaag kharab ho jayega. Check it out in the link! 👇",
      },
      {
        in: "This new gadget will change how you work.",
        out: "Yeh naya gadget aapka kaam karne ka tareeka badal dega! 🤯💻 Check out this video...",
      },
    ];

    let count = 0;
    const interval = setInterval(() => {
      setIsTyping(true);
      setTimeout(() => {
        const selected = demos[count % demos.length];
        setCaptionInput(selected.in);
        setCaptionOutput(selected.out);
        setIsTyping(false);
        count++;
      }, 800);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 max-w-6xl mx-auto px-6 relative z-10 select-none overflow-hidden" id="features">
      {/* Background glow behind features */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-500/5 rounded-full filter blur-[120px] pointer-events-none" />

      {/* WebGL Shader Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 overflow-hidden">
        <ShaderBackground />
      </div>

      {/* Entropy Particle Grid */}
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none opacity-15 mix-blend-screen overflow-hidden">
        <Entropy size={500} />
      </div>


      {/* Header */}
      <div className="text-center space-y-3.5 mb-16">
        <Badge variant="gradient" className="font-extrabold px-3 py-1 text-xs bg-linear-to-r from-pink-500 to-accent-500 text-white">Features Bento</Badge>
        <h2 className="text-3xl md:text-5xl font-extrabold text-text-primary tracking-tight">
          One Operating System. <span className="bg-linear-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent font-black">7 Engine Blocks.</span>
        </h2>
        <p className="max-w-md mx-auto text-sm text-text-secondary">
          No boilerplate templates. CreatorOS uses localized Hinglish neural engines tuned for high CTR and retention.
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Card 1: Caption Generator (6 Columns, Large) */}
        <div className="col-span-1 md:col-span-8 flex flex-col">
          <Card variant="glass" className="p-6 border border-glass-border hover:border-glass-border-hover shadow-elevated h-full flex flex-col justify-between" hoverEffect>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400">
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">Hinglish Caption Converter</h3>
                  <p className="text-xs text-text-secondary">Bridges English structures with local slang.</p>
                </div>
              </div>

              {/* Demo Sandbox */}
              <div className="border border-glass-border/30 rounded-xl bg-surface-50/50 p-4 space-y-3 font-mono text-xs mt-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-text-muted uppercase font-bold">Input Context:</span>
                  <div className="p-2 rounded bg-surface-100/50 text-text-secondary border border-glass-border/10 truncate">
                    {captionInput}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-accent-400 uppercase font-bold">CreatorOS Hinglish Output:</span>
                  <div className="p-3 rounded-lg bg-accent-950/10 text-accent-300 border border-accent-500/20 min-h-[50px] leading-relaxed">
                    {isTyping ? (
                      <span className="animate-pulse">Typing translations...</span>
                    ) : (
                      captionOutput
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-[10px] font-bold text-text-muted uppercase tracking-wider pt-6 mt-auto">
              <span>Hinglish Engine v2.0</span>
              <span className="text-accent-400">Active Pipeline &rarr;</span>
            </div>
          </Card>
        </div>

        {/* Card 2: Viral Score (4 Columns, Medium) */}
        <div className="col-span-1 md:col-span-4 flex flex-col">
          <Card variant="glass" className="p-6 border border-glass-border hover:border-glass-border-hover shadow-elevated h-full flex flex-col justify-between text-center relative overflow-hidden" hoverEffect>
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-accent-500/5 to-transparent pointer-events-none" />
            
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-2 rounded-lg bg-accent-500/10 border border-accent-500/20 text-accent-400">
                  <Zap className="h-4.5 w-4.5" />
                </div>
              </div>
              <h3 className="text-base font-bold text-text-primary">Viral Score Predictor</h3>
              <p className="text-xs text-text-secondary">AI audit score on CTR potentials.</p>

              {/* Simulated Gauge */}
              <div className="relative flex items-center justify-center py-4">
                <div className="h-32 w-32 rounded-full border-4 border-dashed border-glass-border flex flex-col items-center justify-center shadow-glow-cyan bg-accent-950/5">
                  <span className="text-2xl font-extrabold text-accent-400">92%</span>
                  <span className="text-[9px] font-mono text-accent-500 uppercase tracking-widest font-bold mt-0.5 animate-pulse">High CTR</span>
                </div>
              </div>
            </div>

            <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-auto">
              <span>Optimizing Hooks & Triggers</span>
            </div>
          </Card>
        </div>

        {/* Card 3: Trend Map (4 Columns, Medium) */}
        <div className="col-span-1 md:col-span-4 flex flex-col">
          <Card variant="glass" className="p-6 border border-glass-border hover:border-glass-border-hover shadow-elevated h-full flex flex-col justify-between" hoverEffect>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400">
                  <TrendingUp className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-base font-bold text-text-primary">Trend Tracker</h3>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Scan search grids to spot trending audio, tags, and topics before the curve.
              </p>

              {/* Graph bars */}
              <div className="space-y-2 pt-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-text-secondary">
                    <span>Tax Planning tricks</span>
                    <span className="text-accent-400 font-bold">+340%</span>
                  </div>
                  <Progress value={90} className="h-1 bg-surface-200" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-text-secondary">
                    <span>Goa Secret Hotels</span>
                    <span className="text-accent-400 font-bold">+195%</span>
                  </div>
                  <Progress value={65} className="h-1 bg-surface-200" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-text-secondary">
                    <span>Vite 5 setup tutorial</span>
                    <span className="text-accent-400 font-bold">+80%</span>
                  </div>
                  <Progress value={35} className="h-1 bg-surface-200" />
                </div>
              </div>
            </div>

            <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider pt-6 mt-auto">
              <span>Updated 5 mins ago</span>
            </div>
          </Card>
        </div>

        {/* Card 4: Script Timelines (4 Columns, Medium) */}
        <div className="col-span-1 md:col-span-4 flex flex-col">
          <Card variant="glass" className="p-6 border border-glass-border hover:border-glass-border-hover shadow-elevated h-full flex flex-col justify-between" hoverEffect>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400">
                  <Film className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-base font-bold text-text-primary">Shorts Script Timeline</h3>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Generate timestamped scripts divided into key attention hook layers.
              </p>

              {/* Timeline blocks */}
              <div className="border-l border-glass-border pl-3 space-y-3 pt-2 text-[10px]">
                <div className="relative">
                  <div className="absolute -left-[16.5px] top-1 h-2 w-2 rounded-full bg-accent-500 shadow-glow-cyan" />
                  <span className="font-bold text-text-primary">0:00 - The Hook</span>
                  <p className="text-text-muted mt-0.5">Start with standard visual pattern interrupt.</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[16.5px] top-1 h-2 w-2 rounded-full bg-brand-500/50" />
                  <span className="font-bold text-text-primary">0:15 - The Conflict</span>
                  <p className="text-text-muted mt-0.5">Elaborate on the problem statement.</p>
                </div>
              </div>
            </div>

            <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider pt-6 mt-auto">
              <span>60s Video template ready</span>
            </div>
          </Card>
        </div>

        {/* Card 5: Hook Rater & Repurposing (4 Columns, Medium) */}
        <div className="col-span-1 md:col-span-4 flex flex-col">
          <Card variant="glass" className="p-6 border border-glass-border hover:border-glass-border-hover shadow-elevated h-full flex flex-col justify-between" hoverEffect>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <LayoutGrid className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-base font-bold text-text-primary">Cross-Platform Repurposer</h3>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Repurpose one script or blog post into Hooks, Threads, and Reels drafts in 1-click.
              </p>

              {/* Platform map layout */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-[9px] font-bold text-center">
                <div className="p-2 border border-glass-border rounded-lg bg-surface-50/50 text-text-secondary">
                  YouTube Shorts
                </div>
                <div className="p-2 border border-accent-500/30 rounded-lg bg-accent-500/10 text-accent-400">
                  Insta Reels
                </div>
                <div className="p-2 border border-glass-border rounded-lg bg-surface-50/50 text-text-secondary">
                  Twitter Thread
                </div>
              </div>
            </div>

            <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider pt-6 mt-auto">
              <span>Scale across platforms</span>
            </div>
          </Card>
        </div>

      </div>
    </section>
  );
}
