"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useGenerationStore } from "@/stores/generation-store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { GENERATION_TYPES } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Copy, 
  Check, 
  Eye, 
  FileText, 
  Search, 
  Filter, 
  Layers
} from "lucide-react";

export function RecentGenerations() {
  const { recentGenerations, clearHistory } = useGenerationStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedGen, setSelectedGen] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
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

  const formatOutputDisplay = (type: string, output: string) => {
    const parsed = getCleanJSONOutput(output);
    if (!parsed) {
      return <p className="whitespace-pre-line text-sm leading-relaxed">{output}</p>;
    }

    if (type === "VIRAL_HOOK" && Array.isArray(parsed)) {
      return (
        <div className="space-y-3 select-all">
          {parsed.map((item: any, idx: number) => (
            <div key={idx} className="p-3.5 rounded-lg bg-surface-100/50 border border-glass-border/30">
              <div className="flex justify-between items-start gap-2 mb-1">
                <span className="text-sm font-semibold text-text-primary">{item.hook}</span>
                <Badge variant="gradient" className="text-[10px] shrink-0">Score: {item.score}/10</Badge>
              </div>
              <div className="flex gap-2 text-[10px] text-text-muted mt-1 uppercase font-bold">
                <span>{item.emotion}</span>
                <span>•</span>
                <span>{item.platform_fit}</span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (type === "CAPTION") {
      return (
        <div className="space-y-4 select-all">
          <p className="whitespace-pre-line text-sm leading-relaxed">{parsed.caption}</p>
          <div className="flex flex-wrap gap-1.5">
            {parsed.hashtags?.map((hash: string, idx: number) => (
              <span key={idx} className="text-xs text-brand-400 font-semibold">{hash}</span>
            ))}
          </div>
          {parsed.cta && (
            <div className="p-3 rounded bg-brand-500/10 border border-brand-500/20 text-xs">
              <span className="font-bold text-brand-400">CTA: </span>
              <span className="text-text-secondary">{parsed.cta}</span>
            </div>
          )}
        </div>
      );
    }

    return (
      <pre className="text-xs font-mono p-4 rounded-lg bg-surface-100/80 border border-glass-border/40 overflow-auto max-h-[300px]">
        {JSON.stringify(parsed, null, 2)}
      </pre>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 60) return "text-brand-400 bg-brand-500/10 border-brand-500/20";
    return "text-text-secondary bg-surface-100 border-glass-border";
  };

  // Filter and search logic
  const filteredGenerations = recentGenerations.filter((item: any) => {
    const matchesFilter = activeFilter === "ALL" || item.type === activeFilter;
    
    const inputField = item.input.topic || item.input.niche || item.input.sourceContent || "";
    const matchesSearch = inputField.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Get active tool type categories represented in the history
  const categories = ["ALL", ...Array.from(new Set(recentGenerations.map((g: any) => g.type)))];

  return (
    <Card variant="glass" className="relative overflow-hidden border border-glass-border">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-glass-border/20 py-5 gap-4 select-none">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <FileText className="h-5 w-5 text-brand-400" />
          Workspace Generation Logs
        </CardTitle>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search bar */}
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs border-glass-border bg-surface-50/20 w-44 hover:border-glass-border-hover"
            />
          </div>

          {recentGenerations.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={clearHistory}
              className="text-xs text-text-secondary hover:text-error hover:bg-error/5 border border-transparent hover:border-error/10 h-9"
            >
              Clear Logs
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Dynamic Category Badges Filters */}
        {recentGenerations.length > 0 && (
          <div className="px-6 py-3 bg-surface-50/10 border-b border-glass-border/10 flex flex-wrap gap-2 items-center select-none">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
              <Filter className="h-3 w-3" />
              Filter By:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat: any) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md transition-all cursor-pointer border ${
                    activeFilter === cat
                      ? "bg-brand-500 text-white border-brand-500 shadow-glow-xs"
                      : "bg-surface-50/40 text-text-secondary border-glass-border hover:bg-surface-100/50 hover:text-text-primary"
                  }`}
                >
                  {cat === "ALL" ? "All Tools" : (GENERATION_TYPES[cat as keyof typeof GENERATION_TYPES]?.label || cat)}
                </button>
              ))}
            </div>
          </div>
        )}

        {filteredGenerations.length === 0 ? (
          <EmptyState
            icon={recentGenerations.length === 0 ? FileText : Layers}
            title={recentGenerations.length === 0 ? "No generations yet" : "No results match filter"}
            description={recentGenerations.length === 0 ? "Generate scroll-stopping marketing assets using any of our tools above." : "Try adjusting your filters or search keywords."}
            action={
              recentGenerations.length === 0 ? (
                <Link href="/scripts">
                  <Button variant="primary" size="sm" className="mt-2 font-bold">
                    Create Your First Script →
                  </Button>
                </Link>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto select-none">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-glass-border/20 text-[10px] font-bold text-text-muted uppercase tracking-wider bg-surface-50/15">
                  <th className="px-6 py-4">Tool</th>
                  <th className="px-6 py-4">Input Prompt / Topic</th>
                  <th className="px-6 py-4">Generated At</th>
                  <th className="px-6 py-4 text-center">Score</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border/10">
                <AnimatePresence initial={false}>
                  {filteredGenerations.map((item: any) => {
                    const meta = GENERATION_TYPES[item.type as keyof typeof GENERATION_TYPES];
                    return (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-surface-50/25 transition-colors group cursor-pointer"
                      >
                        {/* Tool column */}
                        <td className="px-6 py-4 font-medium text-text-primary whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            {meta && (
                              <div className="p-2 rounded bg-surface-100 border border-glass-border text-text-secondary group-hover:border-brand-500/20 group-hover:text-brand-400 transition-colors">
                                <meta.icon className="h-4 w-4" />
                              </div>
                            )}
                            <span className="group-hover:text-brand-400 transition-colors">{meta?.label || item.type}</span>
                          </div>
                        </td>

                        {/* Prompt Topic column */}
                        <td className="px-6 py-4 text-text-secondary max-w-[240px] truncate font-medium">
                          {item.input.topic || item.input.niche || item.input.sourceContent || "—"}
                        </td>

                        {/* Timestamp column */}
                        <td className="px-6 py-4 text-text-muted text-xs whitespace-nowrap">
                          {formatRelativeTime(item.createdAt)}
                        </td>

                        {/* Score column */}
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          {item.viralScore ? (
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold border ${getScoreColor(item.viralScore)}`}>
                              {item.viralScore}%
                            </span>
                          ) : (
                            <span className="text-text-muted text-xs">—</span>
                          )}
                        </td>

                        {/* Actions column */}
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-8 w-8 hover:bg-surface-200 border-glass-border hover:border-glass-border-hover"
                              onClick={() => handleCopy(item.id, item.output)}
                            >
                              {copiedId === item.id ? (
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </Button>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-8 w-8 hover:bg-surface-200 border-glass-border hover:border-glass-border-hover"
                              onClick={() => setSelectedGen(item)}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {/* View Output Dialog Modal */}
      <Dialog
        isOpen={!!selectedGen}
        onClose={() => setSelectedGen(null)}
        title={selectedGen ? `${GENERATION_TYPES[selectedGen.type as keyof typeof GENERATION_TYPES]?.label} Output` : ""}
        description={selectedGen ? `Generated ${formatRelativeTime(selectedGen.createdAt)}` : ""}
        className="max-w-2xl"
      >
        {selectedGen && (
          <div className="space-y-6 pt-2">
            <div className="p-3.5 rounded-lg bg-surface-100/50 border border-glass-border/30 space-y-1.5 text-xs text-text-secondary select-none">
              <span className="font-bold text-text-muted uppercase tracking-wider block">Input specifications</span>
              <div>
                <span className="font-semibold text-text-primary">Topic/Context: </span>
                {selectedGen.input.topic || selectedGen.input.niche || selectedGen.input.sourceContent}
              </div>
              {selectedGen.input.platform && (
                <div>
                  <span className="font-semibold text-text-primary">Platform: </span>
                  {selectedGen.input.platform}
                </div>
              )}
              {selectedGen.input.tone && (
                <div>
                  <span className="font-semibold text-text-primary">Tone: </span>
                  {selectedGen.input.tone}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider block select-none">Asset Output</span>
              <div className="max-h-[350px] overflow-y-auto pr-1">
                {formatOutputDisplay(selectedGen.type, selectedGen.output)}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-glass-border/20 select-none">
              <Button variant="secondary" onClick={() => setSelectedGen(null)}>
                Dismiss
              </Button>
              <Button
                variant="primary"
                leftIcon={copiedId === selectedGen.id ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                onClick={() => handleCopy(selectedGen.id, selectedGen.output)}
              >
                {copiedId === selectedGen.id ? "Copied Output" : "Copy Output"}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </Card>
  );
}
