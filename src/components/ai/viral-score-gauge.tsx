"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, CheckCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViralScoreBreakdown {
  hook: number;
  emotion: number;
  shareability: number;
  relatability: number;
  timeliness: number;
  platform_fit: number;
}

interface ViralScoreData {
  overall_score: number;
  breakdown: ViralScoreBreakdown;
  improvements: string[];
  benchmark_comparison: string;
  verdict: string;
}

interface ViralScoreGaugeProps {
  output: string | null;
  isGenerating: boolean;
  error: string | null;
}

export function ViralScoreGauge({ output, isGenerating, error }: ViralScoreGaugeProps) {
  const getCleanJSONOutput = (text: string): ViralScoreData | null => {
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
      <Card variant="glass" className="h-full min-h-[400px] flex items-center justify-center p-6">
        <div className="space-y-4 text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-brand-400 mx-auto" />
          <p className="text-sm font-semibold text-text-secondary">Analyzing content psychographics & virality metrics...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="glass" className="h-full min-h-[400px] border-error/40 bg-error/5 flex items-center justify-center p-6">
        <p className="text-sm text-error font-medium">{error}</p>
      </Card>
    );
  }

  if (!output) {
    return (
      <Card variant="glass" className="h-full min-h-[400px] flex flex-col items-center justify-center p-6 border-dashed border-glass-border/60">
        <div className="flex flex-col items-center text-center max-w-xs space-y-3 select-none">
          <div className="p-3.5 rounded-2xl bg-surface-100/50 border border-glass-border/30 text-text-muted">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h4 className="font-semibold text-text-secondary text-sm">Predict Virality Strength</h4>
          <p className="text-xs text-text-muted leading-relaxed">Paste your script, hooks, or captions to evaluate its potential virality percentage score.</p>
        </div>
      </Card>
    );
  }

  const data = getCleanJSONOutput(output);
  if (!data) {
    return (
      <Card variant="glass" className="h-full p-6">
        <h4 className="text-sm font-semibold text-text-primary mb-3">Raw Virality Output</h4>
        <pre className="text-xs font-mono p-4 rounded bg-surface-100/80 border border-glass-border overflow-auto max-h-[300px]">{output}</pre>
      </Card>
    );
  }

  const { overall_score, breakdown, improvements, benchmark_comparison, verdict } = data;

  // Circle path details for SVG Gauge
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overall_score / 100) * circumference;

  const getScoreRatingColor = (score: number) => {
    if (score >= 80) return "stroke-emerald-400 text-emerald-400";
    if (score >= 60) return "stroke-brand-400 text-brand-400";
    return "stroke-amber-400 text-amber-400";
  };

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      hook: "Hook Strength",
      emotion: "Emotional Trigger",
      shareability: "Shareability",
      relatability: "Relatability",
      timeliness: "Timeliness",
      platform_fit: "Platform Fit",
    };
    return labels[cat] || cat;
  };

  return (
    <Card variant="glass" className="h-full flex flex-col">
      <CardHeader className="border-b border-glass-border/20 py-4">
        <CardTitle className="text-sm font-bold flex items-center gap-2 select-none">
          <TrendingUp className="h-4.5 w-4.5 text-brand-400" />
          Virality Score Predictor Report
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-5 flex-1 overflow-y-auto space-y-8 select-all">
        {/* Main circular gauge */}
        <div className="flex flex-col sm:flex-row items-center gap-6 justify-center bg-surface-100/30 p-5 rounded-xl border border-glass-border/20">
          <div className="relative h-36 w-36 flex items-center justify-center select-none">
            <svg className="h-full w-full transform -rotate-90">
              {/* Back track */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-glass-border fill-none"
                strokeWidth={strokeWidth}
              />
              {/* Active fill */}
              <motion.circle
                cx="72"
                cy="72"
                r={radius}
                className={cn("fill-none", getScoreRatingColor(overall_score))}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-extrabold text-text-primary font-mono">{overall_score}%</span>
              <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest block mt-0.5">Score</span>
            </div>
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <Badge variant="gradient" className="font-extrabold tracking-wider uppercase text-[9px] select-none">
              {verdict || "Viral Potential"}
            </Badge>
            <p className="text-xs text-text-secondary leading-relaxed font-medium">
              {benchmark_comparison}
            </p>
          </div>
        </div>

        {/* Categories breakdown */}
        <div className="space-y-4">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider block select-none">Virality Breakdown</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(breakdown).map(([category, score]) => (
              <div key={category} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold select-none">
                  <span className="text-text-secondary">{getCategoryLabel(category)}</span>
                  <span className="text-text-primary font-mono">{score}%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-200 rounded-full overflow-hidden select-none">
                  <motion.div
                    className={cn(
                      "h-full rounded-full",
                      score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-brand-500" : "bg-amber-500"
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Optimizations list */}
        <div className="pt-6 border-t border-glass-border/20 space-y-3.5">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider block select-none">Optimization Roadmap</span>
          <div className="space-y-3">
            {improvements.map((improvement, index) => (
              <div key={index} className="flex items-start gap-2.5 text-xs text-text-secondary leading-relaxed">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5 select-none" />
                <span>{improvement}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
