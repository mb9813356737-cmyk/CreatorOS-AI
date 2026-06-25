"use client";

import { create } from "zustand";
import type { GenerationResult, GenerationInput, GenerationType } from "@/types/ai";

// ─── Generation Store ──────────────────────────────────────
// Manages current AI generation state and output cache

interface GenerationState {
  // Current generation
  isGenerating: boolean;
  currentType: GenerationType | null;
  currentInput: GenerationInput | null;
  error: string | null;

  // Isolated outputs
  hooksOutput: string | null;
  captionOutput: string | null;
  scriptOutput: string | null;
  trendOutput: string | null;
  viralScoreOutput: string | null;
  repurposeOutput: string | null;
  thumbnailOutput: string | null;

  // History cache (client-side)
  recentGenerations: GenerationResult[];

  // Actions
  startGeneration: (type: GenerationType, input: GenerationInput) => void;
  setOutput: (type: GenerationType, output: string) => void;
  setError: (error: string) => void;
  reset: () => void;
  addToHistory: (result: GenerationResult) => void;
  toggleFavorite: (id: string) => void;
  clearHistory: () => void;
}

export const useGenerationStore = create<GenerationState>((set) => ({
  isGenerating: false,
  currentType: null,
  currentInput: null,
  error: null,

  hooksOutput: null,
  captionOutput: null,
  scriptOutput: null,
  trendOutput: null,
  viralScoreOutput: null,
  repurposeOutput: null,
  thumbnailOutput: null,

  recentGenerations: [],

  startGeneration: (type, input) => {
    const resetKey = getOutputKey(type);
    set({
      isGenerating: true,
      currentType: type,
      currentInput: input,
      error: null,
      ...(resetKey ? { [resetKey]: null } : {}),
    });
  },

  setOutput: (type, output) => {
    const outputKey = getOutputKey(type);
    set({
      isGenerating: false,
      ...(outputKey ? { [outputKey]: output } : {}),
    });
  },

  setError: (error) =>
    set({ error, isGenerating: false }),

  reset: () =>
    set({
      isGenerating: false,
      currentType: null,
      currentInput: null,
      error: null,
      hooksOutput: null,
      captionOutput: null,
      scriptOutput: null,
      trendOutput: null,
      viralScoreOutput: null,
      repurposeOutput: null,
      thumbnailOutput: null,
    }),

  addToHistory: (result) =>
    set((state) => ({
      recentGenerations: [result, ...state.recentGenerations].slice(0, 50),
    })),

  toggleFavorite: (id) =>
    set((state) => ({
      recentGenerations: state.recentGenerations.map((g) =>
        g.id === id ? { ...g, isFavorite: !g.isFavorite } : g
      ),
    })),

  clearHistory: () =>
    set({ recentGenerations: [] }),
}));

function getOutputKey(type: GenerationType): string | null {
  switch (type) {
    case "VIRAL_HOOK": return "hooksOutput";
    case "CAPTION": return "captionOutput";
    case "SCRIPT": return "scriptOutput";
    case "TREND": return "trendOutput";
    case "VIRAL_SCORE": return "viralScoreOutput";
    case "REPURPOSE": return "repurposeOutput";
    case "THUMBNAIL": return "thumbnailOutput";
    default: return null;
  }
}
