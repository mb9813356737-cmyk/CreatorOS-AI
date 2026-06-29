"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useAIGenerate } from "@/hooks/use-ai-generate";
import { toast } from "sonner";
import { PLATFORMS } from "@/lib/constants";
import {
  Sparkles, AlertTriangle, Trash2, Download, Bookmark,
  ChevronDown, ChevronUp, Info, TrendingUp,
  RefreshCw, CheckCircle, Copy, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, slugify } from "@/lib/utils";

// ─── Interfaces ──────────────────────────────────────────────
interface ViralScoreReportResult {
  overall_score: number;
  verdict: string;
  benchmark_comparison: string;
  breakdown: {
    hook: number;
    emotion: number;
    shareability: number;
    relatability: number;
    timeliness: number;
    platform_fit: number;
  };
  title_analysis: {
    score: number;
    strength: string;
    weakness: string;
    improved_title: string;
  };
  thumbnail_analysis: {
    score: number;
    text_effectiveness: string;
    ctr_prediction: string;
    improvement: string;
  };
  hook_analysis: {
    score: number;
    scroll_stop_power: string;
    psychological_trigger: string;
    improvement: string;
  };
  script_analysis: {
    retention_forecast: string;
    strongest_moment: string;
    weakest_moment: string;
    pacing: string;
  };
  platform_fit_analysis: {
    platform: string;
    algorithm_compatibility: string;
    best_upload_time: string;
    recommended_tags: string[];
  };
  improvements: string[];
  predicted_performance: {
    views_first_48hrs: string;
    click_through_rate: string;
    avg_watch_time: string;
    subscriber_conversion: string;
  };
}

interface SavedScoreReport {
  id: string;
  title: string;
  platform: string;
  timestamp: string;
  result: ViralScoreReportResult;
}

// ─── Helpers ──────────────────────────────────────────────────
const parseResponse = (text: string) => {
  if (!text) return null;
  let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (e1) {
    try {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
    } catch (e2) {
      console.error('Parse failed:', e2);
    }
  }
  return null;
};

// ─── Main Page Component ──────────────────────────────────────
export default function ViralScorePage() {
  const { generate, output, isGenerating, error } = useAIGenerate("VIRAL_SCORE");

  // Form Inputs
  const [title, setTitle] = React.useState("");
  const [hook, setHook] = React.useState("");
  const [script, setScript] = React.useState("");
  const [thumbnailText, setThumbnailText] = React.useState("");
  const [platform, setPlatform] = React.useState("YouTube");
  const [thumbnailImage, setThumbnailImage] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
        toast.error("Please upload PNG, JPG, or JPEG images only.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setThumbnailImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
        toast.error("Please upload PNG, JPG, or JPEG images only.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setThumbnailImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [parsedData, setParsedData] = React.useState<ViralScoreReportResult | null>(null);
  const [savedReports, setSavedReports] = React.useState<SavedScoreReport[]>([]);
  const [isSavedOpen, setIsSavedOpen] = React.useState(true);
  const [copiedAll, setCopiedAll] = React.useState(false);
  const [isSavedThisReport, setIsSavedThisReport] = React.useState(false);

  // Sync saved reports from localStorage
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("creatoros_saved_viral_scores");
      if (stored) {
        try {
          setSavedReports(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to load saved reports", e);
        }
      }
    }
  }, []);

  // Update parsedData on generation output
  React.useEffect(() => {
    if (output) {
      const parsed = parseResponse(output);
      if (parsed) {
        setParsedData(parsed as ViralScoreReportResult);
        setIsSavedThisReport(false);
      }
    }
  }, [output]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !hook.trim() && !script.trim() && !thumbnailText.trim()) {
      toast.warning("Please fill in at least one field to analyze.");
      return;
    }

    generate("VIRAL_SCORE", {
      videoTitle: title,
      thumbnailText,
      scrollStopHook: hook,
      videoScript: script,
      platform,
      thumbnailImage: thumbnailImage || undefined
    } as any);
  };

  const handleCopyReport = async () => {
    if (!parsedData) return;
    try {
      const reportText = `=== AI CONTENT VIRALITY FORECAST ===
Video Title: ${title || "N/A"}
Thumbnail Overlay: ${thumbnailText || "N/A"}
Target Platform: ${platform.toUpperCase()}

VIRAL INDEX SCORES:
- Overall Score: ${parsedData.overall_score}%
- Verdict: ${parsedData.verdict}
- Benchmark Comparison: ${parsedData.benchmark_comparison}

IMPROVEMENTS ROADMAP:
${parsedData.improvements?.map((imp, idx) => `${idx + 1}. ${imp}`).join("\n")}`;

      await navigator.clipboard.writeText(reportText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveReport = () => {
    if (!parsedData) return;
    const isAlreadySaved = savedReports.some(
      (r) => r.result.overall_score === parsedData.overall_score && r.title === title
    );
    if (isAlreadySaved) {
      setIsSavedThisReport(true);
      return;
    }

    const newReport: SavedScoreReport = {
      id: crypto.randomUUID(),
      title: title || "Viral Diagnosis",
      platform,
      timestamp: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      result: parsedData,
    };

    const updated = [newReport, ...savedReports];
    setSavedReports(updated);
    localStorage.setItem("creatoros_saved_viral_scores", JSON.stringify(updated));
    setIsSavedThisReport(true);
  };

  const handleDeleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedReports.filter((r) => r.id !== id);
    setSavedReports(updated);
    localStorage.setItem("creatoros_saved_viral_scores", JSON.stringify(updated));
  };

  const handleLoadSaved = (report: SavedScoreReport) => {
    setTitle(report.title);
    setPlatform(report.platform);
    setParsedData(report.result);
    setIsSavedThisReport(true);
  };

  const handleExportJSON = () => {
    if (!parsedData) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(parsedData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `viral-score-${slugify(title || "report")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const renderOutput = () => {
    // 1. LOADING STATE
    if (isGenerating) {
      return (
        <Card variant="glass" className="h-full min-h-[400px] flex items-center justify-center p-6">
          <div className="space-y-4 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-brand-400 mx-auto" />
            <p className="text-sm font-semibold text-text-secondary">
              Analyzing content psychographics & virality metrics...
            </p>
          </div>
        </Card>
      );
    }

    // 2. EMPTY STATE
    if (!output && !parsedData) {
      return (
        <Card variant="glass" className="h-full min-h-[520px] flex flex-col items-center justify-center p-8 border-dashed border-glass-border/60">
          <div className="flex flex-col items-center text-center max-w-xs space-y-4">
            <div className="p-4 rounded-2xl bg-surface-100/50 border border-glass-border/30 text-brand-400 shadow-glow-sm">
              <TrendingUp className="h-7 w-7" />
            </div>
            <h4 className="font-extrabold text-text-primary text-sm tracking-wide">Virality Diagnostics</h4>
            <p className="text-xs text-text-muted leading-relaxed">
              Provide drafts of your video titles, hooks, or full scripts on the left to evaluate overall virality, algorithm fit, and get custom feedback.
            </p>
            <div className="pt-2 flex flex-wrap gap-1.5 justify-center">
              <span className="px-2 py-0.5 rounded-full bg-surface-100 text-[10px] text-text-secondary border border-glass-border/30">📈 CTR Predictions</span>
              <span className="px-2 py-0.5 rounded-full bg-surface-100 text-[10px] text-text-secondary border border-glass-border/30">🧠 Hook Diagnostics</span>
              <span className="px-2 py-0.5 rounded-full bg-surface-100 text-[10px] text-text-secondary border border-glass-border/30">🎯 Retention Advice</span>
            </div>
          </div>
        </Card>
      );
    }

    // 3. PARSE ERROR STATE
    if (!parsedData) {
      return (
        <div className="p-4 text-xs text-error border border-error/40 rounded-lg">
          <p className="font-bold mb-2">Parse Error — Raw Response:</p>
          <pre className="overflow-auto max-h-40 text-text-muted">{output}</pre>
        </div>
      );
    }

    // 4. SUCCESS STATE DISPLAY
    return (
      <div className="space-y-6">
        {/* Action Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-surface-100/20 border border-glass-border/40 rounded-xl">
          <div>
            <h4 className="text-sm font-extrabold text-text-primary tracking-tight truncate max-w-[280px]">
              {title || "Virality Prediction"}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20 uppercase tracking-wider font-mono">
                Platform Fit: {parsedData.breakdown?.platform_fit}%
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSaveReport}
              className="h-8.5 text-xs border border-glass-border"
              leftIcon={isSavedThisReport ? <Check className="h-3.5 w-3.5 text-success" /> : <Bookmark className="h-3.5 w-3.5 text-text-secondary" />}
            >
              {isSavedThisReport ? "Saved" : "Save Report"}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportJSON}
              className="h-8.5 text-xs border border-glass-border"
              leftIcon={<Download className="h-3.5 w-3.5 text-text-secondary" />}
            >
              Export JSON
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyReport}
              className="h-8.5 text-xs border border-glass-border"
              leftIcon={copiedAll ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            >
              {copiedAll ? "Copied" : "Copy Report"}
            </Button>
          </div>
        </div>

        {/* SECTION 1 — CIRCULAR GAUGE */}
        <div className="flex flex-col sm:flex-row items-center gap-6 justify-center bg-surface-100/30 p-5 rounded-xl border border-glass-border/20">
          <div className="relative h-32 w-32 flex items-center justify-center select-none shrink-0">
            <svg className="h-full w-full transform -rotate-90">
              <circle cx="64" cy="64" r="50" className="stroke-glass-border fill-none" strokeWidth="8" />
              <circle
                cx="64"
                cy="64"
                r="50"
                className={cn("fill-none stroke-brand-500 drop-shadow-[0_0_6px_currentColor]")}
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 50}
                strokeDashoffset={2 * Math.PI * 50 - (parsedData.overall_score / 100) * (2 * Math.PI * 50)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-2xl font-black text-text-primary font-mono">{parsedData.overall_score}%</span>
              <span className="text-[8px] font-bold text-text-secondary uppercase tracking-wider block">Score</span>
            </div>
          </div>
          <div className="space-y-2 text-center sm:text-left flex-1">
            <span className="px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-[10px] font-extrabold text-brand-450 tracking-wider uppercase">
              {parsedData.verdict}
            </span>
            <p className="text-xs text-text-secondary leading-relaxed font-medium">
              {parsedData.benchmark_comparison}
            </p>
          </div>
        </div>

        {/* SECTION 2 — BREAKDOWN SCORES (6 progress bars) */}
        <div className="space-y-3.5 p-5 rounded-xl bg-surface-100/10 border border-glass-border/30">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">Virality Breakdown</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Hook Strength", val: parsedData.breakdown?.hook || 0 },
              { label: "Emotional Trigger", val: parsedData.breakdown?.emotion || 0 },
              { label: "Shareability", val: parsedData.breakdown?.shareability || 0 },
              { label: "Relatability", val: parsedData.breakdown?.relatability || 0 },
              { label: "Timeliness", val: parsedData.breakdown?.timeliness || 0 },
              { label: "Platform Fit", val: parsedData.breakdown?.platform_fit || 0 },
            ].map(({ label, val }) => (
              <div key={label} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-text-secondary">{label}</span>
                  <span className="text-text-primary font-mono">{val}%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-200 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-555",
                      val >= 80 ? "bg-emerald-500" : val >= 60 ? "bg-brand-500" : "bg-amber-500"
                    )}
                    style={{ width: `${val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3 — 2 COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Card: Title Analysis */}
          <Card variant="glass" className="border border-glass-border h-full">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Title Analysis</span>
                <span className="px-2 py-0.5 rounded bg-surface-100 text-xs font-mono font-bold">{parsedData.title_analysis?.score}%</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="text-emerald-400 font-medium leading-relaxed">
                  <span className="font-bold uppercase text-[9px] block text-text-muted">Strength</span>
                  {parsedData.title_analysis?.strength}
                </div>
                <div className="text-amber-400 font-medium leading-relaxed">
                  <span className="font-bold uppercase text-[9px] block text-text-muted">Weakness</span>
                  {parsedData.title_analysis?.weakness}
                </div>
                <div className="p-3 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-300">
                  <span className="font-bold uppercase text-[9px] block text-brand-400">Improved Title</span>
                  <span className="font-bold text-xs">"{parsedData.title_analysis?.improved_title}"</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Card: Thumbnail Analysis */}
          <Card variant="glass" className="border border-glass-border h-full">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Thumbnail Analysis</span>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 rounded bg-surface-100 text-xs font-mono font-bold">CTR: {parsedData.thumbnail_analysis?.ctr_prediction}</span>
                  <span className="px-2 py-0.5 rounded bg-surface-100 text-xs font-mono font-bold">{parsedData.thumbnail_analysis?.score}%</span>
                </div>
              </div>
              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="font-bold uppercase text-[9px] block text-text-muted">Text Effectiveness</span>
                  <p className="text-text-secondary leading-relaxed">{parsedData.thumbnail_analysis?.text_effectiveness}</p>
                </div>
                <div className="p-3 rounded-lg bg-surface-100/50 border border-glass-border/30 text-text-secondary">
                  <span className="font-bold uppercase text-[9px] block text-brand-400">Improvement Suggestion</span>
                  <p className="leading-relaxed">{parsedData.thumbnail_analysis?.improvement}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SECTION 4 — 2 COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Card: Hook Analysis */}
          <Card variant="glass" className="border border-glass-border h-full">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Hook Analysis</span>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 rounded bg-surface-100 text-xs font-mono font-bold">Hook Power: {parsedData.hook_analysis?.scroll_stop_power}</span>
                  <span className="px-2 py-0.5 rounded bg-surface-100 text-xs font-mono font-bold">{parsedData.hook_analysis?.score}%</span>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-bold uppercase text-[9px] block text-text-muted">Psychological Trigger</span>
                  <p className="text-text-primary font-bold">{parsedData.hook_analysis?.psychological_trigger}</p>
                </div>
                <div className="p-3 rounded-lg bg-surface-100/50 border border-glass-border/30 text-text-secondary">
                  <span className="font-bold uppercase text-[9px] block text-brand-400">Hook Improvement</span>
                  <p className="leading-relaxed">{parsedData.hook_analysis?.improvement}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Card: Script Analysis */}
          <Card variant="glass" className="border border-glass-border h-full">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Script Analysis</span>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 rounded bg-surface-100 text-xs font-mono font-bold">Retention: {parsedData.script_analysis?.retention_forecast}</span>
                  <span className="px-2 py-0.5 rounded bg-surface-100 text-xs font-mono font-bold">Pacing: {parsedData.script_analysis?.pacing}</span>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="text-emerald-400 font-medium leading-relaxed">
                  <span className="font-bold uppercase text-[9px] block text-text-muted">Strongest Moment</span>
                  {parsedData.script_analysis?.strongest_moment}
                </div>
                <div className="text-amber-400 font-medium leading-relaxed">
                  <span className="font-bold uppercase text-[9px] block text-text-muted">Weakest Moment</span>
                  {parsedData.script_analysis?.weakest_moment}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SECTION 5 — PLATFORM FIT */}
        <div className="p-5 rounded-xl bg-surface-100/10 border border-glass-border/30 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Platform Fit & Optimization</span>
            <div className="flex gap-2">
              <span className="px-2 py-0.5 rounded bg-surface-100 text-xs font-mono font-bold uppercase">{parsedData.platform_fit_analysis?.platform}</span>
              <span className="px-2 py-0.5 rounded bg-surface-100 text-xs font-mono font-bold">Algo Compatibility: {parsedData.platform_fit_analysis?.algorithm_compatibility}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="font-bold uppercase text-[9px] block text-text-muted">Best Upload Time</span>
              <p className="text-text-primary font-bold">{parsedData.platform_fit_analysis?.best_upload_time}</p>
            </div>
            <div className="space-y-1.5">
              <span className="font-bold uppercase text-[9px] block text-text-muted">Recommended Tags</span>
              <div className="flex flex-wrap gap-1.5">
                {parsedData.platform_fit_analysis?.recommended_tags?.map((tag, i) => (
                  <span key={i} className="px-2.5 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-[10px] font-semibold text-brand-300">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 6 — PREDICTED PERFORMANCE */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Views (48h)", val: parsedData.predicted_performance?.views_first_48hrs },
            { label: "CTR Forecast", val: parsedData.predicted_performance?.click_through_rate },
            { label: "Watch Time", val: parsedData.predicted_performance?.avg_watch_time },
            { label: "Subscriber Conv.", val: parsedData.predicted_performance?.subscriber_conversion },
          ].map(({ label, val }) => (
            <div key={label} className="p-4 rounded-xl bg-surface-100/15 border border-glass-border/30 text-center space-y-1 h-full flex flex-col justify-center">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">{label}</span>
              <span className="text-sm font-black text-brand-400">{val}</span>
            </div>
          ))}
        </div>

        {/* SECTION 7 — IMPROVEMENTS */}
        <div className="p-5 rounded-xl bg-brand-500/10 border border-brand-500/30 space-y-3.5">
          <h4 className="text-xs font-black text-text-primary uppercase tracking-wider flex items-center gap-2">
            <Info className="h-4.5 w-4.5 text-brand-400" />
            Optimization Roadmap
          </h4>
          <div className="space-y-2.5">
            {parsedData.improvements?.map((imp, idx) => (
              <div key={idx} className="flex gap-2.5 text-xs text-text-secondary leading-relaxed align-top">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{imp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      <PageHeader
        title="Virality Predictor"
        description="Forecast watch time curves, click probabilities, and emotional sentiment mapping before publishing."
        badge="AI Tools (Pro)"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side Controls */}
        <div className="lg:col-span-5 space-y-6">
          <Card variant="glass">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                    Video Title Draft
                  </label>
                  <Input
                    placeholder="e.g. 10 Secret AI Tools That Feel Illegal to Know"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                    Thumbnail Text Overlay
                  </label>
                  <Input
                    placeholder="e.g. IT FEELS ILLEGAL"
                    value={thumbnailText}
                    onChange={(e) => setThumbnailText(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                    Upload Draft Thumbnail (Optional)
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 select-none",
                      thumbnailImage
                        ? "border-brand-500/50 bg-brand-500/5"
                        : "border-glass-border/40 hover:border-brand-500/30 hover:bg-surface-50/20"
                    )}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/png, image/jpeg, image/jpg"
                      className="hidden"
                    />
                    {thumbnailImage ? (
                      <div className="space-y-2 text-center w-full">
                        <div className="relative aspect-video max-w-[200px] mx-auto rounded-lg overflow-hidden border border-glass-border/50">
                          <img
                            src={thumbnailImage}
                            alt="Uploaded Draft"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-[10px] text-brand-400 font-bold uppercase tracking-wider">
                          Change Thumbnail Image
                        </p>
                      </div>
                    ) : (
                      <div className="text-center space-y-1">
                        <div className="text-text-muted text-lg">📁</div>
                        <p className="text-[11px] font-extrabold text-text-secondary">
                          Drag & Drop or Click to Upload
                        </p>
                        <p className="text-[9px] text-text-muted">
                          Supports PNG, JPG, JPEG
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                    Scroll-Stop Hook (0-10s)
                  </label>
                  <Textarea
                    placeholder="e.g. They told me not to enter after dark... but here we are at 3 AM."
                    value={hook}
                    onChange={(e) => setHook(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                    Video Script Draft
                  </label>
                  <Textarea
                    placeholder="Paste the remaining body of the script here to forecast retention decay..."
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                    Target Platform
                  </label>
                  <Select
                    options={[
                      { value: "YouTube", label: "YouTube" },
                      { value: "Instagram", label: "Instagram" },
                      { value: "TikTok", label: "TikTok" },
                      { value: "LinkedIn", label: "LinkedIn" }
                    ]}
                    value={platform}
                    onChange={setPlatform}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-linear-to-r from-brand-600 to-pink-600 shadow-glow-sm hover:shadow-glow-md border border-brand-500/20"
                  isLoading={isGenerating}
                  leftIcon={!isGenerating && <Sparkles className="h-4.5 w-4.5" />}
                >
                  Analyze Content Virality
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Saved reports Collapsible */}
          {savedReports.length > 0 && (
            <Card variant="glass" className="border border-glass-border">
              <button
                onClick={() => setIsSavedOpen(!isSavedOpen)}
                className="w-full px-6 py-4 flex items-center justify-between font-extrabold text-sm text-text-primary"
              >
                <div className="flex items-center gap-2">
                  <Bookmark className="h-4.5 w-4.5 text-brand-400" />
                  <span>Saved Reports ({savedReports.length})</span>
                </div>
                {isSavedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              <AnimatePresence initial={false}>
                {isSavedOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CardContent className="pt-0 pb-4 max-h-[300px] overflow-y-auto space-y-2.5">
                      {savedReports.map((r) => {
                        const platInfo = PLATFORMS.find((p) => p.value === r.platform) || PLATFORMS[0];
                        return (
                          <div
                            key={r.id}
                            onClick={() => handleLoadSaved(r)}
                            className="p-3 rounded-lg border border-glass-border bg-surface-50/20 hover:bg-surface-50/50 hover:border-brand-500/30 transition-all cursor-pointer flex items-center justify-between group"
                          >
                            <div className="space-y-1 pr-4 max-w-[80%]">
                              <h5 className="text-xs font-bold text-text-primary truncate">{r.title}</h5>
                              <div className="flex items-center gap-2 text-[9px] text-text-muted font-mono">
                                <span>{platInfo.emoji} {platInfo.label}</span>
                                <span>•</span>
                                <span>Viral Index: {r.result.overall_score}%</span>
                              </div>
                            </div>
                            <button
                              onClick={(e) => handleDeleteSaved(r.id, e)}
                              className="p-1.5 rounded-md hover:bg-error/10 hover:text-error text-text-muted opacity-0 group-hover:opacity-100 transition-all shrink-0"
                              title="Delete report"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          )}
        </div>

        {/* Right Side Futuristic Analytics Dashboard */}
        <div className="lg:col-span-7 h-full">
          {renderOutput()}
        </div>
      </div>
    </div>
  );
}
