"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

// ─── Fade In ───────────────────────────────────────────────

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (custom: { delay: number; duration: number }) => ({
    opacity: 1,
    transition: {
      delay: custom.delay,
      duration: custom.duration,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  className,
  once = true,
}: FadeInProps) {
  return (
    <motion.div
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      custom={{ delay, duration }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
