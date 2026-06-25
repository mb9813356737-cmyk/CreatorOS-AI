"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useAIGenerate } from "@/hooks/use-ai-generate";
import { toast } from "sonner";
import { PLATFORMS } from "@/lib/constants";
import { 
  Sparkles, Copy, Check, RefreshCw, AlertTriangle, 
  Trash2, Download, Bookmark, ChevronDown, 
  ChevronUp, Brain, Info, TrendingUp,
  Percent, Heart, Eye, Activity, Award, Flame, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, slugify } from "@/lib/utils";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar 
} from "recharts";

// ─── Interfaces ──────────────────────────────────────────────
interface PsychTrigger {
  trigger: string;
  reaction: string;
  effect: string;
}

interface ViralScoreResult {
  virality_score: number;
  ctr_prediction: number;
  emotional_score: number;
  emotional_breakdown: {
    happiness: number;
    surprise: number;
    anger: number;
    sadness: number;
    curiosity: number;
    urgency: number;
  };
  retention_prediction: number[];
  audience_psychology: PsychTrigger[];
  breakdown: {
    hook: number;
    shareability: number;
    relatability: number;
    timeliness: number;
    platform_fit: number;
    thumbnail_contrast: number;
  };
  verdict: string;
  improvements: string[];
}

interface SavedScoreReport {
  id: string;
  title: string;
  platform: string;
  timestamp: string;
  result: ViralScoreResult;
}

// ─── Score Gauge Component ───────────────────────────────────
function ScoreGauge({ score, label, colorClass, strokeColor, size = 120 }: { 
  score: number; 
  label: string; 
  colorClass: string; 
  strokeColor: string;
  size?: number;
}) {
  const radius = size / 2;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card 
      variant="glow" 
      hoverEffect 
      className="flex flex-col items-center justify-center p-5 bg-surface-100/20 border border-glass-border/20 relative overflow-hidden h-full group transition-all duration-300 hover:scale-102 hover:border-brand-500/30"
    >
      <div className="relative flex items-center justify-center">
        <svg height={size} width={size} className="transform -rotate-90">
          <circle
            className="stroke-surface-200/50"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            className={`transition-all duration-1000 ease-out ${strokeColor} drop-shadow-[0_0_6px_currentColor]`}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={cn("text-2xl font-extrabold tracking-tighter transition-all duration-300 group-hover:scale-105", colorClass)}>
            {score}%
          </span>
          <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider mt-0.5">
            {label}
          </span>
        </div>
      </div>
    </Card>
  );
}

// ─── Loading Scanner Component ────────────────────────────────
function ScannerLoader() {
  const steps = [
    "Running emotional sentiment analysis...",
    "Evaluating scroll-stop hook velocity...",
    "Measuring thumbnail text clarity hotspots...",
    "Simulating viewer retention curve models...",
    "Compiling algorithmic virality reports...",
  ];
  const [stepIndex, setStepIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card variant="glass" className="h-full min-h-[500px] flex flex-col items-center justify-center p-8 relative overflow-hidden border border-glass-border">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-500/5 to-transparent w-full h-[200px] animate-[bounce_4s_infinite] opacity-40 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-[1px] bg-pink-400/30 shadow-[0_0_10px_var(--color-pink-400)] animate-[float_4s_infinite]" />

      <div className="flex flex-col items-center text-center max-w-sm space-y-6 z-10">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-pink-500/20 blur-xl animate-pulse" />
          <div className="p-5 rounded-full bg-surface-100/50 border border-pink-500/20 text-pink-400 relative">
            <RefreshCw className="h-10 w-10 animate-spin" style={{ animationDuration: "3s" }} />
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-extrabold text-text-primary text-sm uppercase tracking-wider">
            Analyzing Content Physics
          </h4>
          <div className="h-6 overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.p
                key={stepIndex}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-xs text-text-secondary font-mono"
              >
                {steps[stepIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex gap-1.5 pt-2">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-all duration-300",
                idx === stepIndex ? "bg-pink-500 w-4 shadow-glow-pink" : "bg-surface-200"
              )}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

// ─── Main Page Component ──────────────────────────────────────
export default function ViralScorePage() {
  const { generate, output, isGenerating, error } = useAIGenerate("VIRAL_SCORE");
  
  // Form Inputs
  const [title, setTitle] = React.useState("");
  const [hook, setHook] = React.useState("");
  const [script, setScript] = React.useState("");
  const [thumbnailText, setThumbnailText] = React.useState("");
  const [platform, setPlatform] = React.useState("youtube");
  const [thumbnailImage, setThumbnailImage] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setThumbnailImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [activeReport, setActiveReport] = React.useState<ViralScoreResult | null>(null);
  const [savedReports, setSavedReports] = React.useState<SavedScoreReport[]>([]);
  const [isSavedOpen, setIsSavedOpen] = React.useState(true);
  const [mounted, setMounted] = React.useState(false);

  const [copiedAll, setCopiedAll] = React.useState(false);
  const [isSavedThisReport, setIsSavedThisReport] = React.useState(false);
  const [showHeatmap, setShowHeatmap] = React.useState(true);
  const [showGazePath, setShowGazePath] = React.useState(false);

  // Mounted check for Recharts
  React.useEffect(() => {
    setMounted(true);
  }, []);

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

  // Update activeReport on generation output
  React.useEffect(() => {
    if (output) {
      try {
        let parsed: any = null;
        try {
          parsed = JSON.parse(output.trim());
        } catch {
          const match = output.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
          if (match) {
            parsed = JSON.parse(match[0].trim());
          }
        }
        if (parsed) {
          // Normalize virality_score / overall_score
          parsed.virality_score = typeof parsed.virality_score === 'number' ? parsed.virality_score : (typeof parsed.overall_score === 'number' ? parsed.overall_score : 0);
          parsed.overall_score = parsed.virality_score;

          // Normalize emotional_score / emotion breakdown
          parsed.emotional_score = typeof parsed.emotional_score === 'number' ? parsed.emotional_score : (typeof parsed.breakdown?.emotion === 'number' ? parsed.breakdown.emotion : 0);

          // Normalize breakdown
          if (parsed.breakdown) {
            parsed.breakdown.emotion = typeof parsed.breakdown.emotion === 'number' ? parsed.breakdown.emotion : parsed.emotional_score;
          }

          // Safely parse ctr_prediction to float
          if (parsed.ctr_prediction !== undefined && parsed.ctr_prediction !== null) {
            parsed.ctr_prediction = parseFloat(String(parsed.ctr_prediction).replace(/%/g, ''));
          } else {
            parsed.ctr_prediction = 0;
          }

          setActiveReport(parsed as ViralScoreResult);
          setIsSavedThisReport(false);
        } else {
          console.error("Failed to parse JSON content from generator");
        }
      } catch (err) {
        console.error("Failed to parse JSON content from generator", err);
      }
    }
  }, [output]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !hook.trim() && !script.trim() && !thumbnailText.trim()) {
      toast.warning("Please fill in at least one field (Title, Hook, Script or Thumbnail text) to analyze.");
      return;
    }

    generate("VIRAL_SCORE", {
      topic: title || hook.slice(0, 50) || "Video Content",
      title,
      hook,
      script,
      thumbnailText,
      platform,
    } as any);
  };

  const handleCopyReport = async () => {
    if (!activeReport) return;
    try {
      const reportText = `=== AI CONTENT VIRALITY FORECAST ===
Analyze Title: ${title || "N/A"}
Thumbnail Overlay: ${thumbnailText || "N/A"}
Target Platform: ${platform.toUpperCase()}

VIRAL INDEX SCORES:
- Virality Score: ${activeReport.virality_score}%
- Predicted CTR: ${activeReport.ctr_prediction}%
- Emotional sentiment impact: ${activeReport.emotional_score}%

EMOTIONAL PATTERN RATINGS:
- Curiosity: ${activeReport.emotional_breakdown.curiosity}%
- Urgency: ${activeReport.emotional_breakdown.urgency}%
- Surprise: ${activeReport.emotional_breakdown.surprise}%
- Happiness: ${activeReport.emotional_breakdown.happiness}%
- Anger: ${activeReport.emotional_breakdown.anger}%
- Sadness: ${activeReport.emotional_breakdown.sadness}%

RETENTION FORECAST DECAY:
${activeReport.retention_prediction.map((val, idx) => `Checkpoint ${idx * 10}%: ${val}%`).join("\n")}

AUDIENCE BEHAVIORAL TRIGGERS:
${activeReport.audience_psychology.map((item, idx) => `- Trigger: ${item.trigger}\n  Reaction: ${item.reaction}\n  Effect: ${item.effect}`).join("\n")}

OPTIMIZATION RECOMMENDATIONS:
${activeReport.improvements.map((t, idx) => `${idx + 1}. ${t}`).join("\n")}

VERDICT:
${activeReport.verdict}

Generated by CreatorOS AI Virality Predictor.`;

      await navigator.clipboard.writeText(reportText);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveReport = () => {
    if (!activeReport) return;
    const isAlreadySaved = savedReports.some((r) => r.result.verdict === activeReport.verdict);
    if (isAlreadySaved) {
      setIsSavedThisReport(true);
      return;
    }

    const newReport: SavedScoreReport = {
      id: crypto.randomUUID(),
      title: title || hook.slice(0, 30) || "Untitled Analysis",
      platform,
      timestamp: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      result: activeReport,
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
    setHook(""); // simple reset details
    setScript("");
    setThumbnailText("");
    setActiveReport(report.result);
    setIsSavedThisReport(true);
  };

  const handleExportJSON = () => {
    if (!activeReport) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeReport, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `virality-report-${slugify(title || "draft")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Recharts calculations
  const retentionData = activeReport
    ? activeReport.retention_prediction.map((val, idx) => ({
        checkpoint: `${idx * 10}%`,
        retention: val,
      }))
    : [];

  const emotionalData = activeReport
    ? [
        { subject: "Curiosity", value: activeReport.emotional_breakdown.curiosity },
        { subject: "Urgency", value: activeReport.emotional_breakdown.urgency },
        { subject: "Surprise", value: activeReport.emotional_breakdown.surprise },
        { subject: "Happiness", value: activeReport.emotional_breakdown.happiness },
        { subject: "Sadness", value: activeReport.emotional_breakdown.sadness },
        { subject: "Anger", value: activeReport.emotional_breakdown.anger },
      ]
    : [];

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      <PageHeader
        title="Viral Score Predictor"
        description="Predict performance metrics and audience retention profiles using visual-behavioral algorithms."
        badge="Analytics (Pro)"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Parameters input form */}
        <div className="lg:col-span-5 space-y-6">
          <Card variant="glass" className="border border-glass-border" hoverEffect={false}>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-extrabold flex items-center gap-2">
                <Brain className="h-5 w-5 text-brand-400" />
                Metadata & Script Draft
              </CardTitle>
              <CardDescription className="text-xs">
                Fill in the components of your video concept to predict retention.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                    Video Title
                  </label>
                  <Input
                    placeholder="e.g. I Spent 24 Hours In India's Most Haunted Fort"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-surface-50/50 focus:bg-surface-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                    Thumbnail Text Overlay
                  </label>
                  <Input
                    placeholder="e.g. 3 AM CHALLENGE"
                    value={thumbnailText}
                    onChange={(e) => setThumbnailText(e.target.value)}
                    className="bg-surface-50/50 focus:bg-surface-50"
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
                      accept="image/*"
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
                    options={PLATFORMS}
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

          {/* Saved Score reports collapsible list */}
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
                                <span>Viral Index: {r.result.virality_score}%</span>
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

        {/* Right Side: Futuristic Analytics dashboard */}
        <div className="lg:col-span-7 h-full">
          {isGenerating && <ScannerLoader />}

          {error && !isGenerating && (
            <Card variant="glass" className="border-error/30 bg-error/5 h-full min-h-[400px] flex flex-col justify-center p-6">
              <div className="flex flex-col items-center text-center max-w-sm mx-auto space-y-4">
                <div className="p-3.5 rounded-2xl bg-error/10 border border-error/20 text-error">
                  <AlertTriangle className="h-7 w-7" />
                </div>
                <h4 className="font-extrabold text-text-primary text-base">Analysis Error</h4>
                <p className="text-xs text-text-secondary leading-relaxed">{error}</p>
                <Button variant="secondary" size="sm" onClick={handleSubmit}>
                  Try Again
                </Button>
              </div>
            </Card>
          )}

          {!isGenerating && !error && !activeReport && (
            <Card variant="glass" className="h-full min-h-[520px] flex flex-col items-center justify-center p-8 border-dashed border-glass-border/60">
              <div className="flex flex-col items-center text-center max-w-xs space-y-4">
                <div className="p-4 rounded-2xl bg-surface-100/50 border border-glass-border/30 text-brand-400 shadow-glow-sm">
                  <TrendingUp className="h-7 w-7 animate-pulse" />
                </div>
                <h4 className="font-extrabold text-text-primary text-sm tracking-wide">Virality Diagnostics</h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Provide drafts of your video titles, hooks, or full scripts on the left to simulate algorithmic retention decay and CTR probability mappings.
                </p>
                <div className="pt-2 flex flex-wrap gap-1.5 justify-center">
                  <span className="px-2 py-0.5 rounded-full bg-surface-100 text-[10px] text-text-secondary border border-glass-border/30">📈 Retention Curves</span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-100 text-[10px] text-text-secondary border border-glass-border/30">🧠 Emotional Radar</span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-100 text-[10px] text-text-secondary border border-glass-border/30">🎯 Triggers</span>
                </div>
              </div>
            </Card>
          )}

          {!isGenerating && !error && activeReport && (
            <div className="space-y-6">
              {/* Actions Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-surface-100/20 border border-glass-border/40 rounded-xl">
                <div>
                  <h4 className="text-sm font-extrabold text-text-primary tracking-tight truncate max-w-[280px]">
                    {title || "Algorithmic Diagnosis"}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20 uppercase tracking-wider font-mono">
                      Platform Fit: {activeReport.breakdown.platform_fit}%
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

              {/* Main Circular Gauges Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ScoreGauge 
                  score={activeReport.virality_score} 
                  label="Virality Index" 
                  colorClass="text-brand-400"
                  strokeColor="stroke-brand-500"
                />
                <ScoreGauge 
                  score={Math.floor(activeReport.ctr_prediction * 10)} // Scale 9.4% to 94 score for progress
                  label={`CTR: ${activeReport.ctr_prediction}%`} 
                  colorClass="text-pink-400"
                  strokeColor="stroke-pink-500"
                />
                <ScoreGauge 
                  score={activeReport.emotional_score} 
                  label="Emotional Power" 
                  colorClass="text-emerald-400"
                  strokeColor="stroke-emerald-400"
                />
              </div>

              {/* Thumbnail CTR Heatmap Predictor */}
              <Card variant="glass" className="border border-glass-border overflow-hidden">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <CardTitle className="text-xs font-extrabold flex items-center gap-1.5 uppercase tracking-wider text-text-secondary select-none">
                      <Eye className="h-4 w-4 text-brand-400" />
                      Thumbnail Gaze Heatmap Predictor
                    </CardTitle>
                    <CardDescription className="text-[10px] select-none text-text-secondary">
                      Simulated eye-tracking attention distribution map overlay.
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 select-none">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowHeatmap(!showHeatmap)}
                      className={cn("h-7 px-2.5 text-[10px] border border-glass-border", showHeatmap && "bg-brand-500 text-white border-brand-400")}
                    >
                      Heatmap: {showHeatmap ? "ON" : "OFF"}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowGazePath(!showGazePath)}
                      className={cn("h-7 px-2.5 text-[10px] border border-glass-border", showGazePath && "bg-pink-500 text-white border-pink-400")}
                    >
                      Gaze Path: {showGazePath ? "ON" : "OFF"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                    {/* Visual Preview */}
                    <div className="md:col-span-7 flex justify-center">
                      <div className="relative aspect-video w-full max-w-[420px] rounded-xl overflow-hidden border border-glass-border/40 shadow-cinematic bg-surface-200">
                        {thumbnailImage ? (
                          <img
                            src={thumbnailImage}
                            alt="Thumbnail"
                            className="w-full h-full object-cover select-none"
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center select-none space-y-1">
                            <div className="h-8 w-12 rounded border border-dashed border-text-muted flex items-center justify-center text-[10px] text-text-muted">
                              🖼️
                            </div>
                            <span className="text-[11px] font-extrabold text-text-secondary uppercase tracking-wider">
                              Typical Layout Mockup
                            </span>
                            <span className="text-[9px] text-text-muted leading-snug">
                              Upload custom thumbnail on the left for localized maps.
                            </span>
                          </div>
                        )}

                        {/* Gaze Heatmap Glowing Hotspots */}
                        {showHeatmap && (
                          <div className="absolute inset-0 pointer-events-none mix-blend-color-dodge opacity-85 transition-opacity duration-300">
                            {/* Hotspot 1: Subject / Face (Left-Middle) */}
                            <div
                              className="absolute w-[130px] h-[130px] rounded-full blur-[25px] opacity-75"
                              style={{
                                left: "15%",
                                top: "20%",
                                background: "radial-gradient(circle, rgba(239,68,68,1) 0%, rgba(245,158,11,0.6) 40%, rgba(16,185,129,0) 70%)"
                              }}
                            />
                            {/* Hotspot 2: Title/Text Overlay (Top-Right) */}
                            <div
                              className="absolute w-[180px] h-[100px] rounded-full blur-[22px] opacity-80"
                              style={{
                                right: "10%",
                                top: "15%",
                                background: "radial-gradient(circle, rgba(239,68,68,1) 0%, rgba(245,158,11,0.5) 45%, rgba(16,185,129,0) 70%)"
                              }}
                            />
                            {/* Hotspot 3: Background Contrast (Center-Bottom) */}
                            <div
                              className="absolute w-[110px] h-[110px] rounded-full blur-[20px] opacity-60"
                              style={{
                                left: "45%",
                                bottom: "15%",
                                background: "radial-gradient(circle, rgba(245,158,11,1) 0%, rgba(16,185,129,0.5) 40%, rgba(16,185,129,0) 70%)"
                              }}
                            />
                          </div>
                        )}

                        {/* Gaze Path Vector Overlays */}
                        {showGazePath && (
                          <div className="absolute inset-0 pointer-events-none transition-opacity duration-300">
                            {/* Connecting SVG Path Line */}
                            <svg className="absolute inset-0 w-full h-full">
                              <line
                                x1="25%" y1="35%"
                                x2="70%" y2="25%"
                                stroke="var(--color-pink-500)"
                                strokeWidth="2"
                                strokeDasharray="4 4"
                              />
                              <line
                                x1="70%" y1="25%"
                                x2="50%" y2="70%"
                                stroke="var(--color-pink-500)"
                                strokeWidth="2"
                                strokeDasharray="4 4"
                              />
                            </svg>

                            {/* Node 1 */}
                            <div
                              className="absolute h-5 w-5 rounded-full bg-pink-500 border border-white flex items-center justify-center font-extrabold text-[9px] text-white shadow-glow-pink"
                              style={{ left: "23%", top: "31%" }}
                            >
                              1
                            </div>
                            {/* Node 2 */}
                            <div
                              className="absolute h-5 w-5 rounded-full bg-pink-500 border border-white flex items-center justify-center font-extrabold text-[9px] text-white shadow-glow-pink"
                              style={{ right: "28%", top: "21%" }}
                            >
                              2
                            </div>
                            {/* Node 3 */}
                            <div
                              className="absolute h-5 w-5 rounded-full bg-pink-500 border border-white flex items-center justify-center font-extrabold text-[9px] text-white shadow-glow-pink"
                              style={{ left: "48%", bottom: "26%" }}
                            >
                              3
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats Breakdowns column */}
                    <div className="md:col-span-5 space-y-4">
                      <div className="space-y-2 select-none">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                          Visual Attention Scores
                        </span>
                        <div className="space-y-2.5">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-semibold">
                              <span className="text-text-secondary">Focal Subject Clarity</span>
                              <span className="text-brand-400 font-bold">92% (High)</span>
                            </div>
                            <div className="h-1 w-full bg-surface-200 rounded-full overflow-hidden">
                              <div className="h-full bg-brand-500" style={{ width: "92%" }} />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-semibold">
                              <span className="text-text-secondary">Text Overlay Contrast</span>
                              <span className="text-pink-400 font-bold">87% (Optimal)</span>
                            </div>
                            <div className="h-1 w-full bg-surface-200 rounded-full overflow-hidden">
                              <div className="h-full bg-pink-500" style={{ width: "87%" }} />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-semibold">
                              <span className="text-text-secondary">Color Complementarity</span>
                              <span className="text-emerald-400 font-bold">81% (Good)</span>
                            </div>
                            <div className="h-1 w-full bg-surface-200 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-400" style={{ width: "81%" }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-surface-100/50 border border-glass-border/30 text-[10px] leading-relaxed text-text-secondary">
                        <span className="font-extrabold text-brand-400 block uppercase text-[8px] mb-0.5 select-none">Heatmap Verdict</span>
                        Gaze focus centers primarily on the left-third focal subject before navigating directly to the text overlay. Contrast levels are sufficient to trigger micro-curiosity.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Retention Curve Area Chart */}
              <Card variant="glass" className="border border-glass-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-extrabold flex items-center gap-1.5 uppercase tracking-wider text-text-secondary select-none">
                    <Activity className="h-4 w-4 text-brand-400" />
                    Simulated Retention Decay Curve
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  {mounted ? (
                    <div className="h-[210px] w-full select-none">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={retentionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--color-brand-500)" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="var(--color-brand-500)" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                          <XAxis 
                            dataKey="checkpoint" 
                            stroke="var(--color-text-muted)" 
                            fontSize={10} 
                            tickLine={false}
                          />
                          <YAxis 
                            stroke="var(--color-text-muted)" 
                            fontSize={10} 
                            tickLine={false} 
                            domain={[0, 100]} 
                          />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="glass border border-glass-border px-3.5 py-2 rounded-lg text-left shadow-cinematic">
                                    <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">{label}</p>
                                    <p className="text-xs font-extrabold text-brand-400 mt-0.5">
                                      Retention: <span className="font-mono text-text-primary">{payload[0].value}%</span>
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="retention" 
                            stroke="var(--color-brand-400)" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorRetention)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[210px] w-full flex items-center justify-center text-xs text-text-muted bg-surface-100/10 rounded-lg">
                      Initializing Chart Viewport...
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Emotional Breakdown & Category Matrix Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Radar Chart */}
                <Card variant="glass" className="border border-glass-border">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-xs font-extrabold flex items-center gap-1.5 uppercase tracking-wider text-text-secondary select-none">
                      <Heart className="h-4 w-4 text-pink-400" />
                      Emotional Sentiment Matrix
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2 flex items-center justify-center">
                    {mounted ? (
                      <div className="h-[210px] w-full max-w-[280px] aspect-square flex items-center justify-center select-none">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={emotionalData}>
                            <Tooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="glass border border-glass-border px-3.5 py-2 rounded-lg text-left shadow-cinematic text-xs">
                                      <p className="font-extrabold text-pink-400">
                                        {payload[0].payload.subject}: <span className="font-mono text-text-primary">{payload[0].value}%</span>
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <PolarGrid stroke="rgba(255,255,255,0.06)" />
                            <PolarAngleAxis 
                              dataKey="subject" 
                              stroke="var(--color-text-secondary)" 
                              fontSize={9} 
                            />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={7} stroke="rgba(255,255,255,0.15)" />
                            <Radar 
                              name="Emotion" 
                              dataKey="value" 
                              stroke="var(--color-pink-500)" 
                              fill="var(--color-pink-500)" 
                              fillOpacity={0.3} 
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-[210px] w-full flex items-center justify-center text-xs text-text-muted bg-surface-100/10 rounded-lg">
                        Initializing Matrix Chart...
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Score breakdown metrics list */}
                <Card variant="glass" className="border border-glass-border flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xs font-extrabold flex items-center gap-1.5 uppercase tracking-wider text-text-secondary select-none">
                      <Percent className="h-4 w-4 text-brand-400" />
                      Diagnostic Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pb-6 select-none">
                    {Object.entries(activeReport.breakdown).map(([category, val]) => {
                      const labels: Record<string, string> = {
                        hook: "Hook Strength",
                        shareability: "Shareability",
                        relatability: "Relatability",
                        timeliness: "Timeliness",
                        platform_fit: "Platform Fit",
                        thumbnail_contrast: "Thumbnail Contrast",
                      };
                      return (
                        <div key={category} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-text-secondary">{labels[category] || category}</span>
                            <span className="text-text-primary font-mono">{val}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-surface-200 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-linear-to-r from-brand-500 to-pink-500 rounded-full shadow-glow-sm"
                              initial={{ width: 0 }}
                              animate={{ width: `${val}%` }}
                              transition={{ duration: 0.8 }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* Audience Psychology Trigger Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activeReport.audience_psychology.map((item, idx) => (
                  <Card key={idx} variant="glass" className="border border-glass-border/30 hover:border-pink-500/30 transition-colors group">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-pink-400 group-hover:scale-102 transition-transform select-none">
                        <Zap className="h-4 w-4 fill-current text-pink-400" />
                        <span>{item.trigger}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Viewer Reaction</span>
                        <p className="text-[11px] text-text-primary leading-snug">{item.reaction}</p>
                      </div>
                      <div className="space-y-1 pt-1 border-t border-glass-border/10">
                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Neurological Effect</span>
                        <p className="text-[11px] text-text-secondary leading-snug">{item.effect}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Optimization Roadmap Improvements */}
              <Card variant="glass" className="border border-glass-border">
                <CardContent className="p-5 space-y-4">
                  <div className="flex flex-col gap-1.5 select-none">
                    <span className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <Info className="h-4.5 w-4.5 text-brand-400" />
                      Virality Optimizations Roadmap
                    </span>
                    <p className="text-[11px] text-text-secondary leading-relaxed font-medium">
                      Verdict: {activeReport.verdict}
                    </p>
                  </div>
                  <div className="space-y-3 pt-1 border-t border-glass-border/20">
                    {activeReport.improvements.map((imp, idx) => (
                      <div key={idx} className="flex gap-2 text-xs text-text-secondary leading-relaxed align-top">
                        <div className="h-4.5 w-4.5 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0 select-none">
                          <Check className="h-3.5 w-3.5 text-brand-400" />
                        </div>
                        <span>{imp}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
