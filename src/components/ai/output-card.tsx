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
  type: "VIRAL_HOOK" | "CAPTION" | "SCRIPT" | "THUMBNAIL" | "TREND" | "VIRAL_SCORE" | "REPURPOSE";
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

export function OutputCard({ type, output, isGenerating, error }: OutputCardProps) {
  const [copied, setCopied] = React.useState(false);
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
    try {
      const clean = text.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(clean);
      return parsed;
    } catch {
      return null;
    }
  };

  if (isGenerating) {
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

  const parsed = getCleanJSONOutput(output) || parsePlainTextCaption(output || "");

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

  if (type === "VIRAL_HOOK" && hooksList) {
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
  if (type === "CAPTION" && parsed && parsed.caption) {
    return (
      <Card variant="glass" className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b border-glass-border/20 py-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-brand-400" />
            Generated Social Caption
          </CardTitle>
          <Button variant="secondary" size="sm" onClick={() => handleCopy()} leftIcon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}>
            {copied ? "Copied" : "Copy Caption"}
          </Button>
        </CardHeader>
        <CardContent className="p-5 flex-1 overflow-y-auto space-y-4 select-all">
          <div className="p-4 rounded-xl bg-surface-100/40 border border-glass-border/40">
            <p className="whitespace-pre-line text-sm leading-relaxed text-text-primary">{parsed.caption}</p>
          </div>
          
          <div className="space-y-1.5 select-none">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Hashtags</span>
            <div className="flex flex-wrap gap-1.5">
              {parsed.hashtags?.map((hash: string, idx: number) => (
                <Badge key={idx} variant="default" className="text-xs">
                  {hash}
                </Badge>
              ))}
            </div>
          </div>

          {parsed.cta && (
            <div className="p-3.5 rounded-lg bg-brand-500/10 border border-brand-500/30 text-xs">
              <span className="font-extrabold text-brand-400 block mb-0.5">Strategic call-to-action</span>
              <span className="text-text-secondary">{parsed.cta}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // ─── SCRIPT RENDERING ───────────────────────────────────
  if (type === "SCRIPT" && parsed && Array.isArray(parsed.sections)) {
    return (
      <Card variant="glass" className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b border-glass-border/20 py-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Video className="h-4.5 w-4.5 text-brand-400" />
            {parsed.title || "Ready-to-Film Script"}
          </CardTitle>
          <Button variant="secondary" size="sm" onClick={handleCopy} leftIcon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}>
            {copied ? "Copied" : "Copy Script"}
          </Button>
        </CardHeader>
        <CardContent className="p-5 flex-1 overflow-y-auto space-y-6 select-all">
          {/* TTS Neural Voice-Over Player */}
          <div className="p-4 rounded-xl bg-surface-50/20 border border-glass-border/40 select-none space-y-3">
            {ttsState === "none" && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="space-y-0.5 text-center sm:text-left">
                  <h5 className="font-extrabold text-xs text-text-primary uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
                    <Mic className="h-4 w-4 text-brand-400" />
                    Neural Voice-Over Preview
                  </h5>
                  <p className="text-[10px] text-text-secondary">
                    Generate an instant natural Hinglish TTS voiceover preview to hear how this script sounds.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={handleTtsGenerate}
                  className="h-8 text-xs bg-linear-to-r from-brand-600 to-pink-600 font-bold shrink-0"
                >
                  Generate Voice-Over
                </Button>
              </div>
            )}

            {ttsState === "generating" && (
              <div className="flex items-center gap-3 py-1">
                <RefreshCw className="h-4 w-4 text-brand-400 animate-spin" />
                <span className="text-[11px] font-extrabold text-text-secondary uppercase tracking-wider">
                  Synthesizing Voice (Natural Hinglish)...
                </span>
              </div>
            )}

            {ttsState === "ready" && (
              <div className="space-y-3">
                {/* Audio source toggles and config */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-glass-border/10">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px] uppercase font-bold text-brand-400 border-brand-500/20 bg-brand-500/5">
                      🎙️ Neural Voice Active
                    </Badge>
                    <div className="flex gap-1.5 p-0.5 bg-surface-100 rounded border border-glass-border/30">
                      <button
                        onClick={() => setVoiceGender("male")}
                        className={cn("px-2 py-0.5 text-[9px] font-bold rounded transition-colors", voiceGender === "male" ? "bg-brand-500 text-white" : "text-text-secondary")}
                      >
                        Male (Aarav)
                      </button>
                      <button
                        onClick={() => setVoiceGender("female")}
                        className={cn("px-2 py-0.5 text-[9px] font-bold rounded transition-colors", voiceGender === "female" ? "bg-brand-500 text-white" : "text-text-secondary")}
                      >
                        Female (Ananya)
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-text-secondary uppercase">Speed:</span>
                    <div className="flex gap-1 p-0.5 bg-surface-100 rounded border border-glass-border/30">
                      {[1, 1.25, 1.5].map(rate => (
                        <button
                          key={rate}
                          onClick={() => setPlaybackRate(rate)}
                          className={cn("px-1.5 py-0.5 text-[9px] font-bold rounded transition-colors", playbackRate === rate ? "bg-brand-500 text-white" : "text-text-secondary")}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* HTML5 audio element */}
                <audio
                  ref={audioRef}
                  src={voiceGender === "male"
                    ? "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
                    : "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
                  }
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleAudioEnded}
                />

                {/* Player controls */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="h-8 w-8 rounded-full bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 transition-colors shadow-glow-sm shrink-0"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
                  </button>

                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-[10px] font-mono text-text-secondary">{formatTime(currentTime)}</span>
                    <input
                      type="range"
                      min="0"
                      max={audioDuration || 100}
                      value={currentTime}
                      onChange={handleSeek}
                      className="flex-1 h-1 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
                    />
                    <span className="text-[10px] font-mono text-text-secondary">{formatTime(audioDuration)}</span>
                  </div>

                  <a
                    href={voiceGender === "male"
                      ? "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
                      : "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
                    }
                    download={`voiceover-${voiceGender}.mp3`}
                    className="p-2 rounded-lg border border-glass-border hover:bg-surface-200 hover:text-brand-400 transition-colors"
                    title="Download Audio"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Volume2 className="h-4 w-4" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Timeline script segments */}
          <div className="relative border-l border-glass-border/30 pl-4.5 ml-2 space-y-6 select-all">
            {parsed.sections.map((sec: any, idx: number) => (
              <div key={idx} className="relative">
                {/* Visual line bubble */}
                <div className="absolute -left-[27px] top-1.5 h-3.5 w-3.5 rounded-full bg-brand-500 border-2 border-surface-0 shadow-glow-sm" />
                
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-brand-400">{sec.timestamp}</span>
                    {sec.text_overlay && (
                      <Badge variant="outline" className="text-[10px] font-mono px-2 py-0.5">
                        Overlay: {sec.text_overlay}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm font-medium text-text-primary leading-relaxed">
                    &ldquo;{sec.dialogue}&rdquo;
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-text-secondary select-none">
                    {sec.visual_cue && (
                      <div className="bg-surface-100 p-2 rounded border border-glass-border/20">
                        <span className="font-extrabold text-brand-400 block uppercase text-[8px] mb-0.5">Visual cue</span>
                        {sec.visual_cue}
                      </div>
                    )}
                    {sec.audio_cue && (
                      <div className="bg-surface-100 p-2 rounded border border-glass-border/20">
                        <span className="font-extrabold text-pink-400 block uppercase text-[8px] mb-0.5">Audio cue</span>
                        {sec.audio_cue}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Expert tips */}
          {Array.isArray(parsed.tips) && parsed.tips.length > 0 && (
            <div className="pt-4 border-t border-glass-border/20 space-y-2 select-none">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">Production Tips</span>
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

  // ─── THUMBNAIL RENDERING ────────────────────────────────
  const promptsList = parsed && (Array.isArray(parsed.prompts) ? parsed.prompts : (parsed.prompt ? [parsed] : null));

  if (type === "THUMBNAIL" && promptsList) {
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
  if (type === "TREND" && parsed) {
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
  if (type === "REPURPOSE" && parsed) {
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
