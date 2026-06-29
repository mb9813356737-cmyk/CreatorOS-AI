"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAIGenerate } from "@/hooks/use-ai-generate";
import { PLATFORMS, TONES } from "@/lib/constants";
import { Sparkles, RefreshCw, Copy, Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Interfaces ──────────────────────────────────────────────
interface ContentVariation {
  variation_number: number;
  angle: string;
  content: string;
}

interface RepurposeData {
  platform: string;
  voice_tone: string;
  repurposed_content: {
    main_post: string;
    hook_line: string;
    cta: string;
  };
  variations: ContentVariation[];
  hashtags: string[];
  best_time_to_post: string;
  engagement_tip: string;
  repurpose_summary: string;
}

// ─── JSON PARSING Helper ──────────────────────────────────────
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

// ─── Main Component ───────────────────────────────────────────
export default function RepurposePage() {
  const { generate, output, isGenerating, error, reset } = useAIGenerate("REPURPOSE");
  const [activeTab, setActiveTab] = React.useState<"text" | "video">("text");
  const [content, setContent] = React.useState("");
  const [youtubeUrl, setYoutubeUrl] = React.useState("");
  const [targetPlatform, setTargetPlatform] = React.useState("YouTube");
  const [tone, setTone] = React.useState("Storytelling");

  const [parsedData, setParsedData] = React.useState<RepurposeData | null>(null);

  // Copied states
  const [copiedMain, setCopiedMain] = React.useState(false);
  const [copiedVar, setCopiedVar] = React.useState<Record<number, boolean>>({});

  const handleCopyText = async (text: string, type: "main" | number) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "main") {
        setCopiedMain(true);
        setTimeout(() => setCopiedMain(false), 2000);
      } else {
        setCopiedVar((prev) => ({ ...prev, [type]: true }));
        setTimeout(() => setCopiedVar((prev) => ({ ...prev, [type]: false })), 2000);
      }
      toast.success("Content copied successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to copy content.");
    }
  };

  // Reset output when switching tabs
  const handleTabChange = (tab: "text" | "video") => {
    setActiveTab(tab);
    setParsedData(null);
    reset();
  };

  React.useEffect(() => {
    if (output) {
      const parsed = parseResponse(output);
      if (parsed) {
        setParsedData(parsed as RepurposeData);
      }
    }
  }, [output]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setParsedData(null);
    if (activeTab === "text") {
      if (!content.trim()) return;
      generate("REPURPOSE", { 
        topic: content.slice(0, 100), 
        sourceContent: content, 
        targetPlatform, 
        tone 
      });
    } else {
      if (!youtubeUrl.trim()) return;
      generate("REPURPOSE", { 
        topic: "YouTube Video Repurpose", 
        youtubeUrl, 
        targetPlatform, 
        tone 
      });
    }
  };

  const renderOutput = () => {
    // 1. LOADING STATE
    if (isGenerating) {
      return (
        <Card variant="glass" className="h-full min-h-[400px] flex items-center justify-center p-6">
          <div className="space-y-4 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-brand-400 mx-auto" />
            <p className="text-sm font-semibold text-text-secondary">
              Repurposing your content for maximum reach...
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
              <Sparkles className="h-7 w-7" />
            </div>
            <h4 className="font-extrabold text-text-primary text-sm tracking-wide">Ready to Repurpose</h4>
            <p className="text-xs text-text-muted leading-relaxed">
              Paste your script draft or drop a video link on the left to extract custom structured captions, threads, and short scripts.
            </p>
          </div>
        </Card>
      );
    }

    // 3. PARSE ERROR DISPLAY
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
        {/* SECTION 1 — TOP BADGES ROW */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap gap-2">
            <Badge variant="default" className="text-xs px-3 py-1 font-bold">
              {parsedData.platform}
            </Badge>
            <Badge variant="secondary" className="text-xs px-3 py-1 font-bold">
              Tone: {parsedData.voice_tone}
            </Badge>
          </div>
          <p className="text-xs text-text-muted italic leading-relaxed">
            {parsedData.repurpose_summary}
          </p>
        </div>

        {/* SECTION 2 — MAIN POST (heading "Repurposed Content") */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-text-primary uppercase tracking-wider">
            Repurposed Content
          </h4>
          <div className="space-y-3">
            {parsedData.repurposed_content?.hook_line && (
              <div className="p-3.5 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-medium italic">
                <span className="font-bold uppercase text-[9px] block text-brand-400 not-italic mb-0.5">Scroll Stop Hook:</span>
                "{parsedData.repurposed_content.hook_line}"
              </div>
            )}

            <Card variant="glass" className="border border-glass-border relative">
              <div className="absolute top-4 right-4 z-10">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCopyText(parsedData.repurposed_content?.main_post || "", "main")}
                  className="h-8 px-2.5 text-xs border border-glass-border bg-surface-50/50 hover:bg-surface-50"
                  leftIcon={copiedMain ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                >
                  {copiedMain ? "Copied!" : "Copy"}
                </Button>
              </div>
              <CardContent className="p-5 pr-20 pt-6 space-y-4">
                <pre className="text-xs text-text-secondary leading-relaxed font-sans whitespace-pre-wrap select-all">
                  {parsedData.repurposed_content?.main_post}
                </pre>
                {parsedData.repurposed_content?.cta && (
                  <div className="pt-3 border-t border-glass-border/20 text-xs font-bold text-brand-400">
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block mb-0.5">Call to Action:</span>
                    {parsedData.repurposed_content.cta}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* SECTION 3 — VARIATIONS (heading "Content Variations") */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-text-primary uppercase tracking-wider">
            Content Variations
          </h4>
          <div className="grid grid-cols-1 gap-3">
            {parsedData.variations?.map((v) => (
              <Card key={v.variation_number} variant="glass" className="border border-glass-border relative">
                <div className="absolute top-4 right-4 z-10">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCopyText(v.content || "", v.variation_number)}
                    className="h-8 px-2.5 text-xs border border-glass-border bg-surface-50/50 hover:bg-surface-50"
                    leftIcon={copiedVar[v.variation_number] ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                  >
                    {copiedVar[v.variation_number] ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <CardContent className="p-5 pr-20 pt-6 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-[9px] px-2 py-0.5 font-bold uppercase">
                      Var {v.variation_number}
                    </Badge>
                    <Badge variant="secondary" className="text-[9px] px-2 py-0.5 font-semibold">
                      Angle: {v.angle}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed select-all whitespace-pre-wrap">
                    {v.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* SECTION 4 — 2 column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Hashtags */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-text-primary uppercase tracking-wider">
              Hashtags
            </h4>
            <div className="flex flex-wrap gap-1.5 p-4 rounded-xl bg-surface-100/10 border border-glass-border/30">
              {parsedData.hashtags?.map((tag, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-[11px] font-semibold text-brand-300">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Posting Strategy */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-text-primary uppercase tracking-wider">
              Posting Strategy
            </h4>
            <div className="p-4 rounded-xl bg-surface-100/10 border border-glass-border/30 space-y-2 text-xs">
              <div>
                <span className="font-bold uppercase text-[9px] block text-text-muted">Best Time to Post:</span>
                <p className="text-text-primary font-bold">{parsedData.best_time_to_post}</p>
              </div>
              <div className="pt-2 border-t border-glass-border/10">
                <span className="font-bold uppercase text-[9px] block text-text-muted">Engagement Tip:</span>
                <p className="text-text-secondary leading-relaxed">{parsedData.engagement_tip}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      <PageHeader
        title="Content Repurposing"
        description="Convert your high-performing scripts or articles into customized social posts native to any format in seconds."
        badge="AI Tools (Agency)"
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
                  onClick={() => handleTabChange("text")}
                  className={cn(
                    "flex-1 py-2 px-3 text-xs font-extrabold rounded-lg transition-all duration-200 uppercase tracking-wider",
                    activeTab === "text"
                      ? "bg-brand-500 text-white shadow-glow-sm"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-200/30"
                  )}
                >
                  📝 Text Input
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange("video")}
                  className={cn(
                    "flex-1 py-2 px-3 text-xs font-extrabold rounded-lg transition-all duration-200 uppercase tracking-wider",
                    activeTab === "video"
                      ? "bg-brand-500 text-white shadow-glow-sm"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-200/30"
                  )}
                >
                  🎥 YouTube Video
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {activeTab === "text" ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Source Content</label>
                    <Textarea
                      placeholder="Paste your script, article, or transcript draft here..."
                      className="min-h-[160px]"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">YouTube Video URL</label>
                    <Input
                      placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      required
                      type="url"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">
                    Target Format/Platform
                  </label>
                  <Select
                    options={[
                      { value: "Twitter/X", label: "Twitter/X", emoji: "🐦" },
                      { value: "Instagram", label: "Instagram", emoji: "📸" },
                      { value: "LinkedIn", label: "LinkedIn", emoji: "💼" },
                      { value: "YouTube", label: "YouTube Description", emoji: "🎥" },
                      { value: "YouTube Shorts", label: "YouTube Shorts Script", emoji: "⏱️" }
                    ]}
                    value={targetPlatform}
                    onChange={setTargetPlatform}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Voice Tone</label>
                  <Select
                    options={[
                      { value: "Storytelling", label: "Storytelling" },
                      { value: "Informative", label: "Informative" },
                      { value: "Motivational", label: "Motivational" },
                      { value: "Shocking", label: "Shocking" },
                      { value: "Humorous", label: "Humorous" },
                      { value: "Controversial", label: "Controversial" },
                      { value: "Inspirational", label: "Inspirational" },
                      { value: "Casual", label: "Casual" }
                    ]}
                    value={tone}
                    onChange={setTone}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-linear-to-r from-brand-600 to-pink-600"
                  isLoading={isGenerating}
                  leftIcon={!isGenerating && <Sparkles className="h-4.5 w-4.5" />}
                >
                  {activeTab === "text" ? "Repurpose Content" : "Extract & Repurpose Video"}
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
