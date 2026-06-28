"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Copy,
  Check,
  Flame,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Download,
  BarChart3,
  Zap,
  TrendingUp,
  Heart,
  Eye,
  MousePointerClick,
  Brain,
} from "lucide-react";
import type { HookItem, HookMeta } from "@/types/ai";

// ─── Types ─────────────────────────────────────────────────
interface HookGeneratorOutputProps {
  output: string | null;
  isGenerating: boolean;
  error: string | null;
  onRegenerate?: () => void;
  onExport?: (format: "json" | "csv" | "txt") => void;
}

interface ParsedHookResult {
  hooks: HookItem[];
  meta: HookMeta;
}

// ─── Helpers ───────────────────────────────────────────────
function parseHookOutput(text: string): ParsedHookResult | null {
  try {
    const clean = text.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(clean);

    if (parsed.hooks && Array.isArray(parsed.hooks)) {
      return parsed as ParsedHookResult;
    }

    if (Array.isArray(parsed)) {
      return {
        hooks: parsed,
        meta: {
          avg_retention: 0,
          avg_ctr: "0%",
          avg_emotional_intensity: 0,
          top_emotion: "mixed",
          tone_used: "mixed",
        },
      };
    }
  } catch {
    // Failover to plain-text parser
  }

  try {
    const hookBlocks = text.split(/---/);
    const hooks: HookItem[] = [];

    for (const block of hookBlocks) {
      const trimmed = block.trim();
      if (!trimmed) continue;

      const getValue = (key: string) => {
        const regex = new RegExp(`^${key}:\\s*(.*)$`, "im");
        const match = trimmed.match(regex);
        return match ? match[1].trim() : "";
      };

      const hookText = getValue("HOOK");
      if (!hookText) continue;

      const scoreVal = parseInt(getValue("SCORE")) || 0;
      const retentionVal = parseInt(getValue("RETENTION").replace(/%/g, "")) || 0;
      const ctrVal = getValue("CTR");
      const emotionVal = getValue("EMOTION");
      const intensityVal = parseInt(getValue("INTENSITY")) || 0;
      const platformVal = getValue("PLATFORM");
      const whyItWorksVal = getValue("WHY IT WORKS");

      hooks.push({
        hook: hookText,
        score: scoreVal,
        retention_score: retentionVal,
        ctr_prediction: ctrVal.includes("%") ? ctrVal : `${ctrVal}%`,
        emotional_intensity: intensityVal,
        emotion: emotionVal,
        platform_fit: platformVal,
        language: "English",
        why_it_works: whyItWorksVal,
      });
    }

    if (hooks.length > 0) {
      const totalRetention = hooks.reduce((sum, h) => sum + h.retention_score, 0);
      const totalIntensity = hooks.reduce((sum, h) => sum + h.emotional_intensity, 0);
      const ctrs = hooks.map(h => parseFloat(h.ctr_prediction.replace(/%/g, "")) || 0);
      const avgCtr = ctrs.reduce((sum, val) => sum + val, 0) / ctrs.length;

      const emotionCounts: Record<string, number> = {};
      hooks.forEach(h => {
        if (h.emotion) {
          emotionCounts[h.emotion] = (emotionCounts[h.emotion] || 0) + 1;
        }
      });
      let topEmotion = "mixed";
      let maxCount = 0;
      for (const [em, count] of Object.entries(emotionCounts)) {
        if (count > maxCount) {
          maxCount = count;
          topEmotion = em;
        }
      }

      return {
        hooks,
        meta: {
          avg_retention: Math.round(totalRetention / hooks.length),
          avg_ctr: `${avgCtr.toFixed(1)}%`,
          avg_emotional_intensity: Math.round(totalIntensity / hooks.length),
          top_emotion: topEmotion,
          tone_used: "mixed",
        }
      };
    }
  } catch (err) {
    console.error("Plain text hook parsing failed:", err);
  }

  return null;
}

function getScoreClass(score: number): string {
  if (score >= 8) return "score-high";
  if (score >= 5) return "score-medium";
  return "score-low";
}

function getRetentionColor(score: number): string {
  if (score >= 75) return "oklch(0.76 0.17 160)";
  if (score >= 50) return "oklch(0.82 0.16 80)";
  return "oklch(0.65 0.22 25)";
}

function getIntensityEmoji(intensity: number): string {
  if (intensity >= 8) return "🔥";
  if (intensity >= 6) return "⚡";
  if (intensity >= 4) return "💡";
  return "✨";
}

// ─── Loading State with Typing Animation ───────────────────
function GeneratingState() {
  const [dots, setDots] = React.useState("");
  const [phase, setPhase] = React.useState(0);
  const phases = [
    "Analyzing topic patterns",
    "Crafting viral hooks",
    "Computing retention scores",
    "Predicting CTR",
    "Scoring emotional intensity",
    "Ranking by virality",
  ];

  React.useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);

    const phaseInterval = setInterval(() => {
      setPhase((prev) => (prev + 1) % phases.length);
    }, 2200);

    return () => {
      clearInterval(dotInterval);
      clearInterval(phaseInterval);
    };
  }, []);

  return (
    <Card variant="glass" className="h-full min-h-[400px]">
      <CardContent className="pt-6 h-full flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-6 max-w-sm">
          {/* Animated AI brain icon */}
          <div className="relative">
            <div className="p-5 rounded-2xl bg-brand-500/10 border border-brand-500/20">
              <Brain className="h-8 w-8 text-brand-400 animate-pulse" />
            </div>
            {/* Pulsing rings */}
            <div className="absolute inset-0 rounded-2xl border border-brand-500/20 animate-pulse-ring" />
            <div className="absolute -inset-2 rounded-3xl border border-brand-500/10 animate-pulse-ring" style={{ animationDelay: "0.5s" }} />
          </div>

          {/* Typing phase indicator */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-brand-400">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-xs font-bold uppercase tracking-wider">
                AI Engine Active
              </span>
            </div>
            <p className="text-sm text-text-secondary font-medium min-h-[1.5rem]">
              {phases[phase]}{dots}
              <span className="inline-block w-0.5 h-4 bg-brand-400 ml-0.5 animate-typing-blink align-middle" />
            </p>
          </div>

          {/* Progress skeleton */}
          <div className="w-full space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-xl shimmer-bg"
                style={{ animationDelay: `${i * 0.15}s`, opacity: 1 - i * 0.15 }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Empty State ───────────────────────────────────────────
function EmptyState() {
  return (
    <Card
      variant="glass"
      className="h-full min-h-[400px] flex flex-col items-center justify-center p-6 border-dashed border-glass-border/60"
    >
      <div className="flex flex-col items-center text-center max-w-xs space-y-4">
        <div className="relative">
          <div className="p-4 rounded-2xl bg-surface-100/50 border border-glass-border/30 text-text-muted">
            <Sparkles className="h-7 w-7" />
          </div>
          <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-brand-500 animate-pulse" />
        </div>
        <div className="space-y-1.5">
          <h4 className="font-bold text-text-secondary text-sm">
            Ready to Generate Viral Hooks
          </h4>
          <p className="text-xs text-text-muted leading-relaxed">
            Enter your topic, pick a tone, and let the AI engine create 20
            scroll-stopping hooks with retention scores, CTR predictions, and
            emotional intensity analysis.
          </p>
        </div>
      </div>
    </Card>
  );
}

// ─── Error State ───────────────────────────────────────────
function ErrorState({ error }: { error: string }) {
  return (
    <Card
      variant="glass"
      className="border-error/40 bg-error/5 h-full flex flex-col justify-center py-10 px-6"
    >
      <div className="flex flex-col items-center text-center max-w-sm mx-auto space-y-3">
        <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h4 className="font-bold text-text-primary text-sm">
          Generation Failed
        </h4>
        <p className="text-xs text-text-secondary leading-relaxed">{error}</p>
      </div>
    </Card>
  );
}

// ─── Individual Hook Card ──────────────────────────────────
function HookCard({
  hook,
  index,
}: {
  hook: HookItem;
  index: number;
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hook.hook);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const retentionColor = getRetentionColor(hook.retention_score || 0);

  return (
    <div
      className="hook-card p-4 rounded-xl bg-surface-100/40 border border-glass-border/40 animate-stagger-in"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      {/* Header: Hook text + score badge */}
      <div className="flex justify-between items-start gap-3 mb-3">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <span className="text-xs font-mono text-text-muted mt-0.5 shrink-0">
            #{String(index + 1).padStart(2, "0")}
          </span>
          <p className="text-sm font-semibold text-text-primary leading-snug">
            {hook.hook}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div
            className={`animate-score-reveal px-2.5 py-1 rounded-lg text-[11px] font-bold border ${getScoreClass(hook.score)}`}
            style={{ animationDelay: `${index * 0.06 + 0.3}s` }}
          >
            {hook.score}/10
          </div>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-surface-200/60 transition-colors text-text-muted hover:text-text-primary"
            title="Copy hook"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Score meters row */}
      <div className="grid grid-cols-3 gap-2.5 mb-3">
        {/* Retention Score */}
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3 text-text-muted" />
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">
              Retention
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-surface-200/80 overflow-hidden">
            <div
              className="h-full rounded-full animate-meter-fill"
              style={{
                width: `${hook.retention_score || 0}%`,
                backgroundColor: retentionColor,
                animationDelay: `${index * 0.06 + 0.2}s`,
              }}
            />
          </div>
          <span
            className="text-[10px] font-bold animate-number-tick block"
            style={{ color: retentionColor, animationDelay: `${index * 0.06 + 0.4}s` }}
          >
            {hook.retention_score || 0}%
          </span>
        </div>

        {/* CTR Prediction */}
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <MousePointerClick className="h-3 w-3 text-text-muted" />
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">
              CTR
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-surface-200/80 overflow-hidden">
            <div
              className="h-full rounded-full bg-accent-400 animate-meter-fill"
              style={{
                width: `${Math.min(parseFloat(hook.ctr_prediction || "0") * 5, 100)}%`,
                animationDelay: `${index * 0.06 + 0.25}s`,
              }}
            />
          </div>
          <span
            className="text-[10px] font-bold text-accent-400 animate-number-tick block"
            style={{ animationDelay: `${index * 0.06 + 0.45}s` }}
          >
            {hook.ctr_prediction || "0%"}
          </span>
        </div>

        {/* Emotional Intensity */}
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Heart className="h-3 w-3 text-text-muted" />
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">
              Emotion
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-surface-200/80 overflow-hidden">
            <div
              className="h-full rounded-full bg-pink-400 animate-meter-fill"
              style={{
                width: `${((hook.emotional_intensity || 0) / 10) * 100}%`,
                animationDelay: `${index * 0.06 + 0.3}s`,
              }}
            />
          </div>
          <span
            className="text-[10px] font-bold text-pink-400 animate-number-tick block"
            style={{ animationDelay: `${index * 0.06 + 0.5}s` }}
          >
            {getIntensityEmoji(hook.emotional_intensity || 0)}{" "}
            {hook.emotional_intensity || 0}/10
          </span>
        </div>
      </div>

      {/* Tags row */}
      <div className="flex flex-wrap gap-1.5 text-[10px] text-text-muted font-bold uppercase select-none">
        <span className="bg-surface-200/80 px-2 py-0.5 rounded-sm">
          {hook.emotion}
        </span>
        <span className="bg-surface-200/80 px-2 py-0.5 rounded-sm">
          {hook.platform_fit}
        </span>
        <span className="bg-surface-200/80 px-2 py-0.5 rounded-sm">
          {hook.language}
        </span>
      </div>

      {/* Why it works */}
      {hook.why_it_works && (
        <p className="mt-2.5 text-[11px] text-text-muted italic leading-relaxed border-t border-glass-border/20 pt-2.5">
          💡 {hook.why_it_works}
        </p>
      )}
    </div>
  );
}

// ─── Meta Summary Bar ──────────────────────────────────────
function MetaSummary({ meta }: { meta: HookMeta }) {
  const stats = [
    {
      icon: Eye,
      label: "Avg Retention",
      value: `${meta.avg_retention}%`,
      color: "text-emerald-400",
    },
    {
      icon: MousePointerClick,
      label: "Avg CTR",
      value: meta.avg_ctr,
      color: "text-accent-400",
    },
    {
      icon: Zap,
      label: "Emotion Score",
      value: `${meta.avg_emotional_intensity}/10`,
      color: "text-pink-400",
    },
    {
      icon: TrendingUp,
      label: "Top Emotion",
      value: meta.top_emotion,
      color: "text-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-surface-50/60 border border-glass-border/30 animate-stagger-in">
      {stats.map((stat, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-surface-100/60 border border-glass-border/20">
            <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
          </div>
          <div>
            <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider">
              {stat.label}
            </p>
            <p className={`text-sm font-bold ${stat.color} animate-number-tick`} style={{ animationDelay: `${i * 0.1}s` }}>
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Export Component ─────────────────────────────────
export function HookGeneratorOutput({
  output,
  isGenerating,
  error,
  onRegenerate,
  onExport,
}: HookGeneratorOutputProps) {
  const [copiedAll, setCopiedAll] = React.useState(false);

  if (isGenerating) return <GeneratingState />;
  if (error) return <ErrorState error={error} />;
  if (!output) return <EmptyState />;

  const parsed = parseHookOutput(output);

  // Fallback to raw text if parse fails
  if (!parsed || !parsed.hooks || parsed.hooks.length === 0) {
    return (
      <Card variant="glass" className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b border-glass-border/20 py-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-brand-400" />
            AI Output
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 flex-1 overflow-y-auto select-all">
          <p className="whitespace-pre-line text-sm leading-relaxed text-text-primary">
            {output}
          </p>
        </CardContent>
      </Card>
    );
  }

  const { hooks, meta } = parsed;

  const handleCopyAll = async () => {
    try {
      const text = hooks
        .map((h, i) => `${i + 1}. ${h.hook} (Score: ${h.score}/10, Retention: ${h.retention_score}%, CTR: ${h.ctr_prediction})`)
        .join("\n");
      await navigator.clipboard.writeText(text);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExport = (format: "json" | "csv" | "txt") => {
    if (onExport) {
      onExport(format);
      return;
    }

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === "json") {
      content = JSON.stringify(parsed, null, 2);
      filename = `viral-hooks-${Date.now()}.json`;
      mimeType = "application/json";
    } else if (format === "csv") {
      const headers = "Index,Hook,Score,Retention,CTR,Emotion Intensity,Emotion,Platform,Language\n";
      const rows = hooks
        .map(
          (h, i) =>
            `${i + 1},"${h.hook.replace(/"/g, '""')}",${h.score},${h.retention_score},${h.ctr_prediction},${h.emotional_intensity},${h.emotion},${h.platform_fit},${h.language}`
        )
        .join("\n");
      content = headers + rows;
      filename = `viral-hooks-${Date.now()}.csv`;
      mimeType = "text/csv";
    } else {
      content = hooks
        .map(
          (h, i) =>
            `#${i + 1} — ${h.hook}\n   Score: ${h.score}/10 | Retention: ${h.retention_score}% | CTR: ${h.ctr_prediction} | Emotion: ${h.emotional_intensity}/10\n   ${h.emotion} | ${h.platform_fit} | ${h.language}${h.why_it_works ? `\n   → ${h.why_it_works}` : ""}\n`
        )
        .join("\n");
      filename = `viral-hooks-${Date.now()}.txt`;
      mimeType = "text/plain";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card variant="glass" className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between border-b border-glass-border/20 py-4 gap-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Flame className="h-4.5 w-4.5 text-brand-400" />
          <span className="gradient-text">{hooks.length} Viral Hooks</span>
          {meta.tone_used && meta.tone_used !== "mixed" && (
            <Badge variant="outline" className="text-[9px] capitalize ml-1">
              {meta.tone_used}
            </Badge>
          )}
        </CardTitle>
        <div className="flex items-center gap-2">
          {onRegenerate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRegenerate}
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
              className="text-xs"
            >
              Regenerate
            </Button>
          )}
          <div className="relative group">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Download className="h-3.5 w-3.5" />}
              className="text-xs"
            >
              Export
            </Button>
            <div className="absolute right-0 top-full mt-1.5 w-32 py-1.5 rounded-lg bg-surface-100 border border-glass-border/40 shadow-elevated opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
              {(["txt", "csv", "json"] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => handleExport(fmt)}
                  className="w-full text-left px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-200/60 transition-colors uppercase font-semibold"
                >
                  {fmt === "txt" ? "📄 Text" : fmt === "csv" ? "📊 CSV" : "🔧 JSON"}
                </button>
              ))}
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyAll}
            leftIcon={
              copiedAll ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )
            }
            className="text-xs"
          >
            {copiedAll ? "Copied!" : "Copy All"}
          </Button>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="p-5 flex-1 overflow-y-auto space-y-4">
        {/* Meta summary */}
        {meta && meta.avg_retention > 0 && <MetaSummary meta={meta} />}

        {/* Hook cards */}
        <div className="space-y-3">
          {hooks.map((hook, idx) => (
            <HookCard key={idx} hook={hook} index={idx} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
