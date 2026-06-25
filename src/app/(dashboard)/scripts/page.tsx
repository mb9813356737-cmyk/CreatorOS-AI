"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAIGenerate } from "@/hooks/use-ai-generate";
import { OutputCard } from "@/components/ai/output-card";
import { LANGUAGES } from "@/lib/constants";
import {
  Sparkles,
  Film,
  Clock,
  Eye,
  Camera,
  Music,
  Type,
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
  Download,
  Clapperboard,
  Hash,
  Lightbulb,
  Zap,
  Volume2,
  MonitorPlay,
  ChevronDown,
  ChevronUp,
  Play,
  Subtitles,
} from "lucide-react";

// ─── Constants ──────────────────────────────────────────────

const DURATION_OPTIONS = [
  { value: "30s", label: "30 Seconds (Standard)" },
  { value: "60s", label: "60 Seconds (Cinematic)" },
] as const;

const SCRIPT_PLATFORMS = [
  { value: "shorts", label: "YouTube Shorts" },
  { value: "reels", label: "Instagram Reels" },
] as const;

// ─── Scene Icon + Color Map ─────────────────────────────────

const SCENE_STYLES: Record<string, { icon: React.ReactNode; gradient: string; border: string }> = {
  hook: {
    icon: <Zap className="h-4 w-4" />,
    gradient: "from-amber-500/20 to-orange-500/10",
    border: "border-amber-500/30",
  },
  scene_1: {
    icon: <Play className="h-4 w-4" />,
    gradient: "from-brand-500/20 to-accent-500/10",
    border: "border-brand-500/30",
  },
  scene_2: {
    icon: <Film className="h-4 w-4" />,
    gradient: "from-pink-500/20 to-brand-500/10",
    border: "border-pink-500/30",
  },
  scene_3: {
    icon: <Sparkles className="h-4 w-4" />,
    gradient: "from-emerald-500/20 to-accent-500/10",
    border: "border-emerald-500/30",
  },
  transition: {
    icon: <ArrowRight className="h-4 w-4" />,
    gradient: "from-accent-500/20 to-brand-500/10",
    border: "border-accent-500/30",
  },
  cta: {
    icon: <MonitorPlay className="h-4 w-4" />,
    gradient: "from-emerald-500/20 to-emerald-500/10",
    border: "border-emerald-500/30",
  },
};

function getSceneStyle(id: string) {
  return SCENE_STYLES[id] || SCENE_STYLES.scene_1;
}

// ─── Retention Score Gauge ──────────────────────────────────

function RetentionGauge({ score }: { score: number }) {
  const clampedScore = Math.min(100, Math.max(0, score));
  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  const getColor = () => {
    if (clampedScore >= 80) return "text-emerald-400";
    if (clampedScore >= 60) return "text-amber-400";
    return "text-red-400";
  };

  const getLabel = () => {
    if (clampedScore >= 80) return "Excellent";
    if (clampedScore >= 60) return "Good";
    return "Needs Work";
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="oklch(0.20 0.01 270)" strokeWidth="6" />
          <motion.circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            className={getColor()}
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`text-2xl font-bold ${getColor()}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            {clampedScore}
          </motion.span>
          <span className="text-[10px] text-text-muted uppercase tracking-wider">Retention</span>
        </div>
      </div>
      <Badge variant="outline" className={`text-xs ${getColor()}`}>
        {getLabel()}
      </Badge>
    </div>
  );
}

// ─── Pacing Curve Visualization ─────────────────────────────

function PacingCurve({ values, labels }: { values: number[]; labels: string[] }) {
  if (!values || values.length === 0) return null;
  const max = Math.max(...values, 10);
  const width = 100 / values.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <Zap className="h-3.5 w-3.5 text-amber-400" />
        <span className="uppercase tracking-wider font-semibold">Emotional Pacing Curve</span>
      </div>
      <div className="flex items-end gap-1 h-16 px-1">
        {values.map((v, i) => {
          const height = Math.max((v / max) * 100, 8);
          const getBarColor = () => {
            if (v >= 8) return "bg-amber-400";
            if (v >= 5) return "bg-brand-400";
            return "bg-accent-400";
          };
          return (
            <motion.div
              key={i}
              className="flex flex-col items-center gap-1 flex-1"
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
              style={{ transformOrigin: "bottom" }}
            >
              <span className="text-[9px] text-text-muted font-medium">{v}</span>
              <div
                className={`w-full rounded-t-sm ${getBarColor()} transition-all`}
                style={{ height: `${height}%`, minHeight: "4px" }}
              />
              <span className="text-[8px] text-text-muted truncate max-w-full text-center leading-tight">
                {labels[i] || `S${i + 1}`}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Scene Card ─────────────────────────────────────────────

function SceneCard({
  scene,
  index,
  isExpanded,
  onToggle,
}: {
  scene: {
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
  };
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [copied, setCopied] = React.useState(false);
  const style = getSceneStyle(scene.id);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(scene.dialogue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
    >
      <div
        className={`rounded-xl border ${style.border} bg-gradient-to-br ${style.gradient} backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-brand-500/40`}
      >
        {/* Scene Header */}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between p-4 text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-100/80 border border-glass-border text-brand-400">
              {style.icon}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-primary">{scene.label}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-text-muted flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {scene.timestamp}
                </span>
                <span className="text-[10px] text-text-muted">•</span>
                <span className="text-xs text-text-muted">{scene.duration_seconds}s</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Emotional intensity indicator */}
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 h-3 rounded-full transition-colors ${
                      i < scene.emotional_intensity
                        ? scene.emotional_intensity >= 8
                          ? "bg-amber-400"
                          : scene.emotional_intensity >= 5
                          ? "bg-brand-400"
                          : "bg-accent-400"
                        : "bg-surface-300/50"
                    }`}
                  />
                ))}
              </div>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-text-muted group-hover:text-text-primary transition-colors" />
            ) : (
              <ChevronDown className="h-4 w-4 text-text-muted group-hover:text-text-primary transition-colors" />
            )}
          </div>
        </button>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3 border-t border-glass-border/30 pt-3">
                {/* Dialogue */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold flex items-center gap-1.5">
                      <Volume2 className="h-3 w-3 text-brand-400" /> Dialogue
                    </span>
                    <button
                      onClick={handleCopy}
                      className="text-xs text-text-muted hover:text-brand-400 flex items-center gap-1 transition-colors"
                    >
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <p className="text-sm text-text-primary leading-relaxed bg-surface-100/50 rounded-lg p-3 border border-glass-border/20">
                    &ldquo;{scene.dialogue}&rdquo;
                  </p>
                </div>

                {/* Grid of metadata */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-surface-100/40 p-2.5 border border-glass-border/20 space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-text-muted font-bold flex items-center gap-1">
                      <Camera className="h-3 w-3 text-pink-400" /> Camera
                    </span>
                    <p className="text-xs text-text-secondary">{scene.camera_direction}</p>
                  </div>
                  <div className="rounded-lg bg-surface-100/40 p-2.5 border border-glass-border/20 space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-text-muted font-bold flex items-center gap-1">
                      <ArrowRight className="h-3 w-3 text-accent-400" /> Transition
                    </span>
                    <p className="text-xs text-text-secondary">{scene.transition_to_next}</p>
                  </div>
                  <div className="rounded-lg bg-surface-100/40 p-2.5 border border-glass-border/20 space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-text-muted font-bold flex items-center gap-1">
                      <Eye className="h-3 w-3 text-emerald-400" /> Visual
                    </span>
                    <p className="text-xs text-text-secondary">{scene.visual_cue}</p>
                  </div>
                  <div className="rounded-lg bg-surface-100/40 p-2.5 border border-glass-border/20 space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-text-muted font-bold flex items-center gap-1">
                      <Music className="h-3 w-3 text-amber-400" /> Audio
                    </span>
                    <p className="text-xs text-text-secondary">{scene.audio_cue}</p>
                  </div>
                </div>

                {/* Text Overlay & Caption */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-surface-100/40 p-2.5 border border-glass-border/20 space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-text-muted font-bold flex items-center gap-1">
                      <Type className="h-3 w-3 text-brand-400" /> Text Overlay
                    </span>
                    <p className="text-xs text-text-secondary font-medium">{scene.text_overlay}</p>
                  </div>
                  <div className="rounded-lg bg-surface-100/40 p-2.5 border border-glass-border/20 space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-text-muted font-bold flex items-center gap-1">
                      <Subtitles className="h-3 w-3 text-accent-400" /> Caption
                    </span>
                    <p className="text-xs text-text-secondary">{scene.caption}</p>
                  </div>
                </div>

                {/* Retention Note */}
                <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/15 p-2.5 space-y-1">
                  <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1">
                    <Eye className="h-3 w-3" /> Why This Keeps Viewers
                  </span>
                  <p className="text-xs text-text-secondary italic">{scene.retention_note}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Loading Skeleton ───────────────────────────────────────

function ScriptLoadingSkeleton() {
  return (
    <Card variant="glass" className="h-full min-h-[400px] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-pink-500/5" />
      <CardContent className="p-6 relative z-10">
        <div className="flex flex-col items-center justify-center gap-6 py-12">
          {/* Clapperboard animation */}
          <div className="relative">
            <motion.div
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/20 to-pink-500/20 border border-brand-500/30 flex items-center justify-center"
            >
              <Clapperboard className="h-8 w-8 text-brand-400" />
            </motion.div>
            <motion.div
              className="absolute -inset-3 rounded-2xl border border-brand-500/20"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>

          <div className="text-center space-y-2">
            <motion.p
              className="text-sm font-semibold text-text-primary"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Crafting your cinematic script...
            </motion.p>
            <p className="text-xs text-text-muted">
              Breaking down scenes, transitions, and emotional pacing
            </p>
          </div>

          {/* Progress bars */}
          <div className="w-full max-w-xs space-y-2">
            {["Analyzing topic...", "Building scenes...", "Optimizing retention..."].map((text, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.8 }}
                className="flex items-center gap-2"
              >
                <div className="h-1 flex-1 bg-surface-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-brand-500 to-pink-500 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ delay: i * 0.8, duration: 2, ease: "easeInOut" }}
                  />
                </div>
                <span className="text-[10px] text-text-muted w-32 shrink-0">{text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ──────────────────────────────────────────────

export default function ScriptsPage() {
  const { generate, output, isGenerating, error, reset } = useAIGenerate();
  const [topic, setTopic] = React.useState("");
  const [duration, setDuration] = React.useState("30s");
  const [platform, setPlatform] = React.useState("shorts");
  const [language, setLanguage] = React.useState("hinglish");
  const [additionalContext, setAdditionalContext] = React.useState("");
  const [expandedScenes, setExpandedScenes] = React.useState<Set<number>>(new Set([0]));
  const [copiedAll, setCopiedAll] = React.useState(false);

  // Auto-save draft to localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem("creatoros-script-draft");
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        if (draft.topic) setTopic(draft.topic);
        if (draft.duration) setDuration(draft.duration);
        if (draft.platform) setPlatform(draft.platform);
        if (draft.language) setLanguage(draft.language);
        if (draft.additionalContext) setAdditionalContext(draft.additionalContext);
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(
        "creatoros-script-draft",
        JSON.stringify({ topic, duration, platform, language, additionalContext })
      );
    }, 500);
    return () => clearTimeout(timer);
  }, [topic, duration, platform, language, additionalContext]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setExpandedScenes(new Set([0]));
    generate("SCRIPT", { topic, duration, platform, language, additionalContext });
  };

  const handleRegenerate = () => {
    if (!topic.trim()) return;
    setExpandedScenes(new Set([0]));
    generate("SCRIPT", { topic, duration, platform, language, additionalContext });
  };

  const toggleScene = (idx: number) => {
    setExpandedScenes((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const expandAll = () => {
    if (parsedScript) {
      setExpandedScenes(new Set(parsedScript.scenes.map((_: unknown, i: number) => i)));
    }
  };

  const collapseAll = () => setExpandedScenes(new Set());

  // Parse the script output
  const parsedScript = React.useMemo(() => {
    if (!output) return null;
    try {
      const clean = output.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(clean);
      if (parsed && (parsed.content_type === "caption" || parsed.generator === "caption_generator")) {
        return null;
      }
      if (parsed && parsed.content_type && parsed.content_type !== "script" && parsed.content_type !== "video") {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }, [output]);

  const handleCopyAll = async () => {
    if (!parsedScript) return;
    const fullScript = parsedScript.scenes
      .map(
        (s: { label: string; timestamp: string; dialogue: string; visual_cue: string; audio_cue: string; text_overlay: string }) =>
          `[${s.label}] (${s.timestamp})\n${s.dialogue}\n[Visual: ${s.visual_cue}]\n[Audio: ${s.audio_cue}]\n[Text: ${s.text_overlay}]`
      )
      .join("\n\n---\n\n");
    await navigator.clipboard.writeText(fullScript);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleExport = () => {
    if (!parsedScript) return;
    const blob = new Blob([JSON.stringify(parsedScript, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `script-${parsedScript.title?.replace(/\s+/g, "-").toLowerCase() || "export"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      <PageHeader
        title="Shorts & Reels Scripts"
        description="Cinema-grade short-form scripts with scene breakdowns, emotional pacing, transitions, and retention optimization."
        badge="AI Tools (Pro)"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ─── Left Panel: Generator Controls ─────────────── */}
        <div className="lg:col-span-4 space-y-4">
          <Card variant="glass" className="relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />
            <CardHeader className="pb-3 pt-5">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-pink-500/15 border border-pink-500/20">
                  <Clapperboard className="h-4 w-4 text-pink-400" />
                </div>
                Script Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                      Script Topic / Idea
                    </label>
                    <span className="text-[10px] text-text-muted">
                      {topic.length}/2000
                    </span>
                  </div>
                  <Textarea
                    placeholder="e.g. 3 secret iPhone features you didn't know"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    maxLength={2000}
                    required
                    className="min-h-[60px] text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                      Duration
                    </label>
                    <Select options={DURATION_OPTIONS} value={duration} onChange={setDuration} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                      Platform
                    </label>
                    <Select options={SCRIPT_PLATFORMS} value={platform} onChange={setPlatform} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                    Language Mode
                  </label>
                  <Select options={LANGUAGES} value={language} onChange={setLanguage} />
                  <p className="text-[10px] text-text-muted mt-1">
                    {language === "haryanvi"
                      ? "🔥 Bold Haryanvi dialect — raw, earthy, unapologetic"
                      : language === "hindi"
                      ? "🇮🇳 Street-smart Hindi — relatable and natural"
                      : language === "hinglish"
                      ? "🤙 Hindi-English mix — the way Gen-Z speaks"
                      : "🌐 Clean English for global reach"}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                    Additional Context{" "}
                    <span className="text-text-muted/60 normal-case font-normal">(optional)</span>
                  </label>
                  <Textarea
                    placeholder="Any specific instructions, target audience, mood, or style notes..."
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                    className="min-h-[60px] text-xs"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-brand-600 to-pink-600 hover:from-brand-500 hover:to-pink-500 transition-all shadow-lg shadow-brand-500/20"
                  isLoading={isGenerating}
                  leftIcon={!isGenerating && <Sparkles className="h-4.5 w-4.5" />}
                >
                  Generate Script
                </Button>

                {/* Auto-save indicator */}
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-text-muted/60">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 animate-pulse" />
                  Draft auto-saved
                </div>
              </form>
            </CardContent>
          </Card>

          {/* ─── Live Preview Panel ──────────────────────── */}
          {parsedScript && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card variant="glass" className="relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                <CardContent className="p-4 space-y-4">
                  {/* Retention Gauge + Pacing */}
                  <div className="flex items-start gap-4">
                    <RetentionGauge score={parsedScript.retention_score || 0} />
                    <div className="flex-1 min-w-0">
                      <PacingCurve
                        values={parsedScript.pacing_curve || parsedScript.scenes?.map((s: { emotional_intensity: number }) => s.emotional_intensity) || []}
                        labels={parsedScript.scenes?.map((s: { id: string }) => s.id) || []}
                      />
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 rounded-lg bg-surface-100/40 border border-glass-border/20">
                      <div className="text-lg font-bold text-text-primary">
                        {parsedScript.scenes?.length || 0}
                      </div>
                      <div className="text-[9px] text-text-muted uppercase tracking-wider">Scenes</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-surface-100/40 border border-glass-border/20">
                      <div className="text-lg font-bold text-text-primary">
                        {parsedScript.duration || "30s"}
                      </div>
                      <div className="text-[9px] text-text-muted uppercase tracking-wider">Duration</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-surface-100/40 border border-glass-border/20">
                      <div className="text-lg font-bold text-text-primary capitalize">
                        {parsedScript.language || language}
                      </div>
                      <div className="text-[9px] text-text-muted uppercase tracking-wider">Language</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* ─── Right Panel: Cinematic Output ─────────────── */}
        <div className="lg:col-span-8">
          {/* Loading State */}
          {isGenerating && <ScriptLoadingSkeleton />}

          {/* Error State */}
          {error && !isGenerating && (
            <Card variant="glass" className="border-error/30">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-error">{error}</p>
                <Button variant="secondary" size="sm" className="mt-4" onClick={handleRegenerate}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!output && !isGenerating && !error && (
            <Card variant="glass" className="h-full min-h-[400px] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-brand-500/5" />
              <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[400px] relative z-10">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500/15 to-brand-500/15 border border-pink-500/20 flex items-center justify-center mb-6"
                >
                  <Film className="h-10 w-10 text-pink-400" />
                </motion.div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Cinematic Script Generator
                </h3>
                <p className="text-sm text-text-secondary text-center max-w-sm">
                  Enter your topic and generate cinema-grade short-form scripts with scene breakdowns,
                  emotional pacing, and retention optimization.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-6">
                  {["Scene Breakdown", "Transitions", "Pacing Curve", "Retention Score"].map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 text-[10px] rounded-full bg-surface-200/50 text-text-muted border border-glass-border/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Script Output */}
          {parsedScript && parsedScript.scenes && !isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* Script Header */}
              <Card variant="glass" className="relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent" />
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                        <Clapperboard className="h-5 w-5 text-pink-400" />
                        {parsedScript.title || "Generated Script"}
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <Badge variant="outline" className="text-xs text-pink-400 border-pink-500/30">
                          <Clock className="h-3 w-3 mr-1" />
                          {parsedScript.duration || duration}
                        </Badge>
                        <Badge variant="outline" className="text-xs text-brand-400 border-brand-500/30 capitalize">
                          {parsedScript.language || language}
                        </Badge>
                        <Badge variant="outline" className="text-xs text-accent-400 border-accent-500/30 capitalize">
                          {platform}
                        </Badge>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="ghost" size="sm" onClick={handleCopyAll}>
                        {copiedAll ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleExport}>
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleRegenerate}>
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Expand/Collapse All */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-glass-border/20">
                    <button
                      onClick={expandAll}
                      className="text-[10px] uppercase tracking-wider font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                    >
                      Expand All
                    </button>
                    <span className="text-text-muted/30">|</span>
                    <button
                      onClick={collapseAll}
                      className="text-[10px] uppercase tracking-wider font-semibold text-text-muted hover:text-text-secondary transition-colors"
                    >
                      Collapse All
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Scene Cards */}
              <div className="space-y-3">
                {parsedScript.scenes?.map((scene: {
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
                }, idx: number) => (
                  <SceneCard
                    key={scene.id + idx}
                    scene={scene}
                    index={idx}
                    isExpanded={expandedScenes.has(idx)}
                    onToggle={() => toggleScene(idx)}
                  />
                ))}
              </div>

              {/* Tips & Hashtags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pro Tips */}
                {parsedScript.tips && parsedScript.tips.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Card variant="glass">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                          <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                          <span className="uppercase tracking-wider font-bold">Pro Filming Tips</span>
                        </div>
                        <div className="space-y-2">
                          {parsedScript.tips.map((tip: string, i: number) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-[10px] text-amber-400 mt-0.5 font-bold shrink-0">
                                {i + 1}.
                              </span>
                              <p className="text-xs text-text-secondary">{tip}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Hashtags */}
                {parsedScript.hashtags && parsedScript.hashtags.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Card variant="glass">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                          <Hash className="h-3.5 w-3.5 text-accent-400" />
                          <span className="uppercase tracking-wider font-bold">Suggested Hashtags</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {parsedScript.hashtags.map((tag: string, i: number) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 text-xs rounded-full bg-accent-500/10 text-accent-400 border border-accent-500/20 cursor-pointer hover:bg-accent-500/20 transition-colors"
                              onClick={() => navigator.clipboard.writeText(tag)}
                            >
                              {tag.startsWith("#") ? tag : `#${tag}`}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>

              {/* Raw Output Fallback */}
              {!parsedScript.scenes && output && (
                <Card variant="glass">
                  <CardContent className="p-5">
                    <p className="whitespace-pre-line text-sm text-text-primary leading-relaxed">
                      {output}
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* Non-Script output fallback (routes dynamically via OutputCard) */}
          {output && (!parsedScript || !parsedScript.scenes) && !isGenerating && (
            <OutputCard
              type="SCRIPT"
              output={output}
              isGenerating={isGenerating}
              error={error}
            />
          )}
        </div>
      </div>
    </div>
  );
}
