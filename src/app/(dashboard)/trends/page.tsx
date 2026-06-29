"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { OutputCard } from "@/components/ai/output-card";
import { useAIGenerate } from "@/hooks/use-ai-generate";
import { PLATFORMS } from "@/lib/constants";
import {
  Sparkles, AlertTriangle, TrendingUp, Clock,
  Lightbulb, Target, BarChart3, Hash, Zap, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────
interface TrendingTopic {
  topic: string;
  why_trending: string;
  content_angle: string;
  estimated_views: "High" | "Medium" | "Low";
  urgency: "Post Now" | "This Week" | "This Month";
}

interface TrendingFormat {
  format: string;
  why_working: string;
  example_title: string;
}

interface TrendData {
  niche: string;
  platform: string;
  trend_score: number;
  trend_summary: string;
  trending_topics: TrendingTopic[];
  trending_formats: TrendingFormat[];
  best_posting_times: { days: string[]; time: string; reason: string };
  trending_keywords: string[];
  content_gaps: string[];
  niche_health: {
    competition_level: string;
    growth_potential: string;
    monetization_potential: string;
    audience_size: string;
  };
  pro_tip: string;
}

// ─── Helpers ──────────────────────────────────────────────────
function urgencyColor(u: string) {
  if (u === "Post Now") return "bg-red-500/20 text-red-400 border-red-500/30";
  if (u === "This Week") return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  return "bg-green-500/20 text-green-400 border-green-500/30";
}

function viewsColor(v: string) {
  if (v === "High") return "text-green-400";
  if (v === "Medium") return "text-yellow-400";
  return "text-text-muted";
}

function healthColor(val: string) {
  const low = ["Low", "Niche"];
  const high = ["High", "Very High", "Explosive", "Massive"];
  if (high.some(h => val?.includes(h))) return "text-green-400";
  if (low.some(l => val?.includes(l))) return "text-red-400";
  return "text-yellow-400";
}

// ─── Output Display ───────────────────────────────────────────
function TrendOutput({ data }: { data: TrendData }) {
  return (
    <div className="space-y-5">

      {/* Header — Score + Summary */}
      <div className="p-5 rounded-xl bg-surface-100/20 border border-glass-border/40 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Niche Intelligence Report</p>
            <h3 className="text-lg font-extrabold text-text-primary mt-0.5">{data.niche}</h3>
            <span className="text-[10px] font-semibold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20 uppercase tracking-wider">
              {data.platform}
            </span>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-brand-400">{data.trend_score}</div>
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Trend Score</div>
          </div>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed border-t border-glass-border/20 pt-3">{data.trend_summary}</p>
      </div>

      {/* Trending Topics */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-extrabold text-text-primary uppercase tracking-wider">
          <TrendingUp className="h-3.5 w-3.5 text-brand-400" />
          Trending Topics
        </div>
        <div className="space-y-2">
          {data.trending_topics?.map((t, i) => (
            <div key={i} className="p-4 rounded-xl bg-surface-100/10 border border-glass-border/30 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded font-mono">#{i + 1}</span>
                  <span className="text-sm font-bold text-text-primary">{t.topic}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full border", urgencyColor(t.urgency))}>{t.urgency}</span>
                  <span className={cn("text-[10px] font-bold", viewsColor(t.estimated_views))}>{t.estimated_views}</span>
                </div>
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">{t.why_trending}</p>
              <div className="flex items-start gap-1.5">
                <Zap className="h-3 w-3 text-yellow-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-yellow-300/80 font-medium leading-relaxed">{t.content_angle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Formats */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-extrabold text-text-primary uppercase tracking-wider">
          <BarChart3 className="h-3.5 w-3.5 text-brand-400" />
          Trending Formats
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {data.trending_formats?.map((f, i) => (
            <div key={i} className="p-4 rounded-xl bg-surface-100/10 border border-glass-border/30 space-y-2">
              <span className="text-[10px] font-black text-brand-400 uppercase tracking-wider">{f.format}</span>
              <p className="text-[11px] text-text-muted leading-relaxed">{f.why_working}</p>
              <p className="text-[11px] text-text-secondary font-semibold italic">"{f.example_title}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* Keywords + Posting Times row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Keywords */}
        <div className="p-4 rounded-xl bg-surface-100/10 border border-glass-border/30 space-y-2">
          <div className="flex items-center gap-2 text-xs font-extrabold text-text-primary uppercase tracking-wider">
            <Hash className="h-3.5 w-3.5 text-brand-400" />
            Trending Keywords
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.trending_keywords?.map((kw, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-[11px] font-semibold text-brand-300">
                {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Posting Times */}
        <div className="p-4 rounded-xl bg-surface-100/10 border border-glass-border/30 space-y-2">
          <div className="flex items-center gap-2 text-xs font-extrabold text-text-primary uppercase tracking-wider">
            <Clock className="h-3.5 w-3.5 text-brand-400" />
            Best Posting Times
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.best_posting_times?.days?.map((d, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-surface-100/40 border border-glass-border/30 text-[11px] font-semibold text-text-secondary">
                {d}
              </span>
            ))}
          </div>
          <p className="text-sm font-bold text-text-primary">{data.best_posting_times?.time}</p>
          <p className="text-[11px] text-text-muted leading-relaxed">{data.best_posting_times?.reason}</p>
        </div>
      </div>

      {/* Content Gaps */}
      <div className="p-4 rounded-xl bg-surface-100/10 border border-glass-border/30 space-y-2">
        <div className="flex items-center gap-2 text-xs font-extrabold text-text-primary uppercase tracking-wider">
          <Target className="h-3.5 w-3.5 text-brand-400" />
          Content Gaps
        </div>
        <div className="space-y-2">
          {data.content_gaps?.map((gap, i) => (
            <div key={i} className="flex gap-2.5 text-xs text-text-secondary leading-relaxed">
              <span className="font-black text-brand-400 shrink-0">{i + 1}.</span>
              <span>{gap}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Niche Health */}
      <div className="p-4 rounded-xl bg-surface-100/10 border border-glass-border/30 space-y-3">
        <div className="flex items-center gap-2 text-xs font-extrabold text-text-primary uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5 text-brand-400" />
          Niche Health
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Competition", val: data.niche_health?.competition_level },
            { label: "Growth Potential", val: data.niche_health?.growth_potential },
            { label: "Monetization", val: data.niche_health?.monetization_potential },
            { label: "Audience Size", val: data.niche_health?.audience_size },
          ].map(({ label, val }) => (
            <div key={label} className="space-y-0.5">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{label}</p>
              <p className={cn("text-sm font-black", healthColor(val || ""))}>{val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pro Tip */}
      {data.pro_tip && (
        <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/30">
          <div className="flex items-center gap-2 mb-1.5">
            <Lightbulb className="h-3.5 w-3.5 text-brand-400" />
            <span className="text-[10px] font-extrabold text-brand-400 uppercase tracking-wider">Pro Tip</span>
          </div>
          <p className="text-xs text-text-secondary font-medium leading-relaxed">{data.pro_tip}</p>
        </div>
      )}

    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function TrendsPage() {
  const { generate, output, isGenerating, error, reset } = useAIGenerate("TREND");
  const [activeTab, setActiveTab] = React.useState<"niche" | "competitor">("niche");
  const [niche, setNiche] = React.useState("");
  const [competitorHandle, setCompetitorHandle] = React.useState("");
  const [platform, setPlatform] = React.useState("YouTube");

  const [parsedData, setParsedData] = React.useState<TrendData | null>(null);
  const [parseError, setParseError] = React.useState<string | null>(null);

  const handleTabChange = (tab: "niche" | "competitor") => {
    setActiveTab(tab);
    setParsedData(null);
    setParseError(null);
    reset();
  };

  // Parse output when it changes
  React.useEffect(() => {
    if (!output || activeTab === "competitor") return;
    try {
      setParseError(null);
      const clean = output.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      let parsed: any;
      try {
        parsed = JSON.parse(clean);
      } catch {
        const match = output.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
        else throw new Error("No JSON found");
      }
      setParsedData(parsed);
    } catch {
      setParseError("Could not parse trend data. Please try again.");
      setParsedData(null);
    }
  }, [output, activeTab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setParsedData(null);
    setParseError(null);
    if (activeTab === "niche") {
      if (!niche.trim()) return;
      generate("TREND", { topic: niche, niche, platform });
    } else {
      if (!competitorHandle.trim()) return;
      generate("TREND", { topic: `Competitor: ${competitorHandle}`, competitorHandle, platform });
    }
  };

  const renderOutput = () => {
    // Loading
    if (isGenerating) {
      return (
        <div className="h-full min-h-[400px] flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-glass-border border-t-brand-400 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="h-8 w-8 rounded-full border-4 border-glass-border border-b-purple-400 animate-spin"
                style={{ animationDirection: "reverse", animationDuration: "0.6s" }}
              />
            </div>
          </div>
          <p className="text-sm font-semibold text-text-secondary animate-pulse">
            Analyzing Trends...
          </p>
        </div>
      );
    }

    // Error
    if (error || parseError) {
      return (
        <Card variant="glass" className="border-error/30 bg-error/5 h-full min-h-[400px] flex flex-col justify-center p-6">
          <div className="flex flex-col items-center text-center max-w-sm mx-auto space-y-4">
            <div className="p-3.5 rounded-2xl bg-error/10 border border-error/20 text-error">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h4 className="font-extrabold text-text-primary text-base">Generation Encountered an Error</h4>
            <p className="text-xs text-text-secondary leading-relaxed">{error || parseError}</p>
          </div>
        </Card>
      );
    }

    // Competitor spy — keep raw OutputCard
    if (activeTab === "competitor" && output) {
      return <OutputCard type="TREND" output={output} isGenerating={isGenerating} error={error} />;
    }

    // Niche parsed output
    if (activeTab === "niche" && parsedData) {
      return <TrendOutput data={parsedData} />;
    }

    // Empty state
    return (
      <Card variant="glass" className="h-full min-h-[520px] flex flex-col items-center justify-center p-8 border-dashed border-glass-border/60">
        <div className="flex flex-col items-center text-center max-w-xs space-y-4">
          <div className="p-4 rounded-2xl bg-surface-100/50 border border-glass-border/30 text-brand-400 shadow-glow-sm">
            <TrendingUp className="h-7 w-7" />
          </div>
          <h4 className="font-extrabold text-text-primary text-sm tracking-wide">Awaiting Niche Input</h4>
          <p className="text-xs text-text-muted leading-relaxed">
            Enter your creator niche and platform to get a complete trend intelligence report with topics, formats, posting times, and content gaps.
          </p>
          <div className="pt-2 flex flex-wrap gap-1.5 justify-center">
            <span className="px-2 py-0.5 rounded-full bg-surface-100 text-[10px] text-text-secondary border border-glass-border/30">📈 5 Trending Topics</span>
            <span className="px-2 py-0.5 rounded-full bg-surface-100 text-[10px] text-text-secondary border border-glass-border/30">🎬 3 Formats</span>
            <span className="px-2 py-0.5 rounded-full bg-surface-100 text-[10px] text-text-secondary border border-glass-border/30">🎯 Content Gaps</span>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      <PageHeader
        title="Trend Intelligence"
        description="Identify current trending topics, formats, and content gaps for your exact niche and platform."
        badge="AI Tools (Pro)"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls */}
        <div className="lg:col-span-5">
          <Card variant="glass">
            <CardContent className="pt-6">
              {/* Tab Selector */}
              <div className="flex gap-2 p-1.5 bg-surface-100/40 border border-glass-border/30 rounded-xl mb-5 select-none">
                <button
                  type="button"
                  onClick={() => handleTabChange("niche")}
                  className={cn(
                    "flex-1 py-2 px-3 text-xs font-extrabold rounded-lg transition-all duration-200 uppercase tracking-wider",
                    activeTab === "niche"
                      ? "bg-brand-500 text-white shadow-glow-sm"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-200/30"
                  )}
                >
                  📈 Niche Trends
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange("competitor")}
                  className={cn(
                    "flex-1 py-2 px-3 text-xs font-extrabold rounded-lg transition-all duration-200 uppercase tracking-wider",
                    activeTab === "competitor"
                      ? "bg-brand-500 text-white shadow-glow-sm"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-200/30"
                  )}
                >
                  🕵️ Competitor Spy
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {activeTab === "niche" ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Your Creator Niche</label>
                    <Input
                      placeholder="e.g. Personal Finance India, Tech Reviews"
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Competitor Handle</label>
                    <Input
                      placeholder="e.g. @techcreator or @financeguru"
                      value={competitorHandle}
                      onChange={(e) => setCompetitorHandle(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Target Platform</label>
                  <Select
                    options={[
                      { value: "YouTube", label: "YouTube" },
                      { value: "Instagram", label: "Instagram" },
                      { value: "TikTok", label: "TikTok" },
                      { value: "LinkedIn", label: "LinkedIn" },
                    ]}
                    value={platform}
                    onChange={setPlatform}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-linear-to-r from-brand-600 to-pink-600"
                  isLoading={isGenerating}
                  leftIcon={!isGenerating && <Sparkles className="h-4.5 w-4.5" />}
                >
                  {activeTab === "niche" ? "Analyze Niche Trends" : "Spy On Competitor"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Output */}
        <div className="lg:col-span-7">
          {renderOutput()}
        </div>
      </div>
    </div>
  );
}
