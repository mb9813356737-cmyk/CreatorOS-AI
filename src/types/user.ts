// ─── User Types ────────────────────────────────────────────

import type { Plan, SubscriptionStatus } from "./subscription";

export interface UserProfile {
  id: string;
  clerkId?: string | null;
  email: string;
  name: string | null;
  imageUrl: string | null;
  plan: Plan;
  subscriptionStatus: SubscriptionStatus;
  subscriptionEnd: string | null;
  monthlyCredits: number;
  creditsUsed: number;
  creditsResetAt: string | null;
  emailVerified: boolean;
  createdAt: string;
}

export interface UserStats {
  totalGenerations: number;
  creditsUsed: number;
  creditsRemaining: number;
  creditLimit: number;
  favoriteCount: number;
  generationsByType: Record<string, number>;
}
