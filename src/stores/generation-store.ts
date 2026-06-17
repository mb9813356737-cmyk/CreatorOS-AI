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
  currentOutput: string | null;
  error: string | null;

  // History cache (client-side)
  recentGenerations: GenerationResult[];

  // Actions
  startGeneration: (type: GenerationType, input: GenerationInput) => void;
  setOutput: (output: string) => void;
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
  currentOutput: null,
  error: null,
  recentGenerations: [],

  startGeneration: (type, input) =>
    set({
      isGenerating: true,
      currentType: type,
      currentInput: input,
      currentOutput: null,
      error: null,
    }),

  setOutput: (output) =>
    set({ currentOutput: output, isGenerating: false }),

  setError: (error) =>
    set({ error, isGenerating: false }),

  reset: () =>
    set({
      isGenerating: false,
      currentType: null,
      currentInput: null,
      currentOutput: null,
      error: null,
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
