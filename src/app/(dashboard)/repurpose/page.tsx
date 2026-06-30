"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw, Copy, Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Text Repurpose Interfaces ────────────────────────────────
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
  const [content, setContent] = React.useState("");
  const [targetPlatform, setTargetPlatform] = React.useState("Twitter/X");
  const [tone, setTone] = React.useState("Storytelling");

  const [output, setOutput] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

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

  React.useEffect(() => {
    if (output) {
      const parsed = parseResponse(output);
      if (parsed) {
        setParsedData(parsed as RepurposeData);
      }
    }
  }, [output]);

  const generateWithFailover = async (prompt: string) => {
    try {
      const geminiResponse = await fetch("/api/ai/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      
      if (!geminiResponse.ok) throw new Error("Gemini failed");
      
      const geminiData = await geminiResponse.json();
      const geminiText = geminiData.output || geminiData.text || "";
      
      if (!geminiText) throw new Error("Gemini empty response");
      
      return geminiText;
    } catch (geminiError: any) {
      console.log("Gemini failed, falling back to Claude:", geminiError.message);
      
      const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 3000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      
      if (!claudeResponse.ok) {
        const errorData = await claudeResponse.json();
        throw new Error(`Both providers failed. Claude error: ${errorData.error?.message || claudeResponse.status}`);
      }
      
      const claudeData = await claudeResponse.json();
      const claudeText = claudeData.content?.map((i: any) => i.text || "").join("") || "";
      
      return claudeText;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setParsedData(null);
    setError(null);
    setOutput(null);

    const sourceContent = content;
    const voiceTone = tone;

    // Validate inputs before API call
    if (!sourceContent.trim()) {
      setError("Please paste your source content first.");
      return;
    }

    setIsGenerating(true);

    try {
      // Build the prompt string before the API call
      const prompt = `You are an expert content repurposing strategist and viral copywriter.

SOURCE CONTENT: ${sourceContent}
TARGET PLATFORM: ${targetPlatform}
VOICE TONE: ${voiceTone}

Repurpose the source content for the exact target platform and voice tone combination.

Return ONLY a valid JSON object. No preamble, no explanation, no markdown, no backticks.

Return this exact structure:
{
  "platform": "${targetPlatform}",
  "voice_tone": "${voiceTone}",
  "repurposed_content": {
    "main_post": "Primary repurposed content piece fully written out",
    "hook_line": "The opening line that stops the scroll",
    "cta": "Call to action at the end"
  },
  "variations": [
    {
      "variation_number": 1,
      "angle": "Angle name",
      "content": "Full variation content written out completely"
    },
    {
      "variation_number": 2,
      "angle": "Angle name",
      "content": "Full variation content written out completely"
    },
    {
      "variation_number": 3,
      "angle": "Angle name",
      "content": "Full variation content written out completely"
    }
  ],
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
  "best_time_to_post": "e.g. Tuesday to Thursday 7 PM to 9 PM IST",
  "engagement_tip": "One specific tip to maximize engagement on this platform",
  "repurpose_summary": "One sentence explaining what was changed and why it works for this platform"
}`;

      const rawText = await generateWithFailover(prompt);

      setOutput(rawText);
      setParsedData(parseResponse(rawText));
    } catch (error: any) {
      setError(`Generation failed on both providers: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderOutput = () => {
    // LOADING STATE
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

    // Error UI
    if (error) {
      return (
        <Card variant="glass" className="border-error/30 bg-error/5 h-full min-h-[400px] flex flex-col justify-center p-6">
          <div className="flex flex-col items-center text-center max-w-sm mx-auto space-y-4">
            <div className="p-3.5 rounded-2xl bg-error/10 border border-error/20 text-error">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h4 className="font-extrabold text-text-primary text-base">Generation Encountered an Error</h4>
            <p className="text-xs text-text-secondary leading-relaxed">{error}</p>
          </div>
        </Card>
      );
    }

    // Empty state
    if (!output && !parsedData) {
      return (
        <Card variant="glass" className="h-full min-h-[520px] flex flex-col items-center justify-center p-8 border-dashed border-glass-border/60">
          <div className="flex flex-col items-center text-center max-w-xs space-y-4">
            <div className="p-4 rounded-2xl bg-surface-100/50 border border-glass-border/30 text-brand-400 shadow-glow-sm">
              <Sparkles className="h-7 w-7" />
            </div>
            <h4 className="font-extrabold text-text-primary text-sm tracking-wide">Ready to Repurpose</h4>
            <p className="text-xs text-text-muted leading-relaxed">
              Paste your script draft or blog post on the left to extract custom structured captions, threads, and short scripts.
            </p>
          </div>
        </Card>
      );
    }

    // Parse error display
    if (!parsedData) {
      return (
        <div className="p-4 text-xs text-error border border-error/40 rounded-lg">
          <p className="font-bold mb-2">Parse Error — Raw Response:</p>
          <pre className="overflow-auto max-h-40 text-text-muted">{output}</pre>
        </div>
      );
    }

    // SUCCESS STATE DISPLAY (TEXT TAB)
    const textData = parsedData as RepurposeData;
    return (
      <div className="space-y-6">
        {/* SECTION 1 — TOP BADGES */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap gap-2">
            <Badge variant="default" className="text-xs px-3 py-1 font-bold">
              {textData.platform}
            </Badge>
            <Badge variant="secondary" className="text-xs px-3 py-1 font-bold">
              Tone: {textData.voice_tone}
            </Badge>
          </div>
          <p className="text-xs text-text-muted italic leading-relaxed">
            {textData.repurpose_summary}
          </p>
        </div>

        {/* SECTION 2 — MAIN POST (heading "Repurposed Content") */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-text-primary uppercase tracking-wider">
            Repurposed Content
          </h4>
          <div className="space-y-3">
            {textData.repurposed_content?.hook_line && (
              <div className="p-3.5 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-medium italic">
                <span className="font-bold uppercase text-[9px] block text-brand-400 not-italic mb-0.5">Scroll Stop Hook:</span>
                "{textData.repurposed_content.hook_line}"
              </div>
            )}

            <Card variant="glass" className="border border-glass-border relative">
              <div className="absolute top-4 right-4 z-10">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCopyText(textData.repurposed_content?.main_post || "", "main")}
                  className="h-8 px-2.5 text-xs border border-glass-border bg-surface-50/50 hover:bg-surface-50"
                  leftIcon={copiedMain ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                >
                  {copiedMain ? "Copied!" : "Copy"}
                </Button>
              </div>
              <CardContent className="p-5 pr-20 pt-6 space-y-4">
                <pre className="text-xs text-text-secondary leading-relaxed font-sans whitespace-pre-wrap select-all">
                  {textData.repurposed_content?.main_post}
                </pre>
                {textData.repurposed_content?.cta && (
                  <div className="pt-3 border-t border-glass-border/20 text-xs font-bold text-brand-400">
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block mb-0.5">Call to Action:</span>
                    {textData.repurposed_content.cta}
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
            {textData.variations?.map((v) => (
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
              {textData.hashtags?.map((tag, i) => (
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
                <p className="text-text-primary font-bold">{textData.best_time_to_post}</p>
              </div>
              <div className="pt-2 border-t border-glass-border/10">
                <span className="font-bold uppercase text-[9px] block text-text-muted">Engagement Tip:</span>
                <p className="text-text-secondary leading-relaxed">{textData.engagement_tip}</p>
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
              <form onSubmit={handleSubmit} className="space-y-5">
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
                  Repurpose Content
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
