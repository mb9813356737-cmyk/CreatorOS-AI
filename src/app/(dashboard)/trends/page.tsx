"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { OutputCard } from "@/components/ai/output-card";
import { useAIGenerate } from "@/hooks/use-ai-generate";
import { PLATFORMS } from "@/lib/constants";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TrendsPage() {
  const { generate, output, isGenerating, error, reset } = useAIGenerate();
  const [activeTab, setActiveTab] = React.useState<"niche" | "competitor">("niche");
  const [niche, setNiche] = React.useState("");
  const [competitorHandle, setCompetitorHandle] = React.useState("");
  const [platform, setPlatform] = React.useState("youtube");

  const handleTabChange = (tab: "niche" | "competitor") => {
    setActiveTab(tab);
    reset();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "niche") {
      if (!niche.trim()) return;
      generate("TREND", { topic: niche, niche, platform });
    } else {
      if (!competitorHandle.trim()) return;
      generate("TREND", { topic: `Competitor: ${competitorHandle}`, competitorHandle, platform });
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      <PageHeader
        title="Trend Intelligence"
        description="Identify current trending keywords, viral waves, or spy on competitor channels to iterate on their high-performing hooks."
        badge="AI Tools (Pro)"
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
                    options={PLATFORMS}
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

        {/* Output Area */}
        <div className="lg:col-span-7">
          <OutputCard
            type="TREND"
            output={output}
            isGenerating={isGenerating}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
