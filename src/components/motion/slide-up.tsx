"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

// ─── Slide Up ──────────────────────────────────────────────

interface SlideUpProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  offset?: number;
  className?: string;
  once?: boolean;
}

const slideVariants: Variants = {
  hidden: (custom: { offset: number }) => ({
    opacity: 0,
    y: custom.offset,
    filter: "blur(4px)",
  }),
  visible: (custom: { delay: number; duration: number }) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      delay: custom.delay,
      duration: custom.duration,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

export function SlideUp({
  children,
  delay = 0,
  duration = 0.5,
  offset = 24,
  className,
  once = true,
}: SlideUpProps) {
  return (
    <motion.div
      variants={slideVariants}
      initial="hidden"
      animate="visible"
      custom={{ delay, duration, offset }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
