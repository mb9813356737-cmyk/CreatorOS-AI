"use client";

import { cn } from "@/lib/utils";

// ─── Loading Skeleton ──────────────────────────────────────

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card";
  width?: string | number;
  height?: string | number;
  count?: number;
}

export function LoadingSkeleton({
  className,
  variant = "rectangular",
  width,
  height,
  count = 1,
}: SkeletonProps) {
  const baseClasses = "skeleton animate-pulse";

  const variantClasses = {
    text: "h-4 rounded-md",
    circular: "rounded-full",
    rectangular: "rounded-lg",
    card: "rounded-xl h-48",
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(baseClasses, variantClasses[variant], className)}
          style={{
            width: width ?? (variant === "circular" ? "40px" : "100%"),
            height:
              height ??
              (variant === "circular"
                ? "40px"
                : variant === "text"
                  ? "16px"
                  : undefined),
          }}
        />
      ))}
    </>
  );
}

// ─── Dashboard Skeleton ────────────────────────────────────
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass rounded-xl p-5 space-y-3">
            <LoadingSkeleton variant="text" width="60%" />
            <LoadingSkeleton variant="text" width="40%" height={28} />
            <LoadingSkeleton variant="text" width="80%" />
          </div>
        ))}
      </div>
      {/* Chart area */}
      <div className="glass rounded-xl p-5">
        <LoadingSkeleton variant="text" width="30%" className="mb-4" />
        <LoadingSkeleton variant="rectangular" height={200} />
      </div>
      {/* List */}
      <div className="glass rounded-xl p-5 space-y-3">
        <LoadingSkeleton variant="text" width="25%" className="mb-2" />
        <LoadingSkeleton variant="text" count={5} className="mb-2" />
      </div>
    </div>
  );
}
