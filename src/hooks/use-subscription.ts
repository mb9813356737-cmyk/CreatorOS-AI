"use client";

import { useState, useEffect, useCallback } from "react";
import type { Plan, SubscriptionStatus } from "@/types/subscription";

// ─── Subscription Hook ─────────────────────────────────────

interface SubscriptionData {
  plan: Plan;
  status: SubscriptionStatus;
  subscriptionEnd: string | null;
  monthlyCredits: number;
  creditsUsed: number;
  role: string;
}

interface UseSubscriptionReturn {
  subscription: SubscriptionData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isPro: boolean;
  isAgency: boolean;
  canAccess: (feature: string) => boolean;
}

export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/user/usage", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch subscription");
      const data = await res.json();
      setSubscription(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const isPro = subscription?.plan === "PRO" || subscription?.plan === "AGENCY";
  const isAgency = subscription?.plan === "AGENCY";

  const canAccess = useCallback(
    (feature: string): boolean => {
      if (!subscription) return false;
      const plan = subscription.plan;
      // Map features to required plans
      const featureAccess: Record<string, Plan[]> = {
        VIRAL_HOOK: ["FREE", "PRO", "AGENCY"],
        CAPTION: ["FREE", "PRO", "AGENCY"],
        SCRIPT: ["PRO", "AGENCY"],
        THUMBNAIL: ["PRO", "AGENCY"],
        TREND: ["PRO", "AGENCY"],
        VIRAL_SCORE: ["PRO", "AGENCY"],
        REPURPOSE: ["AGENCY"],
      };
      return featureAccess[feature]?.includes(plan) ?? false;
    },
    [subscription]
  );

  return {
    subscription,
    isLoading,
    error,
    refetch: fetchSubscription,
    isPro,
    isAgency,
    canAccess,
  };
}
