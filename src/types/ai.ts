// ─── AI Types ──────────────────────────────────────────────

export type GenerationType =
  | "VIRAL_HOOK"
  | "CAPTION"
  | "SCRIPT"
  | "THUMBNAIL"
  | "TREND"
  | "VIRAL_SCORE"
  | "REPURPOSE";

export interface GenerationInput {
  topic: string;
  platform?: string;
  tone?: string;
  language?: string;
  duration?: string;
  niche?: string;
  sourceContent?: string;
  targetPlatform?: string;
  additionalContext?: string;
  youtubeUrl?: string;
  competitorHandle?: string;
}

export interface GenerationResult {
  id: string;
  type: GenerationType;
  input: GenerationInput;
  output: string;
  viralScore?: number;
  tokens: number;
  createdAt: string;
  isFavorite: boolean;
}

export interface ViralScoreBreakdown {
  hook: number;
  emotion: number;
  shareability: number;
  relatability: number;
  timeliness: number;
  platform_fit: number;
}

export interface ViralScoreResult {
  overall_score: number;
  breakdown: ViralScoreBreakdown;
  improvements: string[];
  benchmark_comparison: string;
  verdict: string;
}

export interface TrendItem {
  topic: string;
  relevance_score: number;
  content_ideas: string[];
  hashtags: string[];
  peak_timing: string;
}

export interface HookItem {
  hook: string;
  score: number;
  emotion: string;
  language: string;
  platform_fit: string;
  retention_score: number;
  ctr_prediction: string;
  emotional_intensity: number;
  why_it_works: string;
}

export interface HookMeta {
  avg_retention: number;
  avg_ctr: string;
  avg_emotional_intensity: number;
  top_emotion: string;
  tone_used: string;
}

export interface HookGenerationResult {
  hooks: HookItem[];
  meta: HookMeta;
}

export interface CaptionResult {
  caption: string;
  hashtags: string[];
  cta: string;
  language: string;
  char_count: number;
}

export interface ScriptSection {
  id: string;
  label: string;
  timestamp: string;
  duration_seconds: number;
  dialogue: string;
  visual_cue: string;
  audio_cue: string;
  text_overlay: string;
  caption: string;
  camera_direction: string;
  transition_to_next: string;
  emotional_intensity: number;
  retention_note: string;
}

export interface ScriptResult {
  title: string;
  duration: string;
  language: string;
  retention_score: number;
  pacing_curve: number[];
  scenes: ScriptSection[];
  tips: string[];
  hashtags: string[];
}
