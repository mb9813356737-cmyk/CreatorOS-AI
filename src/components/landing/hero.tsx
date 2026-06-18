"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, Zap, CheckCircle } from "lucide-react";
import VaporizeTextCycle, { Tag } from "@/components/ui/vaporize-text";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

// ─── Hero Component ──────────────────────────────────────────

const ROTATING_KEYWORDS = ["Viral Hooks", "Hinglish Captions", "Shorts Scripts", "Thumbnail Prompts"];

export function Hero() {
  const { isSignedIn } = useAuth();
  const [responsiveFontSize, setResponsiveFontSize] = useState("50px");
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Scale max tilt to 12 degrees for visible impact
    setTilt({
      x: -(y / (rect.height / 2)) * 12,
      y: (x / (rect.width / 2)) * 12,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setResponsiveFontSize("36px");
      } else if (window.innerWidth < 768) {
        setResponsiveFontSize("54px");
      } else {
        setResponsiveFontSize("70px");
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <section className="relative pt-12 pb-12 overflow-hidden select-none w-full bg-black flex flex-col justify-center">
      {/* Mesh Grid & Top Radial Light Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.07)_0%,transparent_60%)] pointer-events-none z-0" />

      <ContainerScroll
        titleComponent={
          <div className="max-w-6xl mx-auto px-6 text-center space-y-6 relative z-10 pb-12">
            {/* Glow Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/5 text-brand-300 text-xs font-bold tracking-wider uppercase shadow-glow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 fill-current animate-pulse text-brand-300" />
              <span>Next-Gen Creator Suite for India</span>
            </motion.div>

            {/* Master Headline */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-text-primary"
              >
                The Ultimate Engine For
                <br />
                <span className="min-h-[60px] sm:min-h-[85px] md:min-h-[110px] block relative w-full text-center">
                  <VaporizeTextCycle
                    texts={ROTATING_KEYWORDS}
                    font={{
                      fontFamily: "var(--font-sans)",
                      fontSize: responsiveFontSize,
                      fontWeight: 800,
                    }}
                    color="rgb(168, 85, 247)"
                    spread={5}
                    density={5}
                    animation={{
                      vaporizeDuration: 1.5,
                      fadeInDuration: 0.6,
                      waitDuration: 2.2,
                    }}
                    direction="left-to-right"
                    alignment="center"
                    tag={Tag.P}
                  />
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-2xl mx-auto text-sm sm:text-base text-text-secondary leading-relaxed font-medium"
              >
                Generate viral hooks, Hindi/Hinglish captions, ready-to-shoot scripts, and predict video virality before upload. Tailor-made for YouTube, Reels, and local creator networks.
              </motion.p>
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Link href={isSignedIn ? "/dashboard" : "/sign-up"} className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto h-12 shadow-glow-md group font-bold"
                  rightIcon={<ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />}
                >
                  Get Started Free
                </Button>
              </Link>
              
              <Link href="#pricing" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto h-12 border border-glass-border hover:bg-surface-50/10 font-bold"
                  leftIcon={<Zap className="h-4.5 w-4.5 text-brand-400" />}
                >
                  View Pricing
                </Button>
              </Link>
            </motion.div>

            {/* Trust Stats Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-text-muted pt-6"
            >
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>10 trial credits included</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>Cancel/Pause anytime</span>
              </div>
            </motion.div>
          </div>
        }
      >
        {/* Mockup Card Frame with 3D Tilt Interaction */}
        <motion.div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transformStyle: "preserve-3d",
            transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: "transform 150ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          className="rounded-xl border border-glass-border/70 bg-surface-50/70 p-2.5 shadow-cinematic backdrop-blur-md relative h-full w-full overflow-hidden text-left flex flex-col cursor-pointer"
        >
          
          {/* Header window control */}
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-glass-border/20 bg-surface-100/40 text-text-muted select-none">
            <div className="h-2.5 w-2.5 rounded-full bg-error/30" />
            <div className="h-2.5 w-2.5 rounded-full bg-warning/30" />
            <div className="h-2.5 w-2.5 rounded-full bg-success/30" />
            <span className="text-[10px] pl-3 text-text-muted font-mono select-none">creatoros-preview.ai/dashboard</span>
          </div>
          
          {/* Inner Dashboard View */}
          <div className="bg-surface-0/60 p-4 sm:p-6 flex-1 grid grid-cols-1 md:grid-cols-12 gap-5 overflow-hidden" style={{ transformStyle: "preserve-3d" }}>
            
            {/* Sidebar */}
            <div className="hidden md:block col-span-3 border-r border-glass-border/25 pr-4 space-y-3.5">
              <div className="h-8 w-full bg-brand-500/10 rounded-md border border-brand-500/10 flex items-center px-2">
                <Sparkles className="h-3.5 w-3.5 text-brand-400 mr-2" />
                <span className="text-[10px] font-bold text-brand-400">AI Hook Engine</span>
              </div>
              <div className="space-y-1.5">
                <div className="h-7 w-full bg-surface-100/40 rounded border border-glass-border/10 flex items-center px-2 text-[10px] text-text-secondary font-medium">Hinglish Captions</div>
                <div className="h-7 w-full bg-surface-100/40 rounded border border-glass-border/10 flex items-center px-2 text-[10px] text-text-secondary font-medium">Shorts Script</div>
                <div className="h-7 w-full bg-surface-100/40 rounded border border-glass-border/10 flex items-center px-2 text-[10px] text-text-secondary font-medium">Trend Audit</div>
              </div>
            </div>

            {/* Central Panel */}
            <div className="col-span-12 md:col-span-9 space-y-6 flex flex-col justify-between" style={{ transformStyle: "preserve-3d" }}>
              <div className="grid grid-cols-3 gap-3" style={{ transformStyle: "preserve-3d" }}>
                <div className="p-3 rounded-lg border border-glass-border bg-surface-100/20" style={{ transform: "translateZ(30px)" }}>
                  <span className="text-[8px] font-bold text-text-muted uppercase">Virality Score</span>
                  <div className="text-base font-extrabold text-emerald-400 mt-0.5 font-mono">92%</div>
                </div>
                <div className="p-3 rounded-lg border border-glass-border bg-surface-100/20" style={{ transform: "translateZ(35px)" }}>
                  <span className="text-[8px] font-bold text-text-muted uppercase">Credits Left</span>
                  <div className="text-base font-extrabold text-brand-400 mt-0.5 font-mono">358</div>
                </div>
                <div className="p-3 rounded-lg border border-glass-border bg-surface-100/20" style={{ transform: "translateZ(25px)" }}>
                  <span className="text-[8px] font-bold text-text-muted uppercase">Active Tier</span>
                  <div className="text-base font-extrabold text-pink-400 mt-0.5">Pro Creator</div>
                </div>
              </div>

              {/* Main Mock Output with Depth Lift */}
              <div className="p-4 rounded-xl border border-glass-border bg-surface-100/25 space-y-3 relative overflow-hidden mt-auto" style={{ transform: "translateZ(50px)" }}>
                <div className="absolute top-0 right-0 h-16 w-16 bg-radial-gradient(circle,rgba(168,85,247,0.1),transparent_70%) pointer-events-none" />
                
                <div className="flex items-center gap-2">
                  <Badge variant="gradient" className="text-[8px] tracking-wider font-extrabold bg-linear-to-r from-pink-500 to-accent-500 text-white">Hinglish Output</Badge>
                  <span className="text-[9px] text-text-muted font-medium">curiosity tone • youtube shorts</span>
                </div>

                <p className="text-xs font-bold text-text-primary leading-relaxed">
                  &ldquo;Yeh 3 simple rules follow karo aur views double! 📉 Kehne ko sab bolte hain but proof is here...&rdquo;
                </p>

                <div className="flex gap-4 text-[9px] text-text-muted">
                  <span>CTR Rating: <strong className="text-emerald-400 font-mono">9.5/10</strong></span>
                  <span>Engagement Index: <strong className="text-brand-400">High</strong></span>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </ContainerScroll>
    </section>
  );
}
