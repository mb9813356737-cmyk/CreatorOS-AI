"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// ─── Animated Counter ──────────────────────────────────────
// Smoothly counts up to the target value on viewport entry

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  formatter?: (n: number) => string;
}

export function AnimatedCounter({
  target,
  duration = 1500,
  prefix = "",
  suffix = "",
  className,
  formatter,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateValue(0, target, duration);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration, hasAnimated]);

  function animateValue(start: number, end: number, dur: number) {
    const startTime = performance.now();

    function step(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / dur, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  const displayValue = formatter ? formatter(count) : count.toLocaleString("en-IN");

  return (
    <span ref={ref} className={cn("tabular-nums font-mono", className)}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}
