import { db } from "@/lib/prisma";

// ─── Token & Cost Constants ─────────────────────────────────
// Cost rates per 1,000 tokens in USD
export const PROVIDER_RATES = {
  gemini: {
    model: "gemini-2.5-flash",
    promptRate: 0.000075,
    completionRate: 0.0003,
  },
  groq: {
    model: "llama-3.3-70b-specdec",
    promptRate: 0.00059,
    completionRate: 0.00079,
  },
  openai: {
    model: "gpt-4o",
    promptRate: 0.0025,
    completionRate: 0.0075,
  },
} as const;

const USD_TO_INR = 83.5; // Fixed conversion rate for analytics in INR

export interface TelemetryMetrics {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  providerCostUsd: number;
  providerCostInr: number;
  estimatedProfitInr: number;
}

// Approximation formula: 1 token ~ 4 characters
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

export function calculateMetrics(
  provider: "gemini" | "groq" | "openai",
  promptText: string,
  completionText: string
): TelemetryMetrics {
  const promptTokens = estimateTokens(promptText);
  const completionTokens = estimateTokens(completionText);
  const totalTokens = promptTokens + completionTokens;

  const rate = PROVIDER_RATES[provider] || PROVIDER_RATES.gemini;
  const promptCost = (promptTokens / 1000) * rate.promptRate;
  const completionCost = (completionTokens / 1000) * rate.completionRate;
  const providerCostUsd = promptCost + completionCost;
  
  const providerCostInr = providerCostUsd * USD_TO_INR;

  // We charge user credits, representing about ₹5 per generation value (₹499/100 generations ~ ₹5 value)
  const averageGenerationChargeInr = 5.0;
  const estimatedProfitInr = Math.max(0, averageGenerationChargeInr - providerCostInr);

  return {
    promptTokens,
    completionTokens,
    totalTokens,
    providerCostUsd,
    providerCostInr,
    estimatedProfitInr,
  };
}

// ─── Telemetry Database Logger ──────────────────────────────
export async function logTelemetry({
  userId,
  generationId,
  provider,
  model,
  promptText,
  completionText,
  responseTimeMs,
  cacheHit = false,
}: {
  userId: string;
  generationId?: string;
  provider: "gemini" | "groq" | "openai";
  model: string;
  promptText: string;
  completionText: string;
  responseTimeMs: number;
  cacheHit?: boolean;
}) {
  try {
    const metrics = calculateMetrics(provider, promptText, completionText);

    // 1. Create Usage Record
    await db.aIUsageAnalytics.create({
      data: {
        userId,
        generationId,
        promptTokens: metrics.promptTokens,
        completionTokens: metrics.completionTokens,
        totalTokens: metrics.totalTokens,
        providerCost: metrics.providerCostInr,
        estimatedProfit: metrics.estimatedProfitInr,
        providerUsed: provider,
        modelUsed: model,
        responseTimeMs,
        cacheHit,
      },
    });

    // 2. Rollup to Global Financial Telemetry
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    await db.costTelemetry.upsert({
      where: { date: today },
      create: {
        date: today,
        totalCost: metrics.providerCostInr,
        totalRevenue: 5.0, // average value contribution
        netProfit: metrics.estimatedProfitInr,
        tokensCount: metrics.totalTokens,
        requestsCount: 1,
      },
      update: {
        totalCost: { increment: metrics.providerCostInr },
        totalRevenue: { increment: 5.0 },
        netProfit: { increment: metrics.estimatedProfitInr },
        tokensCount: { increment: metrics.totalTokens },
        requestsCount: { increment: 1 },
      },
    });

    console.log(`[AI Telemetry] Cost logged successfully for user ${userId}: Cost=₹${metrics.providerCostInr.toFixed(4)}, Tokens=${metrics.totalTokens}`);
  } catch (err) {
    console.error("[AI Telemetry] Failed to log usage metrics:", err);
  }
}
