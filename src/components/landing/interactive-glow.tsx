"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function InteractiveGlow() {
  const [mounted, setMounted] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const offsetMouseX = useMotionValue(0);
  const offsetMouseY = useMotionValue(0);

  // Smooth springs for lag-behind luxury easing
  const springConfig = { damping: 25, stiffness: 120, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);
  const secondaryX = useSpring(offsetMouseX, { damping: 30, stiffness: 90 });
  const secondaryY = useSpring(offsetMouseY, { damping: 30, stiffness: 90 });

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;

    const handleMouseMove = (e: MouseEvent) => {
      // Offset by half of spotlight size to center it
      mouseX.set(e.clientX - 250);
      mouseY.set(e.clientY - 250);
      offsetMouseX.set(e.clientX - 175 + 40);
      offsetMouseY.set(e.clientY - 175 + 40);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY, offsetMouseX, offsetMouseY]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Primary Indigo Glow Follower */}
      <motion.div
        style={{
          x: smoothX,
          y: smoothY,
        }}
        className="absolute w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.06)_0%,rgba(99,102,241,0.01)_50%,transparent_100%)] mix-blend-screen filter blur-[20px] pointer-events-none"
      />

      {/* Secondary Accent Neon Lime Glow Follower (Smaller, intense core) */}
      <motion.div
        style={{
          x: secondaryX,
          y: secondaryY,
        }}
        className="absolute w-[350px] h-[350px] rounded-full bg-[radial-gradient(circle,rgba(206,255,26,0.03)_0%,rgba(206,255,26,0.005)_50%,transparent_100%)] mix-blend-screen filter blur-[30px] pointer-events-none"
      />

      {/* Static ambient background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.03)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(206,255,26,0.02)_0%,transparent_70%)] pointer-events-none" />
    </div>
  );
}
