"use client";

import { useEffect, useRef } from "react";

interface EntropyProps {
  className?: string;
  size?: number;
}

export function Entropy({ className = "", size = 400 }: EntropyProps) {
  // Completely disabled to remove particle grid backgrounds while keeping all layout structure.
  return null;
}
