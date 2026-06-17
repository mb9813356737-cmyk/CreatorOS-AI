"use client";

import { cn } from "@/lib/utils";
import { SlideUp } from "@/components/motion/slide-up";

// ─── Page Header ───────────────────────────────────────────

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  badge,
  action,
  className,
}: PageHeaderProps) {
  return (
    <SlideUp>
      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8",
          className
        )}
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
              {title}
            </h1>
            {badge && (
              <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/20">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1.5 text-sm text-text-secondary max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </SlideUp>
  );
}
