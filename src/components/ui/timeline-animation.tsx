"use client";

import React from "react";
import { motion } from "framer-motion";

interface TimelineContentProps {
  children: React.ReactNode;
  animationNum: number;
  timelineRef?: React.RefObject<HTMLElement | null>;
  customVariants?: any;
  className?: string;
  as?: "div" | "p" | "span" | "h2" | "section" | "article";
}

const defaultVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: "easeOut" },
  }),
};

export function TimelineContent({
  children,
  animationNum,
  timelineRef,
  customVariants = defaultVariants,
  className,
  as = "div",
}: TimelineContentProps) {
  const MotionComponent = motion[as] as any;

  return (
    <MotionComponent
      custom={animationNum}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={customVariants}
      className={className}
    >
      {children}
    </MotionComponent>
  );
}
