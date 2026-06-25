"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ViralScoreGauge } from "@/components/ai/viral-score-gauge";
import { useAIGenerate } from "@/hooks/use-ai-generate";
import { PLATFORMS } from "@/lib/constants";
import { Sparkles, TrendingUp } from "lucide-react";
import { MagneticButton } from "@/components/motion/magnetic-button";

export function ViralPredictorWidget() {
  const { generate, output, isGenerating, error } = useAIGenerate("VIRAL_SCORE");
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState("youtube");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    generate("VIRAL_SCORE", {
      topic: content.slice(0, 100),
      sourceContent: content,
      platform,
    });
  };

  return (
    <Card variant="glass" className="relative overflow-hidden h-full flex flex-col" hoverEffect={false} role="region" aria-label="Quick Virality Predictor">
      <div className="absolute -top-12 -right-12 h-44 w-44 bg-radial-gradient(circle,rgba(236,72,153,0.03)_0%,transparent_70%) pointer-events-none" />
      
      <CardHeader className="border-b border-glass-border/20 py-4.5 select-none">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-brand-400" />
          Quick Virality Predictor
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5 flex-1 flex flex-col lg:flex-row gap-5 min-h-[350px]">
        {/* Left Column: Form Controls */}
        <div className="flex-1 flex flex-col justify-between space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-3 flex-1 flex flex-col">
              <div className="space-y-1">
                <label htmlFor="widget-content-draft" className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block pl-0.5">Content Draft</label>
                <Textarea
                  id="widget-content-draft"
                  placeholder="Paste your hooks, captions, or script segments to predict virality score..."
                  className="flex-1 min-h-[120px] text-xs resize-none bg-surface-50/20 hover:border-glass-border-hover border-glass-border"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={isGenerating}
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="widget-platform-select" className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block pl-0.5">Target Platform</label>
                <Select
                  id="widget-platform-select"
                  options={PLATFORMS}
                  value={platform}
                  onChange={setPlatform}
                  disabled={isGenerating}
                />
              </div>
            </div>

            <MagneticButton className="w-full mt-4">
              <Button
                type="submit"
                variant="primary"
                className="w-full h-10.5 font-bold text-xs shadow-glow-sm"
                disabled={isGenerating}
                isLoading={isGenerating}
                rightIcon={!isGenerating && <Sparkles className="h-3.5 w-3.5" />}
              >
                Analyze Virality Score
              </Button>
            </MagneticButton>
          </form>
        </div>

        {/* Right Column: Output Display */}
        <div className="flex-1 min-h-[220px] lg:min-h-full" aria-live="polite">
          <ViralScoreGauge
            output={output}
            isGenerating={isGenerating}
            error={error}
          />
        </div>
      </CardContent>
    </Card>
  );
}
