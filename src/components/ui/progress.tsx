import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // percentage
  gradient?: boolean;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, gradient = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative h-2 w-full overflow-hidden rounded-full bg-surface-100 border border-glass-border/30", className)}
        {...props}
      >
        <div
          className={cn(
            "h-full w-full flex-1 transition-all duration-500 ease-out-sine rounded-full",
            gradient
              ? "bg-linear-to-r from-brand-500 to-accent-400 shadow-glow-sm"
              : "bg-brand-500"
          )}
          style={{ transform: `translateX(-${100 - Math.min(Math.max(value, 0), 100)}%)` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";
