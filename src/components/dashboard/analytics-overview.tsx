"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Default placeholder stats while database populates
const DEFAULT_HISTORY = [
  { day: "Mon", youtube: 0, reels: 0, other: 0 },
  { day: "Tue", youtube: 0, reels: 0, other: 0 },
  { day: "Wed", youtube: 0, reels: 0, other: 0 },
  { day: "Thu", youtube: 0, reels: 0, other: 0 },
  { day: "Fri", youtube: 0, reels: 0, other: 0 },
  { day: "Sat", youtube: 0, reels: 0, other: 0 },
  { day: "Sun", youtube: 0, reels: 0, other: 0 },
];

const DEFAULT_DISTRIBUTION = [
  { name: "Hooks", count: 0, color: "var(--color-brand-500)" },
  { name: "Captions", count: 0, color: "var(--color-pink-500)" },
  { name: "Scripts", count: 0, color: "var(--color-accent-500)" },
  { name: "Thumbnails", count: 0, color: "var(--color-emerald-500)" },
  { name: "Trends", count: 0, color: "var(--color-amber-500)" },
  { name: "Repurpose", count: 0, color: "var(--color-brand-700)" },
];

export function AnalyticsOverview() {
  const [mounted, setMounted] = useState(false);
  const [viewType, setViewType] = useState<"views" | "tools">("views");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  
  // Real data state
  const [historyData, setHistoryData] = useState<any[]>(DEFAULT_HISTORY);
  const [distributionData, setDistributionData] = useState<any[]>(DEFAULT_DISTRIBUTION);
  const [loading, setLoading] = useState(true);

  // Fetch usage telemetry on load
  useEffect(() => {
    setMounted(true);
    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/user/usage/history");
        if (res.ok) {
          const data = await res.json();
          if (data.history) {
            setHistoryData(data.history);
          }
          if (data.distribution) {
            setDistributionData(data.distribution);
          }
        }
      } catch (err) {
        console.warn("Failed to load user usage analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (!mounted || loading) {
    return (
      <Card variant="glass" className="h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500/30 border-t-brand-500" />
          <span className="text-xs text-text-secondary animate-pulse">Initializing charts...</span>
        </div>
      </Card>
    );
  }

  // Calculate dynamic metrics
  const totalGenerations = historyData.reduce((acc, curr) => acc + curr.youtube + curr.reels + curr.other, 0);
  const formattedGenerations = new Intl.NumberFormat("en-IN", { notation: "compact" }).format(totalGenerations);

  // Dynamic calculations for best channel
  let bestChannel = "None";
  let maxChannelCount = -1;
  distributionData.forEach(item => {
    if (item.count > maxChannelCount && item.count > 0) {
      maxChannelCount = item.count;
      bestChannel = item.name;
    }
  });

  const dailyAverage = (totalGenerations / 7).toFixed(1);

  // Chart layout calculations
  const chartWidth = 500;
  const chartHeight = 200;
  const paddingX = 30;
  const paddingY = 20;

  // Max value calculation based on dataset to fit the curve beautifully
  const maxVal = Math.max(
    10,
    ...historyData.map((item) => Math.max(item.youtube, item.reels, item.other))
  );

  const getCoordinates = (key: "youtube" | "reels") => {
    return historyData.map((item, idx) => {
      const x = (idx / (historyData.length - 1)) * (chartWidth - paddingX * 2) + paddingX;
      const y = chartHeight - paddingY - (item[key] / maxVal) * (chartHeight - paddingY * 2);
      return { x, y, day: item.day, value: item[key] };
    });
  };

  const youtubeCoords = getCoordinates("youtube");
  const reelsCoords = getCoordinates("reels");

  const getPathD = (coords: typeof youtubeCoords) => {
    return coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
  };

  const getAreaD = (coords: typeof youtubeCoords) => {
    const linePath = getPathD(coords);
    return `${linePath} L ${coords[coords.length - 1].x} ${chartHeight - paddingY} L ${coords[0].x} ${chartHeight - paddingY} Z`;
  };

  const maxToolCount = Math.max(1, ...distributionData.map((t) => t.count));

  return (
    <Card variant="glass" className="relative overflow-hidden group">
      {/* Background radial spotlight */}
      <div 
        className="absolute -top-12 -left-12 h-64 w-64 pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(circle, var(--color-brand-500) 0%, transparent 70%)', opacity: 0.1 }}
      />

      {/* Header section */}
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-glass-border/20 pb-5">
        <div className="space-y-1">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-brand-400" />
            Performance Insights
          </CardTitle>
          <p className="text-xs text-text-secondary">Track your weekly audience views and social content generation rates.</p>
        </div>

        {/* Tab Swappers */}
        <div className="flex bg-surface-100/60 border border-glass-border/40 p-1 rounded-lg self-start sm:self-center">
          <button
            onClick={() => setViewType("views")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 cursor-pointer ${
              viewType === "views"
                ? "bg-accent-500 text-text-inverse shadow-glow-cyan"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Generations Chart
          </button>
          <button
            onClick={() => setViewType("tools")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 cursor-pointer ${
              viewType === "tools"
                ? "bg-accent-500 text-text-inverse shadow-glow-cyan"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Tools Distribution
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <AnimatePresence mode="wait">
          {viewType === "views" ? (
            /* VIEW 1: ENGAGEMENT AREA CHART */
            <motion.div
              key="views-chart"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-glass-border/20 bg-surface-50/30">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Total Generations</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-extrabold text-text-primary">{formattedGenerations}</span>
                    {totalGenerations > 0 && (
                      <Badge variant="outline" className="text-[9px] text-emerald-400 bg-emerald-500/5 border-emerald-500/10 py-0 px-1 font-bold gap-0.5">
                        <ArrowUpRight className="h-2.5 w-2.5" />
                        Active
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Best Channel</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-extrabold text-text-primary">{bestChannel}</span>
                    {bestChannel !== "None" && (
                      <div className="h-1.5 w-1.5 rounded-full bg-accent-500 animate-pulse" />
                    )}
                  </div>
                </div>

                <div className="space-y-1 hidden sm:block">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Daily Average</span>
                  <span className="text-sm font-extrabold text-text-primary">{dailyAverage} runs/day</span>
                </div>
              </div>

              {/* Native SVG Area Chart */}
              <div className="relative h-[250px] w-full">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="svgYoutubeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-brand-500)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="var(--color-brand-500)" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="svgReelsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-accent-500)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="var(--color-accent-500)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  {/* Cartesian Grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((r) => {
                    const y = paddingY + r * (chartHeight - paddingY * 2);
                    return (
                      <line
                        key={r}
                        x1={paddingX}
                        y1={y}
                        x2={chartWidth - paddingX}
                        y2={y}
                        stroke="rgba(255,255,255,0.04)"
                        strokeDasharray="3 3"
                      />
                    );
                  })}

                  {/* Areas */}
                  <path d={getAreaD(youtubeCoords)} fill="url(#svgYoutubeGrad)" />
                  <path d={getAreaD(reelsCoords)} fill="url(#svgReelsGrad)" />

                  {/* Stroke lines */}
                  <path d={getPathD(youtubeCoords)} fill="none" stroke="var(--color-brand-500)" strokeWidth={2} />
                  <path d={getPathD(reelsCoords)} fill="none" stroke="var(--color-accent-500)" strokeWidth={2} />

                  {/* Interactive vertical hover indicator */}
                  {hoverIndex !== null && (
                    <line
                      key="hover-line"
                      x1={youtubeCoords[hoverIndex].x}
                      y1={paddingY}
                      x2={youtubeCoords[hoverIndex].x}
                      y2={chartHeight - paddingY}
                      stroke="rgba(206,255,26,0.3)"
                      strokeWidth={1.5}
                      strokeDasharray="2 2"
                    />
                  )}

                  {/* Data Point Circles on Hover */}
                  {hoverIndex !== null && (
                    <>
                      <circle cx={youtubeCoords[hoverIndex].x} cy={youtubeCoords[hoverIndex].y} r={4.5} fill="var(--color-brand-500)" stroke="#000" strokeWidth={1} />
                      <circle cx={reelsCoords[hoverIndex].x} cy={reelsCoords[hoverIndex].y} r={4.5} fill="var(--color-accent-500)" stroke="#000" strokeWidth={1} />
                    </>
                  )}

                  {/* X-Axis labels */}
                  {historyData.map((item, idx) => {
                    const x = (idx / (historyData.length - 1)) * (chartWidth - paddingX * 2) + paddingX;
                    return (
                      <text
                        key={idx}
                        x={x}
                        y={chartHeight - 3}
                        fill="var(--color-text-muted)"
                        fontSize={9}
                        fontWeight={600}
                        textAnchor="middle"
                      >
                        {item.day}
                      </text>
                    );
                  })}

                  {/* Y-Axis values */}
                  {[0, Math.round(maxVal / 2), maxVal].map((v) => {
                    const y = chartHeight - paddingY - (v / maxVal) * (chartHeight - paddingY * 2);
                    return (
                      <text
                        key={v}
                        x={18}
                        y={y + 3}
                        fill="var(--color-text-muted)"
                        fontSize={8}
                        fontWeight={600}
                        textAnchor="end"
                      >
                        {v}
                      </text>
                    );
                  })}

                  {/* Interactive invisible hover triggers */}
                  {historyData.map((_, idx) => {
                    const colWidth = (chartWidth - paddingX * 2) / (historyData.length - 1);
                    const xStart = youtubeCoords[idx].x - colWidth / 2;
                    return (
                      <rect
                        key={idx}
                        x={xStart}
                        y={0}
                        width={colWidth}
                        height={chartHeight}
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoverIndex(idx)}
                        onMouseLeave={() => setHoverIndex(null)}
                      />
                    );
                  })}
                </svg>

                {/* Floating Tooltip HTML Overlay */}
                {hoverIndex !== null && (
                  <div
                    className="absolute z-50 glass p-2.5 rounded-lg shadow-cinematic text-[10px] space-y-1 min-w-[130px] pointer-events-none"
                    style={{
                      left: `${(youtubeCoords[hoverIndex].x / chartWidth) * 100}%`,
                      top: "10%",
                      transform: "translateX(-50%)",
                    }}
                  >
                    <p className="font-bold text-text-primary text-[11px] border-b border-glass-border/10 pb-0.5 mb-1">
                      {historyData[hoverIndex].day} ({historyData[hoverIndex].dateStr})
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1 text-text-secondary">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                        Youtube (Long)
                      </span>
                      <span className="font-extrabold text-text-primary">
                        {historyData[hoverIndex].youtube}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1 text-text-secondary">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
                        Reels (Short)
                      </span>
                      <span className="font-extrabold text-text-primary">
                        {historyData[hoverIndex].reels}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t border-glass-border/10 pt-1 mt-1">
                      <span className="flex items-center gap-1 text-text-secondary">
                        <span className="h-1.5 w-1.5 rounded-full bg-surface-400" />
                        Other
                      </span>
                      <span className="font-extrabold text-text-primary">
                        {historyData[hoverIndex].other}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            /* VIEW 2: TOOL DISTRIBUTION BAR CHART (HTML/CSS Based) */
            <motion.div
              key="tools-chart"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border border-glass-border/20 bg-surface-50/30">
                <div className="space-y-1 text-left">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Favorite Engine</span>
                  <span className="text-sm font-extrabold text-text-primary">{bestChannel !== "None" ? `${bestChannel} 💥` : "None"}</span>
                </div>
                <div className="space-y-1 text-left">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Total Generations</span>
                  <span className="text-sm font-extrabold text-text-primary">{totalGenerations} runs completed</span>
                </div>
              </div>

              {/* CSS Flex/Grid Bar Chart (Extremely premium, animated & 100% reliable) */}
              <div className="flex items-end justify-between h-[230px] w-full px-4 pt-4 border-b border-glass-border/20">
                {distributionData.map((item, idx) => {
                  const pct = maxToolCount > 0 ? (item.count / maxToolCount) * 100 : 0;
                  return (
                    <div key={idx} className="flex flex-col items-center flex-1 group relative">
                      {/* Tooltip on hover */}
                      <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-all duration-150 bg-surface-100 border border-glass-border text-text-primary font-bold text-[9px] rounded-md px-2 py-1 shadow-elevated z-10 whitespace-nowrap">
                        {item.count} assets
                      </div>

                      {/* Bar fill */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${pct}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="w-8 sm:w-11 rounded-t-md relative overflow-hidden shadow-glow-sm hover:opacity-95 transition-opacity"
                        style={{ backgroundColor: item.color }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10" />
                      </motion.div>

                      {/* X Label */}
                      <span className="text-[9px] font-bold text-text-muted mt-3 select-none">
                        {item.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
