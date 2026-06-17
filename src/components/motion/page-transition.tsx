"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// ─── Page Transition ───────────────────────────────────────
// Wraps route content with smooth enter/exit animations

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const variants = {
  initial: { opacity: 0, y: 8, filter: "blur(4px)" },
  enter: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as any },
  },
  exit: {
    opacity: 0,
    y: -4,
    filter: "blur(2px)",
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] as any },
  },
};

export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={variants}
        initial="initial"
        animate="enter"
        exit="exit"
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
