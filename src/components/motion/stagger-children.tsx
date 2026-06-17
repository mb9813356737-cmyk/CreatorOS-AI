"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// ─── Stagger Children ──────────────────────────────────────

interface StaggerChildrenProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
  once?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: (staggerDelay: number) => ({
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.1,
    },
  }),
};

export const staggerItemVariants = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as any,
    },
  },
};

export function StaggerChildren({
  children,
  staggerDelay = 0.08,
  className,
  once = true,
}: StaggerChildrenProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      custom={staggerDelay}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Stagger Item Wrapper ──────────────────────────────────
export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={staggerItemVariants} className={className}>
      {children}
    </motion.div>
  );
}
