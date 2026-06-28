"use client";

import { useState, useCallback } from "react";
import { useGenerationStore } from "@/stores/generation-store";
import type { GenerationType, GenerationInput, GenerationResult } from "@/types/ai";

// ─── AI Generation Hook ────────────────────────────────────
// Unified hook for all AI generation calls

interface UseAIGenerateReturn {
  generate: (type: GenerationType, input: GenerationInput) => Promise<void>;
  output: string | null;
  isGenerating: boolean;
  error: string | null;
  reset: () => void;
}

export function useAIGenerate(expectedType?: GenerationType): UseAIGenerateReturn {
  const store = useGenerationStore();
  const [localError, setLocalError] = useState<string | null>(null);

  const generate = useCallback(
    async (type: GenerationType, input: GenerationInput) => {
      console.log("[useAIGenerate] Starting generation type:", type, "input:", input);
      try {
        setLocalError(null);
        store.startGeneration(type, input);

        const response = await fetch(`/api/ai/${typeToRoute(type)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });

        console.log("[useAIGenerate] API Response Status:", response.status, "OK:", response.ok);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("[useAIGenerate] Generation failed errorData:", errorData);
          const errorMsg =
            errorData.error || `Generation failed (${response.status})`;

          // Handle specific error codes
          if (response.status === 429) {
            throw new Error("Rate limit exceeded. Please wait a moment.");
          }
          if (response.status === 403) {
            throw new Error("This feature requires a higher plan. Please upgrade.");
          }
          throw new Error(errorMsg);
        }

        const data = await response.json();
        console.log("[useAIGenerate] Parsed response JSON data:", data);
        store.setOutput(type, data.output);

        // Add to history
        const result: GenerationResult = {
          id: data.id || crypto.randomUUID(),
          type,
          input,
          output: data.output,
          viralScore: data.viralScore,
          tokens: data.tokens || 0,
          createdAt: new Date().toISOString(),
          isFavorite: false,
        };
        store.addToHistory(result);
      } catch (err) {
        console.error("[useAIGenerate] Exception during generate execution:", err);
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred";
        store.setError(message);
        setLocalError(message);
      }
    },
    [store]
  );

  const getOutput = () => {
    if (!expectedType) return null;
    switch (expectedType) {
      case "VIRAL_HOOK": return store.hooksOutput;
      case "CAPTION": return store.captionOutput;
      case "SCRIPT": return store.scriptOutput;
      case "TREND": return store.trendOutput;
      case "VIRAL_SCORE": return store.viralScoreOutput;
      case "REPURPOSE": return store.repurposeOutput;
      case "THUMBNAIL": return store.thumbnailOutput;
      default: return null;
    }
  };

  const isGenerating = store.isGenerating && store.currentType === expectedType;
  const error = store.currentType === expectedType ? (store.error || localError) : null;

  return {
    generate,
    output: getOutput(),
    isGenerating,
    error,
    reset: store.reset,
  };
}

// ─── Map GenerationType to API route segment ───────────────
function typeToRoute(type: GenerationType): string {
  const routes: Record<GenerationType, string> = {
    VIRAL_HOOK: "hooks",
    CAPTION: "captions",
    SCRIPT: "scripts",
    THUMBNAIL: "thumbnails",
    TREND: "trends",
    VIRAL_SCORE: "viral-score",
    REPURPOSE: "repurpose",
  };
  return routes[type];
}
