"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface VerticalCutRevealProps {
  children: string;
  splitBy?: "words" | "characters";
  staggerDuration?: number;
  staggerFrom?: "first" | "last" | "center";
  reverse?: boolean;
  containerClassName?: string;
  transition?: any;
}

export function VerticalCutReveal({
  children,
  splitBy = "words",
  staggerDuration = 0.1,
  staggerFrom = "first",
  reverse = false,
  containerClassName,
  transition = { type: "spring", stiffness: 200, damping: 30 },
}: VerticalCutRevealProps) {
  const elements = splitBy === "words" ? children.split(" ") : children.split("");

  return (
    <span className={cn("inline-flex flex-wrap overflow-hidden", containerClassName)}>
      {elements.map((el, i) => {
        // Calculate delay based on staggerFrom
        let delay = i * staggerDuration;
        if (staggerFrom === "last") {
          delay = (elements.length - 1 - i) * staggerDuration;
        } else if (staggerFrom === "center") {
          const mid = (elements.length - 1) / 2;
          delay = Math.abs(i - mid) * staggerDuration;
        }

        if (transition && transition.delay !== undefined) {
          delay += transition.delay;
        }

        return (
          <span key={i} className="inline-block overflow-hidden mr-[0.25em] last:mr-0">
            <motion.span
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                ...transition,
                delay,
              }}
              className="inline-block"
            >
              {el}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}
