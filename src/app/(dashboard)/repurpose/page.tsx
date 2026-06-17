"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { OutputCard } from "@/components/ai/output-card";
import { useAIGenerate } from "@/hooks/use-ai-generate";
import { PLATFORMS, TONES } from "@/lib/constants";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RepurposePage() {
  const { generate, output, isGenerating, error, reset } = useAIGenerate();
  const [activeTab, setActiveTab] = React.useState<"text" | "video">("text");
  const [content, setContent] = React.useState("");
  const [youtubeUrl, setYoutubeUrl] = React.useState("");
  const [targetPlatform, setTargetPlatform] = React.useState("twitter");
  const [tone, setTone] = React.useState("storytelling");

  // Reset output when switching tabs
  const handleTabChange = (tab: "text" | "video") => {
    setActiveTab(tab);
    reset();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
        topic: "YouTube Shorts Repurpose", 
        youtubeUrl, 
        targetPlatform, 
        tone 
      });
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      <PageHeader
        title="Content Repurposing"
        description="Convert your high-performing YouTube scripts or blog posts into Twitter threads, LinkedIn articles, or Instagram carousels, or extract viral shorts from videos in seconds."
        badge="AI Tools (Agency)"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Generator Controls */}
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
                    {activeTab === "text" ? "Target Format/Platform" : "Target Short Platform"}
                  </label>
                  <Select
                    options={activeTab === "text" ? PLATFORMS : [
                      { value: "shorts", label: "YouTube Shorts", emoji: "🎥" },
                      { value: "reels", label: "Instagram Reels", emoji: "📸" },
                      { value: "tiktok", label: "TikTok Video", emoji: "🎵" }
                    ]}
                    value={targetPlatform}
                    onChange={setTargetPlatform}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block">Voice Tone</label>
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
                  {activeTab === "text" ? "Repurpose Content" : "Extract & Repurpose Video"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Output Area */}
        <div className="lg:col-span-7">
          <OutputCard
            type="REPURPOSE"
            output={output}
            isGenerating={isGenerating}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
