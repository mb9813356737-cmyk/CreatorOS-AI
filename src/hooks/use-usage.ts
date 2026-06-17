"use client";

import { useState, useEffect, useCallback } from "react";
import { calcPercentage } from "@/lib/utils";

// ─── Usage Hook ────────────────────────────────────────────

interface UsageData {
  creditsUsed: number;
  monthlyCredits: number;
  creditsRemaining: number;
  percentage: number;
  isUnlimited: boolean;
  niche: string | null;
  platform: string | null;
}

interface UseUsageReturn {
  usage: UsageData | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function useUsage(): UseUsageReturn {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsage = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/user/usage", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();

      const isUnlimited = data.monthlyCredits === -1;
      const creditsRemaining = isUnlimited
        ? Infinity
        : Math.max(0, data.monthlyCredits - data.creditsUsed);

      setUsage({
        creditsUsed: data.creditsUsed,
        monthlyCredits: data.monthlyCredits,
        creditsRemaining,
        percentage: isUnlimited ? 0 : calcPercentage(data.creditsUsed, data.monthlyCredits),
        isUnlimited,
        niche: data.niche || null,
        platform: data.platform || null,
      });
    } catch {
      // Silently fail — usage display is non-critical
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  return { usage, isLoading, refetch: fetchUsage };
}
