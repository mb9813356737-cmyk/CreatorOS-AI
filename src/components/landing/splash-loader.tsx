"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function SplashLoader({ onCompleteAction }: { onCompleteAction: () => void }) {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    let start = performance.now();
    let animationFrameId: number;
    const duration = 1200;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setPercent(progress);

      if (progress < 100) {
        animationFrameId = requestAnimationFrame(tick);
      } else {
        setTimeout(onCompleteAction, 200);
      }
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [onCompleteAction]);

  // Splitting text for character animation
  const titleText = "CREATOROS AI";

  const letterVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.5, filter: "blur(8px)" },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.07,
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as const, // Cinematic custom cubic-bezier ease
      },
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        scale: 1.08,
        filter: "blur(20px)",
        transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] as const }
      }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050508] overflow-hidden select-none"
    >
      {/* Background aesthetics (spotlights + grid) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(124,58,237,0.18)_0%,transparent_70%)] animate-pulse pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(219,39,119,0.14)_0%,transparent_70%)] pointer-events-none" style={{ animationDelay: "0.8s" }} />

      {/* Overlay background mesh grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.008)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.008)_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] [mask-image:radial-gradient(circle_at_center,black_50%,transparent_100%)] pointer-events-none" />

      {/* Main logo & text container */}
      <div className="flex flex-col items-center gap-7 relative z-10">
        
        {/* Glowing logo badge */}
        <motion.div
          initial={{ scale: 0, rotate: -220 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.1 }}
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-brand-500 to-accent-400 shadow-glow-md relative"
        >
          <Sparkles className="h-8 w-8 text-white animate-pulse" />
          <div className="absolute inset-[-4px] rounded-2xl border border-brand-500/20 animate-ping opacity-30" style={{ animationDuration: "2.5s" }} />
        </motion.div>

        {/* CreatorOS AI typography with text gradients */}
        <div className="flex items-center gap-[0.15em] font-extrabold tracking-widest text-3xl sm:text-4xl uppercase">
          {titleText.split("").map((char, index) => (
            <motion.span
              key={index}
              custom={index}
              variants={letterVariants}
              initial="hidden"
              animate="visible"
              className={
                char === " " 
                  ? "inline-block w-2.5 sm:w-3.5" 
                  : (index === 7 || index === 8)
                    ? "bg-linear-to-r from-brand-500 to-accent-400 bg-clip-text text-transparent font-black" 
                    : "text-white text-text-primary"
              }
            >
              {char}
            </motion.span>
          ))}
        </div>

        {/* Sub-label */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.5, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="text-[10px] text-text-secondary font-mono tracking-[0.45em] uppercase pl-2"
        >
          Creator Operating System
        </motion.p>

        {/* Glowing progress slider bar */}
        <div className="w-56 h-[3px] bg-surface-200/10 rounded-full overflow-hidden mt-6 relative border border-white/5">
          <motion.div
            className="h-full bg-linear-to-r from-brand-500 to-accent-400 rounded-full"
            style={{ width: `${percent}%` }}
          />
          {/* Glow dot */}
          <div 
            className="absolute top-0 bottom-0 w-2.5 bg-white blur-xs rounded-full shadow-glow-sm"
            style={{ left: `calc(${percent}% - 5px)` }}
          />
        </div>
      </div>
    </motion.div>
  );
}
