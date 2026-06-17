"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { OutputCard } from "@/components/ai/output-card";
import { useAIGenerate } from "@/hooks/use-ai-generate";
import { PLATFORMS, TONES } from "@/lib/constants";
import { Sparkles, MessageSquare } from "lucide-react";

export default function HooksPage() {
  const { generate, output, isGenerating, error } = useAIGenerate();
  const [topic, setTopic] = React.useState("");
  const [platform, setPlatform] = React.useState("youtube");
  const [tone, setTone] = React.useState("professional");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    generate("VIRAL_HOOK", { topic, platform, tone });
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      <PageHeader
        title="Viral Hooks"
        description="Generate scroll-stopping hooks specifically optimized for CTR and organic reach."
        badge="AI Tools"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Generator controls */}
        <div className="lg:col-span-5">
          <Card variant="glass">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Topic / Idea</label>
                  <Input
                    placeholder="e.g. How I built a SaaS in 30 days"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Target Platform</label>
                  <Select
                    options={PLATFORMS}
                    value={platform}
                    onChange={setPlatform}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Tone of Content</label>
                  <Select
                    options={TONES}
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
                  Generate Hooks
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Visual output parser */}
        <div className="lg:col-span-7 h-full">
          <OutputCard
            type="VIRAL_HOOK"
            output={output}
            isGenerating={isGenerating}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
