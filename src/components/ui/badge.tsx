import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "gradient" | "success" | "warning" | "error";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const baseStyles =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2";

  const variants = {
    default: "border-transparent bg-brand-500/20 text-brand-400 border-brand-500/30",
    secondary: "border-transparent bg-surface-100 text-text-secondary border-glass-border",
    outline: "border-surface-300 text-text-secondary bg-transparent",
    gradient: "border-transparent bg-linear-to-r from-brand-600/35 to-accent-500/35 text-white border-brand-500/30 shadow-glow-sm",
    success: "border-transparent bg-success/20 text-success border-success/30",
    warning: "border-transparent bg-warning/20 text-warning border-warning/30",
    error: "border-transparent bg-error/20 text-error border-error/30",
  };

  return <span className={cn(baseStyles, variants[variant], className)} {...props} />;
}
