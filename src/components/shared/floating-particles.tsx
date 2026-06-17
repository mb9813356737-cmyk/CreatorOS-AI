"use client";

import { useCallback, useEffect, useRef } from "react";

// ─── Floating Particles ────────────────────────────────────
// GPU-accelerated particle system using CSS animations
// No JS animation loop — pure CSS for zero main-thread cost

interface FloatingParticlesProps {
  count?: number;
  className?: string;
}

export function FloatingParticles({
  count = 25,
  className = "",
}: FloatingParticlesProps) {
  // Completely disabled to remove floating background particles on layouts.
  return null;
}
