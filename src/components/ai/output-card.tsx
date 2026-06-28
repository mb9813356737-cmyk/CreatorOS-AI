"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CoreSpinLoader } from "@/components/ui/core-spin-loader";
import { 
  Copy, 
  Check, 
  Sparkles, 
  AlertTriangle,
  Flame,
  Clock,
  Video,
  FileImage,
  TrendingUp,
  RefreshCw,
  Play,
  Pause,
  Mic,
  Volume2,
  Scissors,
  Film,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OutputCardProps {
  type: "VIRAL_HOOK" | "CAPTION" | "SCRIPT" | "THUMBNAIL" | "TREND" | "VIRAL_SCORE" | "REPURPOSE" | "TITLE";
  output: string | null;
  isGenerating: boolean;
  error: string | null;
}

function parsePlainTextHooks(text: string) {
  if (!text) return null;
  
  // Try parsing the new simple Hook 1: text format first
  const simpleRegex = /Hook\s+\d+\s*:\s*(.*)/gi;
  const simpleHooks: any[] = [];
  let match;
  
  simpleRegex.lastIndex = 0;
  while ((match = simpleRegex.exec(text)) !== null) {
    const hookVal = match[1].trim();
    if (hookVal) {
      simpleHooks.push({
        hook: hookVal.replace(/^\[|\]$/g, ""),
      });
    }
  }

  if (simpleHooks.length > 0) {
    return simpleHooks;
  }
  
  // Fallback to original complex format split
  const parts = text.split(/HOOK\s+\d+/i);
  const hooks: any[] = [];
  
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    
    const lines = trimmed.split("\n");
    const hookText = lines[0].trim();
    
    const restText = lines.slice(1).join("\n");
    
    const getField = (regex: RegExp) => {
      const match = restText.match(regex);
      return match ? match[1].trim() : "";
    };
    
    const platform = getField(/Platform:\s*(.*)/i);
    const emotion = getField(/Emotion:\s*(.*)/i);
    const scoreVal = getField(/Score:\s*(.*)/i);
    const retentionVal = getField(/Retention:\s*(.*)/i);
    const audience = getField(/Audience:\s*(.*)/i);
    const viralElement = getField(/Viral\s+Element:\s*(.*)/i);
    const whyItWorks = getField(/Why\s+It\s+Works:\s*(.*)/i);
    const contentAngle = getField(/Content\s+Angle:\s*(.*)/i);
    const cta = getField(/CTA:\s*(.*)/i);
    const weakness = getField(/Weakness:\s*(.*)/i);
    
    if (hookText && (platform || emotion || scoreVal)) {
      hooks.push({
        hook: hookText.replace(/^\[|\]$/g, ""),
        platform: platform.replace(/^\[|\]$/g, ""),
        emotion: emotion.replace(/^\[|\]$/g, ""),
        score: scoreVal.replace(/^\[|\]$/g, ""),
        retention: retentionVal.replace(/^\[|\]$/g, ""),
        audience: audience.replace(/^\[|\]$/g, ""),
        viralElement: viralElement.replace(/^\[|\]$/g, ""),
        whyItWorks: whyItWorks.replace(/^\[|\]$/g, ""),
        contentAngle: contentAngle.replace(/^\[|\]$/g, ""),
        cta: cta.replace(/^\[|\]$/g, ""),
        weakness: weakness.replace(/^\[|\]$/g, "")
      });
    }
  }
  
  return hooks.length > 0 ? hooks : null;
}

function parsePlainTextCaption(text: string) {
  if (!text) return null;

  const openingLineMatch = text.match(/Opening\s*Line:\s*\n*([^\n]+(?:\n+(?!\s*Body:)[^\n]+)*)/i);
  const bodyMatch = text.match(/Body:\s*\n*([\s\S]*?)(?=\n*(?:Hashtags:|Call\s*To\s*Action:|$))/i);
  const hashtagsMatch = text.match(/Hashtags:\s*\n*([\s\S]*?)(?=\n*(?:Call\s*To\s*Action:|$))/i);
  const ctaMatch = text.match(/(?:Call\s*To\s*Action|CTA):\s*\n*([^\n]+(?:\n+[^\n]+)*)/i);

  const openingLine = openingLineMatch ? openingLineMatch[1].trim() : "";
  const body = bodyMatch ? bodyMatch[1].trim() : "";
  const cta = ctaMatch ? ctaMatch[1].trim() : "";

  let hashtags: string[] = [];
  if (hashtagsMatch) {
    hashtags = hashtagsMatch[1]
      .split(/\s+/)
      .map((h) => h.trim())
      .filter((h) => h.startsWith("#"));
  }

  // Combine opening line and body for full caption display
  const caption = openingLine ? `${openingLine}\n\n${body}`.trim() : body.trim();

  if (caption || hashtags.length > 0 || cta) {
    return {
      caption,
      hashtags,
      cta,
    };
  }

  return null;
}

function parsePlainTextCaptions(text: string) {
  if (!text) return null;

  const captionBlocks = text.split(/---/);
  const captions: any[] = [];

  for (const block of captionBlocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    const getValue = (key: string) => {
      const regex = new RegExp(`^${key}:\\s*(.*)$`, "im");
      const match = trimmed.match(regex);
      return match ? match[1].trim() : "";
    };

    const captionMatch = trimmed.match(/CAPTION:\s*([\s\S]*?)(?=\n*(?:HASHTAGS:|CTA:|TONE:|PLATFORM:|LANGUAGE:|LENGTH:|WHY\s+IT\s+WORKS:|$))/i);
    const captionVal = captionMatch ? captionMatch[1].trim() : "";

    const hashtagsVal = getValue("HASHTAGS");
    const ctaVal = getValue("CTA");
    const toneVal = getValue("TONE");
    const platformVal = getValue("PLATFORM");
    const languageVal = getValue("LANGUAGE");
    const lengthVal = getValue("LENGTH");
    const whyItWorksVal = getValue("WHY IT WORKS");

    let hashtags: string[] = [];
    if (hashtagsVal) {
      hashtags = hashtagsVal
        .split(/\s+/)
        .map((h) => h.trim())
        .filter((h) => h.startsWith("#"));
    }

    if (captionVal || hashtags.length > 0 || ctaVal) {
      captions.push({
        caption: captionVal,
        hashtags,
        cta: ctaVal,
        tone: toneVal,
        platform: platformVal,
        language: languageVal,
        length: lengthVal,
        why_it_works: whyItWorksVal,
      });
    }
  }

  return captions.length > 0 ? captions : null;
}

export function OutputCard({ type, output, isGenerating, error }: OutputCardProps) {
  const [copied, setCopied] = React.useState(false);
  const [activeCaptionIdx, setActiveCaptionIdx] = React.useState(0);
  const [expandedScenes, setExpandedScenes] = React.useState<Record<number, boolean>>({});
  const [ttsState, setTtsState] = React.useState<"none" | "generating" | "ready">("none");
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [audioDuration, setAudioDuration] = React.useState(30);
  const [playbackRate, setPlaybackRate] = React.useState(1);
  const [voiceGender, setVoiceGender] = React.useState<"male" | "female">("male");
  const audioRef = React.useRef<HTMLAudioElement>(null);

  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Reset TTS state when output changes (new script generated)
  React.useEffect(() => {
    setTtsState("none");
    setIsPlaying(false);
    setCurrentTime(0);
    setActiveCaptionIdx(0);
    setExpandedScenes({});
  }, [output]);

  const handleTtsGenerate = () => {
    setTtsState("generating");
    setTimeout(() => {
      setTtsState("ready");
    }, 2500);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Audio play failed:", err);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const getCleanJSONOutput = (text: string) => {
    if (!text) return null;
    try {
      return JSON.parse(text.trim());
    } catch {
      try {
        const match = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
        if (match) {
          return JSON.parse(match[0].trim());
        }
      } catch {
        // Ignore
      }
    }
    return null;
  };

  if (isGenerating && type !== "CAPTION" && type !== "SCRIPT") {
    return (
      <Card variant="glass" className="h-full min-h-[300px] flex items-center justify-center p-6">
        <CoreSpinLoader />
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="glass" className="border-error/40 bg-error/5 h-full flex flex-col justify-center py-10 px-6">
        <div className="flex flex-col items-center text-center max-w-sm mx-auto space-y-3">
          <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-error">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h4 className="font-bold text-text-primary text-sm">Generation Encountered an Error</h4>
          <p className="text-xs text-text-secondary leading-relaxed">{error}</p>
        </div>
      </Card>
    );
  }

  if (isGenerating && type === "CAPTION") {
    return (
      <Card variant="glass" className="h-full min-h-[400px] flex items-center justify-center p-6">
        <div className="space-y-4 text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-brand-400 mx-auto" />
          <p className="text-sm font-semibold text-text-secondary">
            Crafting your captions for maximum engagement...
          </p>
        </div>
      </Card>
    );
  }

  if (isGenerating && type === "SCRIPT") {
    return (
      <Card variant="glass" className="h-full min-h-[400px] flex items-center justify-center p-6">
        <div className="space-y-4 text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-brand-400 mx-auto" />
          <p className="text-sm font-semibold text-text-secondary">
            Writing your cinema-grade script...
          </p>
        </div>
      </Card>
    );
  }

  if (!output) {
    return (
      <Card variant="glass" className="h-full min-h-[300px] flex flex-col items-center justify-center p-6 border-dashed border-glass-border/60">
        <div className="flex flex-col items-center text-center max-w-xs space-y-3">
          <div className="p-3.5 rounded-2xl bg-surface-100/50 border border-glass-border/30 text-text-muted">
            <Sparkles className="h-6 w-6" />
          </div>
          <h4 className="font-semibold text-text-secondary text-sm">Awaiting Generation Input</h4>
          <p className="text-xs text-text-muted leading-relaxed">Fill out the parameters on the left and click generate to begin creating premium content.</p>
        </div>
      </Card>
    );
  }

  let parsed = getCleanJSONOutput(output) || parsePlainTextCaptions(output || "") || parsePlainTextCaption(output || "");

  // 1. Detect and normalize Caption Generator format
  if (parsed && (parsed.content_type === "caption" || parsed.generator === "caption_generator")) {
    const data = parsed.output || parsed;
    parsed = {
      content_type: "caption",
      caption: data.caption || `${data.opening_line || ""}\n\n${data.body || ""}`.trim(),
      hashtags: data.hashtags || [],
      cta: data.cta || data.call_to_action || "",
    };
  }
  // 2. Detect and normalize Script Generator format
  else if (parsed && (parsed.content_type === "script" || parsed.generator === "script_generator" || Array.isArray(parsed.scenes))) {
    const data = parsed.output || parsed;
    parsed = {
      content_type: "script",
      title: data.title || "",
      duration: data.duration || "",
      language: data.language || "",
      sections: data.scenes || data.sections || [],
      tips: data.tips || [],
      hashtags: data.hashtags || [],
    };
  }
  // 3. Detect and normalize Hooks Generator format
  else if (parsed && (parsed.content_type === "hooks" || parsed.generator === "hooks_generator")) {
    const data = parsed.output || parsed;
    parsed = {
      content_type: "hooks",
      hooks: Array.isArray(data) ? data : data.hooks || [],
    };
  }
  // 4. Detect and normalize Title Generator format
  else if (parsed && (parsed.content_type === "title" || parsed.generator === "title_generator")) {
    const data = parsed.output || parsed;
    parsed = {
      content_type: "title",
      titles: Array.isArray(data) ? data : data.titles || [],
    };
  }

  // Determine effective rendering type based on parsed content_type or structure
  let effectiveType = type;
  if (parsed) {
    if (parsed.content_type === "caption" || (Array.isArray(parsed) && parsed[0]?.caption)) effectiveType = "CAPTION";
    else if (parsed.content_type === "script" || Array.isArray(parsed.sections) || Array.isArray(parsed.scenes)) effectiveType = "SCRIPT";
    else if (parsed.content_type === "hooks") effectiveType = "VIRAL_HOOK";
    else if (parsed.content_type === "title") effectiveType = "TITLE";
    else if (parsed.content_type === "repurpose" || Array.isArray(parsed.repurposed) || Array.isArray(parsed.shorts)) effectiveType = "REPURPOSE";
  }

  // ─── VIRAL_HOOK RENDERING ────────────────────────────────
  const rawList = (parsed && (Array.isArray(parsed) ? parsed : Array.isArray(parsed.hooks) ? parsed.hooks : null))
    || parsePlainTextHooks(output || "");

  const hooksList = rawList?.map((item: any) => ({
    hook: item.hook || item.text || "",
    score: item.score || item.viral_score || "",
    emotion: item.emotion || "",
    language: item.language || "English",
    platform: item.platform || item.platform_fit || "",
    retention: item.retention || item.retention_score || "",
    audience: item.audience || item.target_audience || "",
    viralElement: item.viralElement || item.viral_element || "",
    whyItWorks: item.whyItWorks || item.why_it_works || "",
    contentAngle: item.contentAngle || item.content_angle || "",
    cta: item.cta || item.cta_suggestion || "",
    weakness: item.weakness || "",
  }));

  // ─── TITLE RENDERING ────────────────────────────────────
  if (effectiveType === "TITLE" && parsed && Array.isArray(parsed.titles)) {
    return (
      <Card variant="glass" className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b border-glass-border/20 py-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-brand-400" />
            Suggested Titles
          </CardTitle>
          <Button variant="secondary" size="sm" onClick={handleCopy} leftIcon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}>
            {copied ? "Copied All" : "Copy All"}
          </Button>
        </CardHeader>
        <CardContent className="p-5 flex-1 overflow-y-auto space-y-3.5">
          {parsed.titles.map((title: string, idx: number) => (
            <div key={idx} className="p-4 rounded-xl bg-surface-100/40 border border-glass-border/40 hover:border-brand-500/30 transition-all select-all flex justify-between items-center gap-3">
              <span className="text-sm font-semibold text-text-primary leading-snug">{title}</span>
              <Badge variant="gradient" className="text-[10px] shrink-0 font-bold">#{idx + 1}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (effectiveType === "VIRAL_HOOK" && hooksList) {
    return (
      <Card variant="glass" className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b border-glass-border/20 py-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Flame className="h-4.5 w-4.5 text-brand-400" />
            Scroll-Stopping Hooks
          </CardTitle>
          <Button variant="secondary" size="sm" onClick={handleCopy} leftIcon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}>
            {copied ? "Copied" : "Copy Hooks"}
          </Button>
        </CardHeader>
        <CardContent className="p-5 flex-1 overflow-y-auto space-y-4">
          {hooksList.map((item: any, idx: number) => (
            <div key={idx} className="p-4 rounded-xl bg-surface-100/40 border border-glass-border/40 hover:border-brand-500/30 transition-all space-y-3 select-all">
              <div className="flex justify-between items-start gap-3">
                <p className="text-sm font-semibold text-text-primary leading-snug">{item.hook}</p>
                {item.score && (
                  <Badge variant="gradient" className="text-[10px] shrink-0 font-bold">
                    Score: {item.score}
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 text-[10px] text-text-muted font-bold uppercase select-none">
                {item.platform && <span className="bg-surface-200 px-2 py-0.5 rounded-sm">{item.platform}</span>}
                {item.emotion && <span className="bg-surface-200 px-2 py-0.5 rounded-sm">{item.emotion}</span>}
                {item.language && <span className="bg-surface-200 px-2 py-0.5 rounded-sm">{item.language}</span>}
                {item.retention && <span className="bg-surface-200 px-2 py-0.5 rounded-sm">Retention: {item.retention}</span>}
              </div>

              {/* Detailed metrics grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] leading-relaxed border-t border-glass-border/10 pt-2.5">
                {item.audience && (
                  <div>
                    <span className="font-extrabold text-brand-400 block uppercase text-[8px] select-none mb-0.5">Audience Persona</span>
                    <span className="text-text-secondary">{item.audience}</span>
                  </div>
                )}
                {item.viralElement && (
                  <div>
                    <span className="font-extrabold text-brand-400 block uppercase text-[8px] select-none mb-0.5">Viral Trigger</span>
                    <span className="text-text-secondary">{item.viralElement}</span>
                  </div>
                )}
                {item.whyItWorks && (
                  <div className="sm:col-span-2">
                    <span className="font-extrabold text-brand-400 block uppercase text-[8px] select-none mb-0.5">Psychological Trigger</span>
                    <p className="text-text-secondary">{item.whyItWorks}</p>
                  </div>
                )}
                {item.contentAngle && (
                  <div className="sm:col-span-2">
                    <span className="font-extrabold text-brand-400 block uppercase text-[8px] select-none mb-0.5">Content Angle</span>
                    <span className="text-text-secondary">{item.contentAngle}</span>
                  </div>
                )}
                {item.cta && (
                  <div>
                    <span className="font-extrabold text-emerald-400 block uppercase text-[8px] select-none mb-0.5">Suggested CTA</span>
                    <span className="text-text-secondary">{item.cta}</span>
                  </div>
                )}
                {item.weakness && (
                  <div>
                    <span className="font-extrabold text-pink-400 block uppercase text-[8px] select-none mb-0.5">Risk Factor</span>
                    <span className="text-text-secondary">{item.weakness}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // ─── CAPTION RENDERING ──────────────────────────────────
  const captionsList = Array.isArray(parsed) ? parsed : (parsed && parsed.caption ? [parsed] : null);

  if (effectiveType === "CAPTION" && captionsList && captionsList.length > 0) {
    const activeCaption = captionsList[activeCaptionIdx] || captionsList[0];

    const handleCopyCaption = async () => {
      const hashtagsStr = activeCaption.hashtags?.length > 0 ? `\n\n${activeCaption.hashtags.join(" ")}` : "";
      const ctaStr = activeCaption.cta ? `\n\n${activeCaption.cta}` : "";
      const textToCopy = `${activeCaption.caption}${hashtagsStr}${ctaStr}`;
      try {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error(err);
      }
    };

    return (
      <Card variant="glass" className="h-full flex flex-col">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-glass-border/20 py-4 gap-3 shrink-0">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-brand-400" />
            <span>Generated Captions ({captionsList.length} Options)</span>
          </CardTitle>
          <Button variant="secondary" size="sm" onClick={handleCopyCaption} leftIcon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}>
            {copied ? "Copied Option" : "Copy Selected"}
          </Button>
        </CardHeader>
        <CardContent className="p-5 flex-1 overflow-y-auto space-y-5">
          {captionsList.length > 1 && (
            <div className="flex flex-wrap gap-1.5 p-1 bg-surface-100/40 border border-glass-border/30 rounded-xl select-none">
              {captionsList.map((_, idx: number) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveCaptionIdx(idx);
                    setCopied(false);
                  }}
                  className={cn(
                    "flex-1 py-1.5 px-2.5 text-xs font-extrabold rounded-lg transition-all duration-200 uppercase tracking-wider",
                    activeCaptionIdx === idx
                      ? "bg-brand-500 text-white shadow-glow-sm"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-200/50"
                  )}
                >
                  Option {idx + 1}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-surface-100/40 border border-glass-border/40 select-all">
              <p className="whitespace-pre-line text-sm leading-relaxed text-text-primary">{activeCaption.caption}</p>
            </div>

            {activeCaption.hashtags?.length > 0 && (
              <div className="space-y-1.5 select-none">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Hashtags</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeCaption.hashtags.map((hash: string, idx: number) => (
                    <Badge key={idx} variant="default" className="text-xs">
                      {hash}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {activeCaption.cta && (
              <div className="p-3.5 rounded-lg bg-brand-500/10 border border-brand-500/30 text-xs">
                <span className="font-extrabold text-brand-400 block mb-0.5">Call to Action (CTA)</span>
                <span className="text-text-secondary">{activeCaption.cta}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2 text-[10px] text-text-muted font-bold uppercase select-none pt-1">
              {activeCaption.platform && <span className="bg-surface-200 px-2 py-0.5 rounded-sm">{activeCaption.platform}</span>}
              {activeCaption.tone && <span className="bg-surface-200 px-2 py-0.5 rounded-sm">{activeCaption.tone}</span>}
              {activeCaption.language && <span className="bg-surface-200 px-2 py-0.5 rounded-sm">{activeCaption.language}</span>}
              {activeCaption.length && <span className="bg-surface-200 px-2 py-0.5 rounded-sm">Length: {activeCaption.length}</span>}
            </div>

            {activeCaption.why_it_works && (
              <div className="p-3 rounded-lg bg-surface-50/40 border border-glass-border/20 text-xs italic text-text-muted leading-relaxed select-none">
                💡 {activeCaption.why_it_works}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // ─── SCRIPT RENDERING ───────────────────────────────────
  if (effectiveType === "SCRIPT" && parsed && (Array.isArray(parsed.sections) || Array.isArray(parsed.scenes))) {
    const titleVal = parsed.title || "Ready-to-Film Script";
    const durationVal = parsed.duration || "";
    const platformVal = parsed.platform || "";
    const languageVal = parsed.language || "";
    const hookLineVal = parsed.hook_line || "";
    const ctaVal = parsed.cta || "";
    const contentTipVal = parsed.content_tip || "";
    const fullScriptVal = parsed.full_script || "";

    const scenesList = parsed.scenes || parsed.sections || [];

    const handleCopyScript = async () => {
      let text = `TITLE: ${titleVal}\nDURATION: ${durationVal}\nPLATFORM: ${platformVal}\nLANGUAGE: ${languageVal}\n\n`;
      if (hookLineVal) text += `HOOK LINE: ${hookLineVal}\n\n`;

      text += "SCENES:\n";
      scenesList.forEach((scene: any) => {
        const scTime = scene.timestamp || "";
        const scType = scene.type || scene.label || "";
        const scScript = scene.script || scene.dialogue || "";
        const scVisual = scene.visual || scene.visual_cue || "";
        const scCamera = scene.camera || scene.camera_direction || "";
        const scAudio = scene.audio || scene.audio_cue || "";
        const scTransition = scene.transition || scene.transition_to_next || "";
        const scOverlay = scene.text_overlay || "";
        const scRetention = scene.why_this_keeps_viewers || scene.retention_note || "";

        text += `[${scType}] (${scTime})\nDialogue: "${scScript}"\nVisual: ${scVisual}\nCamera: ${scCamera}\nAudio: ${scAudio}\nTransition: ${scTransition}\nOverlay: ${scOverlay}\nRetention: ${scRetention}\n\n`;
      });

      if (fullScriptVal) text += `FULL SCRIPT:\n${fullScriptVal}\n\n`;
      if (ctaVal) text += `CTA: ${ctaVal}\n`;
      if (contentTipVal) text += `CONTENT TIP: ${contentTipVal}\n`;

      try {
        await navigator.clipboard.writeText(text.trim());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error(err);
      }
    };

    return (
      <Card variant="glass" className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b border-glass-border/20 py-4 shrink-0">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Video className="h-4.5 w-4.5 text-brand-400" />
            <span>Ready-to-Film Script</span>
          </CardTitle>
          <Button variant="secondary" size="sm" onClick={handleCopyScript} leftIcon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}>
            {copied ? "Copied" : "Copy Script"}
          </Button>
        </CardHeader>
        <CardContent className="p-5 flex-1 overflow-y-auto space-y-5 select-all">
          {/* Top Badges Row */}
          <div className="flex flex-wrap gap-2 select-none">
            {durationVal && (
              <Badge variant="default" className="text-xs">
                ⏱️ {durationVal}
              </Badge>
            )}
            {platformVal && (
              <Badge variant="gradient" className="text-xs">
                📱 {platformVal}
              </Badge>
            )}
            {languageVal && (
              <Badge variant="outline" className="text-xs uppercase">
                🌐 {languageVal}
              </Badge>
            )}
          </div>

          {/* Title */}
          {titleVal && (
            <h2 className="text-xl font-extrabold text-text-primary tracking-tight">{titleVal}</h2>
          )}

          {/* Expand / Collapse All buttons */}
          <div className="flex items-center gap-2 select-none shrink-0 border-b border-glass-border/10 pb-3">
            <button
              onClick={() => {
                const newStates: Record<number, boolean> = {};
                scenesList.forEach((_: any, idx: number) => {
                  newStates[idx] = true;
                });
                setExpandedScenes(newStates);
              }}
              className="text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors"
            >
              Expand All
            </button>
            <span className="text-text-muted text-xs">/</span>
            <button
              onClick={() => {
                setExpandedScenes({});
              }}
              className="text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors"
            >
              Collapse All
            </button>
          </div>

          {/* Collapsible Scenes List */}
          <div className="space-y-3.5">
            {scenesList.map((scene: any, idx: number) => {
              const scTime = scene.timestamp || "";
              const scType = scene.type || scene.label || "Scene";
              const scScript = scene.dialogue || scene.script || "";
              const scCamera = scene.camera || scene.camera_direction || "";
              const scTransition = scene.transition || scene.transition_to_next || "";
              const scVisual = scene.visual || scene.visual_cue || "";
              const scAudio = scene.audio || scene.audio_cue || "";
              const scOverlay = scene.text_overlay || "";
              const scCaption = scene.caption || "";
              const scRetention = scene.why_this_keeps_viewers || scene.retention_note || "";

              const isExpanded = !!expandedScenes[idx];

              const toggleScene = () => {
                setExpandedScenes(prev => ({
                  ...prev,
                  [idx]: !prev[idx]
                }));
              };

              const handleCopyDialogue = async (e: React.MouseEvent) => {
                e.stopPropagation();
                try {
                  await navigator.clipboard.writeText(scScript);
                } catch (err) {
                  console.error(err);
                }
              };

              return (
                <div key={idx} className="border border-glass-border/30 rounded-xl overflow-hidden bg-surface-50/10 transition-colors">
                  {/* Header */}
                  <button
                    onClick={toggleScene}
                    className="w-full flex items-center justify-between p-4 bg-surface-100/30 hover:bg-surface-200/20 transition-all select-none text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Play className="h-3.5 w-3.5 text-brand-400 fill-current" />
                      {scTime && <span className="text-xs font-bold font-mono text-brand-400">{scTime}</span>}
                      {scType && (
                        <Badge variant="outline" className="text-[10px] px-2 py-0.5 uppercase tracking-wide">
                          {scType}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-text-muted font-bold">
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-4 border-t border-glass-border/20 space-y-4">
                      {/* Dialogue Box */}
                      {scScript && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between select-none">
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                              <Mic className="h-3.5 w-3.5 text-brand-400" /> Dialogue
                            </span>
                            <button
                              onClick={handleCopyDialogue}
                              className="text-[10px] font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1"
                            >
                              <Copy className="h-3 w-3" /> Copy Dialogue
                            </button>
                          </div>
                          <div className="p-3 rounded-lg bg-surface-100/40 border border-glass-border/30 select-all">
                            <p className="text-sm font-medium text-text-primary leading-relaxed">
                              {scScript}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* 2-column Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-text-secondary select-none">
                        {/* CAMERA | TRANSITION */}
                        {scCamera && (
                          <div className="bg-surface-100/20 p-3 rounded-lg border border-glass-border/20">
                            <span className="font-extrabold text-brand-400 block uppercase text-[8px] tracking-wider mb-1">Camera</span>
                            <span className="text-text-primary font-medium">{scCamera}</span>
                          </div>
                        )}
                        {scTransition && (
                          <div className="bg-surface-100/20 p-3 rounded-lg border border-glass-border/20">
                            <span className="font-extrabold text-amber-400 block uppercase text-[8px] tracking-wider mb-1">Transition</span>
                            <span className="text-text-primary font-medium">{scTransition}</span>
                          </div>
                        )}

                        {/* VISUAL | AUDIO */}
                        {scVisual && (
                          <div className="bg-surface-100/20 p-3 rounded-lg border border-glass-border/20">
                            <span className="font-extrabold text-indigo-400 block uppercase text-[8px] tracking-wider mb-1">Visual</span>
                            <span className="text-text-primary font-medium">{scVisual}</span>
                          </div>
                        )}
                        {scAudio && (
                          <div className="bg-surface-100/20 p-3 rounded-lg border border-glass-border/20">
                            <span className="font-extrabold text-pink-400 block uppercase text-[8px] tracking-wider mb-1">Audio</span>
                            <span className="text-text-primary font-medium">{scAudio}</span>
                          </div>
                        )}

                        {/* TEXT OVERLAY | CAPTION */}
                        {scOverlay && (
                          <div className="bg-surface-100/20 p-3 rounded-lg border border-glass-border/20">
                            <span className="font-extrabold text-teal-400 block uppercase text-[8px] tracking-wider mb-1">Text Overlay</span>
                            <span className="text-text-primary font-medium">{scOverlay}</span>
                          </div>
                        )}
                        {scCaption && (
                          <div className="bg-surface-100/20 p-3 rounded-lg border border-glass-border/20">
                            <span className="font-extrabold text-blue-400 block uppercase text-[8px] tracking-wider mb-1">Caption</span>
                            <span className="text-text-primary font-medium">{scCaption}</span>
                          </div>
                        )}
                      </div>

                      {/* Full Width: WHY THIS KEEPS VIEWERS */}
                      {scRetention && (
                        <div className="p-3.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs">
                          <span className="font-extrabold text-emerald-400 block mb-0.5 uppercase tracking-wider text-[9px]">Why This Keeps Viewers</span>
                          <span className="text-text-secondary font-medium leading-relaxed">{scRetention}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Section */}
          <div className="space-y-4 pt-4 border-t border-glass-border/20">
            {/* Hook Line */}
            {hookLineVal && (
              <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/30 text-sm">
                <span className="font-extrabold text-brand-400 block mb-1 text-[10px] uppercase tracking-wider select-none">Hook Line</span>
                <p className="text-text-primary font-medium italic">&ldquo;{hookLineVal}&rdquo;</p>
              </div>
            )}

            {/* CTA */}
            {ctaVal && (
              <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs">
                <span className="font-extrabold text-emerald-400 block mb-0.5 select-none uppercase tracking-wider text-[9px]">Call to Action</span>
                <span className="text-text-secondary font-medium">{ctaVal}</span>
              </div>
            )}

            {/* Content Tip */}
            {contentTipVal && (
              <div className="p-3 rounded-lg bg-surface-50/40 border border-glass-border/20 text-xs leading-relaxed italic text-text-muted select-none">
                💡 <span className="font-bold text-text-secondary not-italic uppercase tracking-wide text-[9px] mr-1">Filming/Editing Tip:</span>
                {contentTipVal}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // ─── THUMBNAIL RENDERING ────────────────────────────────
  const promptsList = parsed && (Array.isArray(parsed.prompts) ? parsed.prompts : (parsed.prompt ? [parsed] : null));

  if (effectiveType === "THUMBNAIL" && promptsList) {
    return (
      <Card variant="glass" className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b border-glass-border/20 py-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <FileImage className="h-4.5 w-4.5 text-brand-400" />
            Midjourney & DALL-E prompts
          </CardTitle>
          <Button variant="secondary" size="sm" onClick={handleCopy} leftIcon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}>
            {copied ? "Copied" : "Copy All"}
          </Button>
        </CardHeader>
        <CardContent className="p-5 flex-1 overflow-y-auto space-y-6 select-all">
          <div className="space-y-4">
            {promptsList.map((item: any, idx: number) => (
              <div key={idx} className="p-4 rounded-xl bg-surface-100/40 border border-glass-border/40 space-y-3 hover:border-brand-500/35 transition-colors">
                <div className="flex justify-between items-center select-none">
                  <Badge variant="gradient" className="uppercase tracking-wider text-[9px] font-bold">
                    {item.variant || "Default"} Prompt
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleCopy()}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                
                <p className="text-xs font-mono text-text-secondary leading-relaxed bg-surface-100 p-3 rounded-lg border border-glass-border/20 select-all select-all">
                  {item.prompt}
                </p>

                <div className="grid grid-cols-2 gap-2.5 text-[10px] text-text-secondary leading-relaxed select-none">
                  <div>
                    <span className="font-extrabold text-brand-400 block uppercase text-[8px] mb-0.5">Text overlay</span>
                    {item.text_overlay || "—"}
                  </div>
                  <div>
                    <span className="font-extrabold text-brand-400 block uppercase text-[8px] mb-0.5">Color theme</span>
                    {item.colors || item.color_psychology?.palette || "—"}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {Array.isArray(parsed.tips) && parsed.tips.length > 0 && (
            <div className="pt-4 border-t border-glass-border/20 space-y-2 select-none">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">CTR Design Guidelines</span>
              <div className="space-y-1.5">
                {parsed.tips.map((tip: string, idx: number) => (
                  <p key={idx} className="text-xs text-text-secondary">&bull; {tip}</p>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // ─── TREND RENDERING ────────────────────────────────────
  if (effectiveType === "TREND" && parsed) {
    if (parsed.competitor) {
      return <CompetitorSpyView parsed={parsed} handleCopy={handleCopy} copied={copied} />;
    }
    const trendsList = Array.isArray(parsed.current_trends) ? parsed.current_trends : Array.isArray(parsed.trends) ? parsed.trends : Array.isArray(parsed) ? parsed : null;
    if (trendsList) {
      return (
        <Card variant="glass" className="h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between border-b border-glass-border/20 py-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-brand-400" />
              Trending Topics Niche Report
            </CardTitle>
            <Button variant="secondary" size="sm" onClick={handleCopy} leftIcon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}>
              {copied ? "Copied" : "Copy Report"}
            </Button>
          </CardHeader>
        <CardContent className="p-5 flex-1 overflow-y-auto space-y-6">
          <div className="space-y-4">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider block select-none">Active Trends</span>
            <div className="grid grid-cols-1 gap-3.5">
              {trendsList.map((item: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-surface-100/40 border border-glass-border/40 space-y-2 select-all">
                  <div className="flex justify-between items-start gap-2 select-none">
                    <h5 className="font-bold text-text-primary text-sm">{item.topic}</h5>
                    <Badge variant="gradient" className="text-[10px] shrink-0">Relevance: {item.relevance_score}/100</Badge>
                  </div>
                  
                  <div className="space-y-1.5">
                    <span className="font-bold text-text-muted uppercase text-[9px] block select-none">Suggested content angles</span>
                    <p className="text-xs text-text-secondary leading-relaxed">{item.content_ideas}</p>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-brand-400 font-semibold select-none pt-1">
                    <Clock className="h-3.5 w-3.5 text-text-muted" />
                    <span>Peak posting: {item.peak_timing}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {Array.isArray(parsed.insights) && parsed.insights.length > 0 && (
            <div className="pt-4 border-t border-glass-border/20 space-y-2 select-none">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">Competitive Insights</span>
              <div className="space-y-1.5">
                {parsed.insights.map((insight: string, idx: number) => (
                  <p key={idx} className="text-xs text-text-secondary">&bull; {insight}</p>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      );
    }
  }

  // ─── REPURPOSE RENDERING ─────────────────────────────────
  if (effectiveType === "REPURPOSE" && parsed) {
    if (Array.isArray(parsed.shorts)) {
      return <VideoRepurposeView parsed={parsed} handleCopy={handleCopy} copied={copied} />;
    }
    if (Array.isArray(parsed.repurposed)) {
      return <TextRepurposeView parsed={parsed} handleCopy={handleCopy} copied={copied} />;
    }
  }

  // ─── DEFAULT TEXT FALLBACK RENDERING ────────────────────
  return (
    <Card variant="glass" className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between border-b border-glass-border/20 py-4">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Sparkles className="h-4.5 w-4.5 text-brand-400" />
          AI Output Result
        </CardTitle>
        <Button variant="secondary" size="sm" onClick={handleCopy} leftIcon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}>
          {copied ? "Copied" : "Copy Output"}
        </Button>
      </CardHeader>
      <CardContent className="p-5 flex-1 overflow-y-auto select-all">
        <p className="whitespace-pre-line text-sm leading-relaxed text-text-primary">
          {output}
        </p>
      </CardContent>
    </Card>
  );
}

function VideoRepurposeView({ parsed, handleCopy, copied }: { parsed: any; handleCopy: () => void; copied: boolean }) {
  const [activeShortIdx, setActiveShortIdx] = React.useState(0);
  const activeShort = parsed.shorts?.[activeShortIdx] || parsed.shorts?.[0];

  if (!activeShort) return null;

  return (
    <Card variant="glass" className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between border-b border-glass-border/20 py-4 shrink-0">
        <CardTitle className="text-sm font-bold flex items-center gap-2 truncate max-w-[70%]">
          <Video className="h-4.5 w-4.5 text-brand-400" />
          <span className="truncate">Repurpose: {parsed.original_video?.title || "Video"}</span>
        </CardTitle>
        <Button variant="secondary" size="sm" onClick={handleCopy} leftIcon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}>
          {copied ? "Copied" : "Copy JSON"}
        </Button>
      </CardHeader>
      <CardContent className="p-5 flex-1 overflow-y-auto space-y-5">
        {/* Shorts selection tabs */}
        <div className="flex gap-2 p-1.5 bg-surface-100/40 border border-glass-border/30 rounded-xl select-none">
          {parsed.shorts.map((short: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setActiveShortIdx(idx)}
              className={cn(
                "flex-1 py-2 px-3 text-xs font-extrabold rounded-lg transition-all duration-200 uppercase tracking-wider",
                activeShortIdx === idx
                  ? "bg-brand-500 text-white shadow-glow-sm"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-200/50"
              )}
            >
              Short {short.id || idx + 1}
            </button>
          ))}
        </div>

        {/* Selected Short Metadata */}
        <div className="p-4 rounded-xl bg-surface-50/30 border border-glass-border/40 space-y-3 select-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h5 className="font-extrabold text-sm text-text-primary">{activeShort.title}</h5>
            <span className="text-[10px] font-bold font-mono text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-md border border-brand-500/20 whitespace-nowrap align-middle">
              ⏱️ {activeShort.timestamp_range}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-[10px] font-bold text-text-secondary bg-surface-200 px-2.5 py-0.5 rounded-sm">
              🔥 HOOK STRENGTH: {activeShort.hook_strength}/100
            </span>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-sm border border-emerald-500/20">
              📈 ESTIMATED CTR: {activeShort.estimated_ctr}
            </span>
          </div>
        </div>

        {/* Script Scenes list */}
        <div className="space-y-4">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider block select-none">Timeline Scenes</span>
          <div className="relative border-l border-glass-border/30 pl-4.5 ml-2 space-y-5 select-all">
            {activeShort.scenes?.map((scene: any, sIdx: number) => (
              <div key={sIdx} className="relative">
                {/* Visual marker */}
                <div className="absolute -left-[27px] top-1.5 h-3.5 w-3.5 rounded-full bg-brand-500 border-2 border-surface-0 shadow-glow-sm" />
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 select-none">
                    <span className="text-xs font-bold font-mono text-brand-400">{scene.timestamp}</span>
                    {scene.text_overlay && (
                      <span className="text-[9px] font-bold font-mono uppercase bg-pink-500/10 text-pink-400 px-2 py-0.5 rounded border border-pink-500/20">
                        Overlay: {scene.text_overlay}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs font-medium text-text-primary leading-relaxed">
                    &ldquo;{scene.dialogue}&rdquo;
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-text-secondary select-none">
                    {scene.visual_cue && (
                      <div className="bg-surface-100 p-2 rounded border border-glass-border/20">
                        <span className="font-extrabold text-brand-400 block uppercase text-[8px] mb-0.5">Visual cue</span>
                        {scene.visual_cue}
                      </div>
                    )}
                    {scene.audio_cue && (
                      <div className="bg-surface-100 p-2 rounded border border-glass-border/20">
                        <span className="font-extrabold text-pink-400 block uppercase text-[8px] mb-0.5">Audio cue</span>
                        {scene.audio_cue}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        {Array.isArray(activeShort.tips) && activeShort.tips.length > 0 && (
          <div className="pt-4 border-t border-glass-border/20 space-y-2 select-none">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">Editing Recommendations</span>
            <div className="space-y-1.5">
              {activeShort.tips.map((tip: string, tIdx: number) => (
                <p key={tIdx} className="text-xs text-text-secondary leading-relaxed flex items-start gap-1.5">
                  <span className="text-brand-400 mt-0.5">•</span>
                  <span>{tip}</span>
                </p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TextRepurposeView({ parsed, handleCopy, copied }: { parsed: any; handleCopy: () => void; copied: boolean }) {
  return (
    <Card variant="glass" className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between border-b border-glass-border/20 py-4 shrink-0">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Sparkles className="h-4.5 w-4.5 text-brand-400" />
          <span>Repurposed Formats</span>
        </CardTitle>
        <Button variant="secondary" size="sm" onClick={handleCopy} leftIcon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}>
          {copied ? "Copied" : "Copy JSON"}
        </Button>
      </CardHeader>
      <CardContent className="p-5 flex-1 overflow-y-auto space-y-5">
        {parsed.original_analysis && (
          <div className="p-4 rounded-xl bg-surface-100/40 border border-glass-border/30 text-xs">
            <span className="font-extrabold text-[10px] text-text-muted uppercase tracking-wider block mb-1">Source Context Analysis</span>
            <p className="text-text-secondary leading-relaxed">{parsed.original_analysis}</p>
          </div>
        )}

        <div className="space-y-4">
          {parsed.repurposed?.map((item: any, idx: number) => (
            <div key={idx} className="p-4 rounded-xl bg-surface-100/30 border border-glass-border/40 space-y-3">
              <div className="flex justify-between items-center select-none">
                <Badge variant="gradient" className="uppercase tracking-wider text-[9px] font-bold">
                  {item.platform} • {item.format}
                </Badge>
                {item.posting_time && (
                  <span className="text-[10px] font-bold text-text-muted flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {item.posting_time}
                  </span>
                )}
              </div>
              <p className="whitespace-pre-line text-xs leading-relaxed text-text-primary bg-surface-100 p-3 rounded-lg border border-glass-border/20 select-all">
                {item.content}
              </p>
              {item.tips && (
                <p className="text-[10px] text-text-secondary leading-relaxed">
                  <span className="font-extrabold text-brand-400">💡 Optimization tip: </span>
                  {item.tips}
                </p>
              )}
            </div>
          ))}
        </div>

        {parsed.content_calendar_suggestion && (
          <div className="p-4 rounded-xl bg-brand-500/5 border border-brand-500/20 text-xs">
            <span className="font-extrabold text-brand-400 flex items-center gap-1 mb-1">
              <Calendar className="h-3.5 w-3.5" />
              Content Calendar Suggestion
            </span>
            <p className="text-text-secondary leading-relaxed">{parsed.content_calendar_suggestion}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CompetitorSpyView({ parsed, handleCopy, copied }: { parsed: any; handleCopy: () => void; copied: boolean }) {
  return (
    <Card variant="glass" className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between border-b border-glass-border/20 py-4 shrink-0">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <TrendingUp className="h-4.5 w-4.5 text-brand-400" />
          <span>Competitor Spy Report</span>
        </CardTitle>
        <Button variant="secondary" size="sm" onClick={handleCopy} leftIcon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}>
          {copied ? "Copied" : "Copy Report"}
        </Button>
      </CardHeader>
      <CardContent className="p-5 flex-1 overflow-y-auto space-y-5">
        {/* Competitor Overview Profile */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-100/40 border border-glass-border/30">
          <div className="h-12 w-12 rounded-full bg-brand-500/10 border border-brand-500/25 flex items-center justify-center font-extrabold text-brand-400 text-sm select-none">
            {parsed.competitor?.handle?.replace("@", "").slice(0, 2).toUpperCase() || "AI"}
          </div>
          <div className="space-y-1">
            <h5 className="font-extrabold text-sm text-text-primary leading-none">{parsed.competitor?.handle}</h5>
            <p className="text-[10px] text-text-secondary font-semibold">{parsed.competitor?.niche}</p>
            <div className="flex items-center gap-2 text-[10px] text-text-muted font-mono pt-0.5 select-none">
              <span>👥 {parsed.competitor?.subscribers}</span>
              <span>•</span>
              <span>📈 {parsed.competitor?.avg_views}</span>
            </div>
          </div>
        </div>

        {/* Top Performing Videos */}
        <div className="space-y-4">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider block select-none">Viral Content Intelligence</span>
          <div className="space-y-4">
            {parsed.top_videos?.map((video: any, idx: number) => (
              <div key={idx} className="p-4 rounded-xl bg-surface-50/20 border border-glass-border/40 space-y-3">
                {/* Title and stats */}
                <div className="space-y-1.5">
                  <h6 className="font-bold text-xs text-text-primary leading-snug">{video.title}</h6>
                  <div className="flex flex-wrap gap-2 text-[9px] font-bold text-text-muted font-mono uppercase select-none">
                    <span className="bg-surface-200 px-2 py-0.5 rounded-sm">👀 {video.views}</span>
                    <span className="bg-surface-200 px-2 py-0.5 rounded-sm">📅 {video.upload_date}</span>
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-sm">CTR: {video.ctr_estimate}</span>
                  </div>
                </div>

                {/* Hook Psychology */}
                <div className="p-2.5 rounded bg-surface-100/50 border border-glass-border/20 text-[11px] leading-relaxed">
                  <span className="font-extrabold text-brand-400 block uppercase text-[8px] mb-0.5 select-none">Hook Retention Analysis</span>
                  <p className="text-text-secondary">{video.hook_analysis}</p>
                </div>

                {/* Iterations */}
                <div className="space-y-1.5 pt-1">
                  <span className="font-extrabold text-pink-400 block uppercase text-[8px] select-none">Suggested Title Iterations (High CTR)</span>
                  <div className="space-y-1.5">
                    {video.iteration_suggestions?.map((iter: string, iIdx: number) => (
                      <div key={iIdx} className="p-2 rounded bg-brand-500/5 border border-brand-500/15 hover:border-brand-500/30 transition-colors text-[11px] leading-relaxed font-semibold text-text-primary select-all">
                        🚀 &ldquo;{iter}&rdquo;
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
