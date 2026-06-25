"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { OutputCard } from "@/components/ai/output-card";
import { useAIGenerate } from "@/hooks/use-ai-generate";
import { PLATFORMS, TONES, LANGUAGES } from "@/lib/constants";
import { Sparkles } from "lucide-react";

export default function CaptionsPage() {
  const { generate, output, isGenerating, error } = useAIGenerate("CAPTION");
  const [topic, setTopic] = React.useState("");
  const [platform, setPlatform] = React.useState("instagram");
  const [tone, setTone] = React.useState("casual");
  const [language, setLanguage] = React.useState("hinglish");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    generate("CAPTION", { topic, platform, tone, language });
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      <PageHeader
        title="Engaging Captions"
        description="Write captions that match your voice and format correctly, optimized for each platform's algorithms."
        badge="AI Tools"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Generator Controls */}
        <div className="lg:col-span-5">
          <Card variant="glass">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Video Topic / Content Info</label>
                  <Input
                    placeholder="e.g. 5 steps to start investing at 20"
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
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Tone</label>
                  <Select
                    options={TONES}
                    value={tone}
                    onChange={setTone}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Language</label>
                  <Select
                    options={LANGUAGES}
                    value={language}
                    onChange={setLanguage}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-linear-to-r from-brand-600 to-pink-600"
                  isLoading={isGenerating}
                  leftIcon={!isGenerating && <Sparkles className="h-4.5 w-4.5" />}
                >
                  Generate Caption
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Output card */}
        <div className="lg:col-span-7">
          <OutputCard
            type="CAPTION"
            output={output}
            isGenerating={isGenerating}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
