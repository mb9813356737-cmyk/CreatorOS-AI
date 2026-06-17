import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error = false, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-glass-border bg-surface-50/50 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-500/80 focus:bg-surface-50/80 focus:ring-1 focus:ring-brand-500/30 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 resize-y",
          error && "border-error/60 focus:border-error focus:ring-error/20",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
