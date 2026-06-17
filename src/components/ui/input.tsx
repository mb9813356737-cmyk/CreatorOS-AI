import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error = false, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-md border border-glass-border bg-surface-50/50 px-3 py-2 text-sm text-text-primary file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-muted focus:border-brand-500/80 focus:bg-surface-50/80 focus:ring-1 focus:ring-brand-500/30 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          error && "border-error/60 focus:border-error focus:ring-error/20",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
