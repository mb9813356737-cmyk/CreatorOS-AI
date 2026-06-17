// ─── Subscription Types ────────────────────────────────────

export type Plan = "FREE" | "PRO" | "AGENCY";
export type SubscriptionStatus = "INACTIVE" | "ACTIVE" | "PAST_DUE" | "CANCELLED" | "EXPIRED";

export interface Subscription {
  plan: Plan;
  status: SubscriptionStatus;
  subscriptionEnd: string | null;
  monthlyCredits: number;
  creditsUsed: number;
  creditsResetAt: string | null;
}

export interface PricingTier {
  id: Plan;
  name: string;
  description: string;
  price: number;
  priceDisplay: string;
  period: string;
  credits: number;
  features: string[];
  popular?: boolean;
}
