"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "glow";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-medium transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer rounded-md";

    const variants = {
      primary:
        "bg-linear-to-r from-brand-500 to-accent-400 hover:from-brand-600 hover:to-accent-500 text-white shadow-glow-sm hover:scale-[1.02] transition-all duration-150 hover:shadow-[0_0_20px_rgba(167,139,250,0.45)]",
      secondary:
        "glass hover:bg-surface-200 text-text-primary border border-glass-border hover:border-glass-border-hover transition-all duration-150 hover:scale-[1.02]",
      outline:
        "bg-transparent border border-surface-300 hover:border-brand-500 hover:text-white text-text-secondary hover:bg-brand-950/20 transition-all duration-150 hover:scale-[1.02]",
      ghost: "bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-50 transition-all duration-150",
      danger: "bg-error/20 hover:bg-error/30 text-white border border-error/30 hover:border-error/50 transition-all duration-150 hover:scale-[1.02]",
      glow: "bg-surface-50 hover:bg-surface-100 text-brand-400 border border-brand-500/30 hover:border-brand-500 shadow-glow-sm hover:shadow-glow-md transition-all duration-150 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(167,139,250,0.45)]",
    };

    const sizes = {
      sm: "h-9 px-3 text-xs gap-1.5",
      md: "h-11 px-5 text-sm gap-2",
      lg: "h-13 px-8 text-base gap-3 rounded-lg",
      icon: "h-10 w-10 p-0",
    };

    return (
      <motion.button
        ref={ref}
        disabled={disabled || isLoading}
        whileTap={{ scale: 0.98 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...(props as any)}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-current" />}
        {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        
        {/* Glow effect on hover for primary/glow buttons using violet #A78BFA (mapped to pink-500) */}
        {(variant === "primary" || variant === "glow") && (
          <div className="absolute inset-0 -z-10 bg-linear-to-r from-pink-500 to-pink-500 rounded-md opacity-0 blur-md transition-opacity duration-150 group-hover:opacity-40" />
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
