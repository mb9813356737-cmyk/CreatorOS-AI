"use client";

import * as React from "react";
import { useRef, useEffect } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAIGenerate } from "@/hooks/use-ai-generate";
import { 
  Sparkles, Copy, Check, RefreshCw, AlertTriangle, 
  Trash2, Download, Bookmark, Smile, Palette, 
  Lightbulb, Camera, Type, Eye, ChevronDown, 
  ChevronUp, Brain, Info, Terminal, Sparkle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, slugify } from "@/lib/utils";

// ─── Interfaces ──────────────────────────────────────────────
interface ThumbnailParsedData {
  image_prompt: string;
  text_overlay: string;
  text_color: string;
  text_position: "bottom" | "top" | "center";
}

// Keep SavedPrompt generic so old saves don't break
interface SavedPrompt {
  id: string;
  topic: string;
  mode: string;
  timestamp: string;
  result: ThumbnailParsedData;
}

// ─── Mode Definitions ─────────────────────────────────────────
const MODES = [
  {
    id: "MrBeast style",
    name: "MrBeast Style",
    icon: "🔥",
    description: "High-energy, shocking, and bold visual triggers",
    gradient: "from-red-500/20 via-orange-500/20 to-yellow-500/20",
    borderGlow: "hover:shadow-[0_0_20px_rgba(239,68,68,0.25)] hover:border-red-500/40",
    activeBorder: "border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.3)]",
    textGlow: "text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]",
    bg: "bg-red-500/10",
  },
  {
    id: "cinematic",
    name: "Cinematic",
    icon: "🎬",
    description: "Dramatic framing, moody lighting, wide-screen view",
    gradient: "from-blue-500/20 via-cyan-500/20 to-teal-500/20",
    borderGlow: "hover:shadow-[0_0_20px_rgba(59,130,246,0.25)] hover:border-blue-500/40",
    activeBorder: "border-blue-500/80 shadow-[0_0_15px_rgba(59,130,246,0.3)]",
    textGlow: "text-blue-400 drop-shadow-[0_0_6px_rgba(59,130,246,0.5)]",
    bg: "bg-blue-500/10",
  },
  {
    id: "luxury",
    name: "Luxury",
    icon: "💎",
    description: "Premium editorial style, gold accents, clean layouts",
    gradient: "from-yellow-600/20 via-emerald-600/20 to-stone-500/20",
    borderGlow: "hover:shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:border-emerald-500/40",
    activeBorder: "border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.3)]",
    textGlow: "text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]",
    bg: "bg-emerald-500/10",
  },
  {
    id: "emotional",
    name: "Emotional",
    icon: "😢",
    description: "Intimate close-ups showcasing raw human emotion",
    gradient: "from-pink-500/20 via-rose-500/20 to-red-500/20",
    borderGlow: "hover:shadow-[0_0_20px_rgba(244,63,94,0.25)] hover:border-rose-500/40",
    activeBorder: "border-rose-500/80 shadow-[0_0_15px_rgba(244,63,94,0.3)]",
    textGlow: "text-rose-400 drop-shadow-[0_0_6px_rgba(244,63,94,0.5)]",
    bg: "bg-rose-500/10",
  },
  {
    id: "documentary",
    name: "Documentary",
    icon: "📽️",
    description: "Natural lighting, gritty textures, photojournalism",
    gradient: "from-amber-600/20 via-yellow-600/20 to-orange-600/20",
    borderGlow: "hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:border-amber-500/40",
    activeBorder: "border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.3)]",
    textGlow: "text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]",
    bg: "bg-amber-500/10",
  },
  {
    id: "storytelling",
    name: "Storytelling",
    icon: "📖",
    description: "Narrative split screens, progression, elements of mystery",
    gradient: "from-brand-500/20 via-purple-500/20 to-pink-500/20",
    borderGlow: "hover:shadow-[0_0_20px_rgba(139,92,246,0.25)] hover:border-purple-500/40",
    activeBorder: "border-brand-500/80 shadow-[0_0_15px_rgba(139,92,246,0.3)]",
    textGlow: "text-brand-400 drop-shadow-[0_0_6px_rgba(139,92,246,0.5)]",
    bg: "bg-brand-500/10",
  },
] as const;

// ─── CTR Gauge Component ──────────────────────────────────────
function CtrGauge({ score }: { score: number }) {
  const radius = 55;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let rating = "Fair";
  let colorClass = "text-error drop-shadow-[0_0_8px_var(--color-error)]";
  let strokeColor = "stroke-error";

  if (score >= 90) {
    rating = "Godlike";
    colorClass = "text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.5)]";
    strokeColor = "stroke-emerald-400";
  } else if (score >= 80) {
    rating = "Excellent";
    colorClass = "text-brand-400 drop-shadow-[0_0_10px_var(--color-brand-400)]";
    strokeColor = "stroke-brand-500";
  } else if (score >= 70) {
    rating = "Good";
    colorClass = "text-pink-500 drop-shadow-[0_0_8px_var(--color-pink-500)]";
    strokeColor = "stroke-pink-500";
  }

  return (
    <div className="flex flex-col items-center justify-center p-5 bg-surface-100/30 border border-glass-border/40 rounded-xl relative overflow-hidden h-full">
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle
            className="stroke-surface-200"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            className={`transition-all duration-1000 ease-out ${strokeColor}`}
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
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-text-primary tracking-tighter">
            {score}%
          </span>
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
            CTR Score
          </span>
        </div>
      </div>
      <div className="mt-3 text-center">
        <span className={`text-sm font-extrabold uppercase tracking-widest ${colorClass}`}>
          {rating}
        </span>
        <p className="text-[10px] text-text-muted mt-1 max-w-[170px] leading-snug">
          Predicted CTR rating optimized for target audience click psychology.
        </p>
      </div>
    </div>
  );
}

// ─── Radar Chart Component ────────────────────────────────────
function RadarChart({ scoring }: { scoring: any }) {
  const axes = [
    { key: "emotion" as const, label: "Emotion" },
    { key: "contrast" as const, label: "Contrast" },
    { key: "curiosity" as const, label: "Curiosity" },
    { key: "urgency" as const, label: "Urgency" },
    { key: "relatability" as const, label: "Relatability" },
    { key: "uniqueness" as const, label: "Uniqueness" },
  ];

  const size = 260;
  const center = size / 2;
  const radius = 80;

  const getCoordinates = (index: number, value: number) => {
    const angle = (index * 2 * Math.PI) / 6 - Math.PI / 2;
    const x = center + radius * (value / 100) * Math.cos(angle);
    const y = center + radius * (value / 100) * Math.sin(angle);
    return { x, y };
  };

  const getLabelCoordinates = (index: number) => {
    const angle = (index * 2 * Math.PI) / 6 - Math.PI / 2;
    const labelRadius = radius + 22;
    const x = center + labelRadius * Math.cos(angle);
    const y = center + labelRadius * Math.sin(angle);
    return { x, y };
  };

  const gridLevels = [25, 50, 75, 100];
  const gridPolygons = gridLevels.map((level) => {
    return Array.from({ length: 6 })
      .map((_, i) => {
        const { x, y } = getCoordinates(i, level);
        return `${x},${y}`;
      })
      .join(" ");
  });

  const dataPoints = axes
    .map((axis, i) => {
      const score = scoring[axis.key] || 0;
      const { x, y } = getCoordinates(i, score);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="flex flex-col items-center justify-center p-5 bg-surface-100/30 border border-glass-border/40 rounded-xl w-full h-full">
      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 self-start select-none">
        CTR Psychology Matrix
      </span>
      <div className="relative w-full max-w-[210px] aspect-square flex items-center justify-center select-none">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible">
          <defs>
            <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity="0.45" />
              <stop offset="100%" stopColor="var(--color-pink-500)" stopOpacity="0.05" />
            </radialGradient>
          </defs>

          {/* Grid lines */}
          {gridPolygons.map((points, idx) => (
            <polygon
              key={idx}
              points={points}
              className="fill-none stroke-glass-border/20 stroke-[1]"
            />
          ))}

          {/* Axis lines */}
          {Array.from({ length: 6 }).map((_, i) => {
            const { x, y } = getCoordinates(i, 100);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                className="stroke-glass-border/15 stroke-[1]"
              />
            );
          })}

          {/* Filled radar area */}
          <polygon
            points={dataPoints}
            fill="url(#radarGlow)"
            className="stroke-brand-500 stroke-[2] drop-shadow-[0_0_6px_var(--color-brand-500)] transition-all duration-500"
          />

          {/* Value markers and nodes */}
          {axes.map((axis, i) => {
            const score = scoring[axis.key] || 0;
            const { x, y } = getCoordinates(i, score);
            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r="3.5"
                  className="fill-brand-400 stroke-surface-0 stroke-[1.5] drop-shadow-[0_0_4px_var(--color-brand-400)] transition-all duration-300 hover:scale-125 cursor-pointer"
                />
              </g>
            );
          })}

          {/* Labels */}
          {axes.map((axis, i) => {
            const { x, y } = getLabelCoordinates(i);
            const score = scoring[axis.key] || 0;
            let textAnchor: "middle" | "end" | "start" = "middle";
            let dy = "0.3em";
            if (x < center - 10) textAnchor = "end";
            if (x > center + 10) textAnchor = "start";
            if (y < center - radius) dy = "-0.2em";
            if (y > center + radius) dy = "1em";

            return (
              <text
                key={i}
                x={x}
                y={y}
                dy={dy}
                textAnchor={textAnchor}
                className="text-[9px] font-bold fill-text-secondary select-none tracking-tight uppercase"
              >
                {axis.label} ({score})
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ─── Loading Scanner Component ────────────────────────────────
function ScannerLoader() {
  const steps = [
    "Analyzing visual psychology parameters...",
    "Scanning competitive thumbnail designs...",
    "Evaluating color contrasts & font hotspots...",
    "Estimating CTR click-through probabilities...",
    "Finalizing Midjourney image prompts...",
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
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-500/5 to-transparent w-full h-[200px] animate-[bounce_4s_infinite] opacity-40 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-[1px] bg-brand-400/30 shadow-[0_0_10px_var(--color-brand-400)] animate-[float_4s_infinite]" />

      <div className="flex flex-col items-center text-center max-w-sm space-y-6 z-10">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-brand-500/20 blur-xl animate-pulse" />
          <div className="p-5 rounded-full bg-surface-100/50 border border-brand-500/20 text-brand-400 relative">
            <RefreshCw className="h-10 w-10 animate-spin" style={{ animationDuration: "3s" }} />
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-extrabold text-text-primary text-sm uppercase tracking-wider">
            Optimizing CTR Strategy
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
                idx === stepIndex ? "bg-brand-500 w-4 shadow-glow-sm" : "bg-surface-200"
              )}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

// ─── Thumbnail Canvas Component ───────────────────────────────
function ThumbnailCanvas({ parsedData }: { parsedData: ThumbnailParsedData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!parsedData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imagePrompt = parsedData.image_prompt;
    const textOverlay = parsedData.text_overlay;
    const textPosition = parsedData.text_position || "bottom";

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}&width=1280&height=720&nologo=true`;

    img.onload = () => {
      canvas.width = 1280;
      canvas.height = 720;

      ctx.drawImage(img, 0, 0, 1280, 720);

      // Gradient overlay based on text position
      const gradient = ctx.createLinearGradient(
        0,
        textPosition === "top" ? 0 : canvas.height * 0.5,
        0,
        textPosition === "top" ? canvas.height * 0.5 : canvas.height
      );
      gradient.addColorStop(0, textPosition === "top" ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0)");
      gradient.addColorStop(1, textPosition === "top" ? "rgba(0,0,0,0)" : "rgba(0,0,0,0.85)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Text settings
      const fontSize = 96;
      ctx.font = `900 ${fontSize}px Impact, Arial Black, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";

      const yPos =
        textPosition === "top"
          ? 100
          : textPosition === "center"
          ? canvas.height / 2
          : canvas.height - 60;

      // Word wrap
      const words = textOverlay.split(" ");
      const lines: string[] = [];
      let currentLine = "";
      words.forEach((word) => {
        const testLine = currentLine + word + " ";
        if (ctx.measureText(testLine).width > canvas.width * 0.85) {
          lines.push(currentLine.trim());
          currentLine = word + " ";
        } else {
          currentLine = testLine;
        }
      });
      lines.push(currentLine.trim());

      const lineHeight = fontSize * 1.15;
      const startY = yPos - ((lines.length - 1) * lineHeight) / 2;

      lines.forEach((line, i) => {
        const y = startY + i * lineHeight;
        ctx.strokeStyle = "rgba(0,0,0,1)";
        ctx.lineWidth = 12;
        ctx.lineJoin = "round";
        ctx.strokeText(line, canvas.width / 2, y);
        ctx.fillStyle = parsedData.text_color || "#FFFFFF";
        ctx.fillText(line, canvas.width / 2, y);
      });
    };
  }, [parsedData]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.download = "thumbnail.png";
    link.href = canvasRef.current?.toDataURL("image/png") || "";
    link.click();
  };

  return (
    <div className="space-y-3">
      <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">
        Generated Thumbnail
      </span>
      <canvas
        ref={canvasRef}
        className="w-full rounded-xl border border-glass-border"
      />
      <button
        onClick={handleDownload}
        className="w-full py-2.5 text-xs font-bold text-text-secondary border border-glass-border rounded-lg hover:border-brand-400 hover:text-brand-400 transition-all"
      >
        Download Thumbnail
      </button>
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────
export default function ThumbnailsPage() {
  const { generate, output, isGenerating, error } = useAIGenerate("THUMBNAIL");
  const [topic, setTopic] = React.useState("");
  const [selectedMode, setSelectedMode] = React.useState<string>("MrBeast style");
  const [additionalContext, setAdditionalContext] = React.useState("");

  const [activeReport, setActiveReport] = React.useState<ThumbnailParsedData | null>(null);
  const [savedPrompts, setSavedPrompts] = React.useState<SavedPrompt[]>([]);
  const [isSavedOpen, setIsSavedOpen] = React.useState(true);

  const [copiedPrompt, setCopiedPrompt] = React.useState(false);
  const [copiedReport, setCopiedReport] = React.useState(false);
  const [isSavedThisReport, setIsSavedThisReport] = React.useState(false);
  const [parseError, setParseError] = React.useState<string | null>(null);

  // Sync saved prompts from localStorage (Client only)
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("creatoros_saved_thumbnails");
      if (stored) {
        try {
          setSavedPrompts(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to load saved thumbnail prompts", e);
        }
      }
    }
  }, []);

  // Update activeReport when output changes from API
  React.useEffect(() => {
    if (output) {
      console.log("[ThumbnailsPage] Received new output for parsing:", output);
      try {
        setParseError(null);
        const clean = output.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
        console.log("[ThumbnailsPage] Cleaned output string:", clean);
        let parsed: any;
        try {
          parsed = JSON.parse(clean);
          console.log("[ThumbnailsPage] JSON parsed successfully:", parsed);
        } catch (firstErr) {
          console.warn("[ThumbnailsPage] Initial JSON parse failed, trying regex fallback...", firstErr);
          // If JSON parse fails, try to extract JSON using regex match for { } block
          const jsonMatch = output.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            console.log("[ThumbnailsPage] Regex JSON match found:", jsonMatch[0]);
            parsed = JSON.parse(jsonMatch[0]);
            console.log("[ThumbnailsPage] Regex match parsed successfully:", parsed);
          } else {
            console.error("[ThumbnailsPage] Regex match failed, throwing error");
            throw firstErr;
          }
        }
        setActiveReport(parsed);
        setIsSavedThisReport(false);
      } catch (err) {
        console.error("[ThumbnailsPage] Failed to parse JSON content from generator:", err);
        setParseError("Could not generate thumbnail report. Please try again.");
        setActiveReport(null);
      }
    }
  }, [output]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setParseError(null);
    generate("THUMBNAIL", { topic, tone: selectedMode, additionalContext });
  };

  const handleCopyPrompt = async () => {
    if (!activeReport) return;
    try {
      await navigator.clipboard.writeText(activeReport.image_prompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyReport = async () => {
    if (!activeReport) return;
    try {
      const reportText = `IMAGE PROMPT:\n${activeReport.image_prompt}\n\nTEXT OVERLAY: ${activeReport.text_overlay}\nTEXT COLOR: ${activeReport.text_color}\nTEXT POSITION: ${activeReport.text_position}`;
      await navigator.clipboard.writeText(reportText);
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveReport = () => {
    if (!activeReport) return;
    const isAlreadySaved = savedPrompts.some((p) => p.result.image_prompt === activeReport.image_prompt);
    if (isAlreadySaved) {
      setIsSavedThisReport(true);
      return;
    }

    const newPrompt: SavedPrompt = {
      id: crypto.randomUUID(),
      topic: topic || "Generated Report",
      mode: selectedMode,
      timestamp: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      result: activeReport,
    };

    const updated = [newPrompt, ...savedPrompts];
    setSavedPrompts(updated);
    localStorage.setItem("creatoros_saved_thumbnails", JSON.stringify(updated));
    setIsSavedThisReport(true);
  };

  const handleDeleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedPrompts.filter((p) => p.id !== id);
    setSavedPrompts(updated);
    localStorage.setItem("creatoros_saved_thumbnails", JSON.stringify(updated));
  };

  const handleLoadSaved = (prompt: SavedPrompt) => {
    setTopic(prompt.topic);
    setSelectedMode(prompt.mode);
    setAdditionalContext("");
    setActiveReport(prompt.result);
    setIsSavedThisReport(true);
  };

  const handleExportJSON = () => {
    if (!activeReport) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeReport, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `thumbnail-psychology-${slugify(topic || "report")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Details of the currently selected mode
  const activeModeDetails = MODES.find((m) => m.id === selectedMode) || MODES[0];

  const renderRightColumn = () => {
    if (isGenerating) {
      return (
        <div className="h-full min-h-[400px] flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-glass-border border-t-brand-400 animate-spin" />
            <div
              className="absolute inset-0 flex items-center justify-center"
            >
              <div
                className="h-8 w-8 rounded-full border-4 border-glass-border border-b-purple-400 animate-spin"
                style={{ animationDirection: "reverse", animationDuration: "0.6s" }}
              />
            </div>
          </div>
          <p className="text-sm font-semibold text-text-secondary animate-pulse">
            Generating Thumbnail...
          </p>
        </div>
      );
    }

    if (error || parseError) {
      return (
        <Card variant="glass" className="border-error/30 bg-error/5 h-full min-h-[400px] flex flex-col justify-center p-6">
          <div className="flex flex-col items-center text-center max-w-sm mx-auto space-y-4">
            <div className="p-3.5 rounded-2xl bg-error/10 border border-error/20 text-error">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h4 className="font-extrabold text-text-primary text-base">Generation Encountered an Error</h4>
            <p className="text-xs text-text-secondary leading-relaxed">{error || parseError}</p>
            <Button variant="secondary" size="sm" onClick={handleSubmit}>
              Try Again
            </Button>
          </div>
        </Card>
      );
    }

    if (!activeReport) {
      return (
        <Card variant="glass" className="h-full min-h-[520px] flex flex-col items-center justify-center p-8 border-dashed border-glass-border/60">
          <div className="flex flex-col items-center text-center max-w-xs space-y-4">
            <div className="p-4 rounded-2xl bg-surface-100/50 border border-glass-border/30 text-brand-400 shadow-glow-sm">
              <Sparkles className="h-7 w-7" />
            </div>
            <h4 className="font-extrabold text-text-primary text-sm tracking-wide">Awaiting Studio Inputs</h4>
            <p className="text-xs text-text-muted leading-relaxed">
              Enter your video topic, select a visual theme, and generate a complete psychological breakdown report + image generation prompt.
            </p>
            <div className="pt-2 flex flex-wrap gap-1.5 justify-center">
              <span className="px-2 py-0.5 rounded-full bg-surface-100 text-[10px] text-text-secondary border border-glass-border/30">🔥 MrBeast CTR</span>
              <span className="px-2 py-0.5 rounded-full bg-surface-100 text-[10px] text-text-secondary border border-glass-border/30">🎬 Cinematic depth</span>
              <span className="px-2 py-0.5 rounded-full bg-surface-100 text-[10px] text-text-secondary border border-glass-border/30">📐 Perspective</span>
            </div>
          </div>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {activeReport.image_prompt && (
          <ThumbnailCanvas parsedData={activeReport} />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      <PageHeader
        title="Thumbnail Psychology Engine"
        description="Craft high-CTR visual blueprints and Midjourney prompts backed by neural-marketing analysis."
        badge="AI Studio (Pro)"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: AI Studio Controls */}
        <div className="lg:col-span-5 space-y-6">
          <Card variant="glass" className="border border-glass-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-extrabold flex items-center gap-2">
                <Brain className="h-5 w-5 text-brand-400" />
                Psychology Parameters
              </CardTitle>
              <CardDescription className="text-xs">
                Select your concept and style mode to customize the visual anchors.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                    Video Topic / Concept
                  </label>
                  <Input
                    placeholder="e.g. I Spent 100 Hours In The Metaverse (Desi Reality Check)"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    required
                    className="bg-surface-50/50 focus:bg-surface-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                    Visual Psychology Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {MODES.map((m) => {
                      const isActive = selectedMode === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedMode(m.id)}
                          className={cn(
                            "flex flex-col items-start text-left p-3 rounded-lg border text-xs transition-all duration-300 relative overflow-hidden group/btn",
                            isActive 
                              ? `${m.activeBorder} bg-surface-100` 
                              : "border-glass-border bg-surface-50/30 hover:bg-surface-100/50 hover:border-glass-border-hover"
                          )}
                        >
                          {isActive && (
                            <div className={`absolute inset-0 bg-gradient-to-br ${m.gradient} opacity-20 pointer-events-none`} />
                          )}
                          <div className="flex items-center gap-1.5 font-extrabold text-text-primary mb-1">
                            <span className="text-sm select-none">{m.icon}</span>
                            <span className={cn(isActive && m.textGlow)}>{m.name}</span>
                          </div>
                          <span className="text-[9px] text-text-muted leading-tight line-clamp-2">
                            {m.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                    Additional Context (Optional)
                  </label>
                  <Textarea
                    placeholder="e.g. Add a desi laptop screen, make the background blue, include the text 'SCAM?'"
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-linear-to-r from-brand-600 to-pink-600 shadow-glow-sm hover:shadow-glow-md border border-brand-500/20"
                  isLoading={isGenerating}
                  leftIcon={!isGenerating && <Sparkles className="h-4.5 w-4.5" />}
                >
                  Generate Thumbnail
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Saved Prompts Panel */}
          {savedPrompts.length > 0 && (
            <Card variant="glass" className="border border-glass-border">
              <button
                onClick={() => setIsSavedOpen(!isSavedOpen)}
                className="w-full px-6 py-4 flex items-center justify-between font-extrabold text-sm text-text-primary"
              >
                <div className="flex items-center gap-2">
                  <Bookmark className="h-4.5 w-4.5 text-brand-400" />
                  <span>Saved Blueprints ({savedPrompts.length})</span>
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
                      {savedPrompts.map((p) => {
                        const mInfo = MODES.find((m) => m.id === p.mode) || MODES[0];
                        return (
                          <div
                            key={p.id}
                            onClick={() => handleLoadSaved(p)}
                            className="p-3 rounded-lg border border-glass-border bg-surface-50/20 hover:bg-surface-50/50 hover:border-brand-500/30 transition-all cursor-pointer flex items-center justify-between group"
                          >
                            <div className="space-y-1 pr-4 max-w-[80%]">
                              <h5 className="text-xs font-bold text-text-primary truncate">{p.topic}</h5>
                              <div className="flex items-center gap-2 text-[9px] text-text-muted font-mono">
                                <span>{mInfo.icon} {mInfo.name}</span>
                              </div>
                            </div>
                            <button
                              onClick={(e) => handleDeleteSaved(p.id, e)}
                              className="p-1.5 rounded-md hover:bg-error/10 hover:text-error text-text-muted opacity-0 group-hover:opacity-100 transition-all shrink-0"
                              title="Delete blueprint"
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

        {/* Right Column: AI Output Studio */}
        <div className="lg:col-span-7 h-full">
          {renderRightColumn()}
        </div>
      </div>
    </div>
  );
}
