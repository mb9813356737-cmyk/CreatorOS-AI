"use client";

import * as React from "react";
import { useUIStore } from "@/stores/ui-store";
import { Dialog } from "@/components/ui/dialog";

export function LockedFeatureModal() {
  const {
    lockedFeatureModalOpen,
    lockedFeatureName,
    setLockedFeatureModalOpen,
    setUpgradeModalOpen,
  } = useUIStore();

  const handleUpgradeClick = () => {
    setLockedFeatureModalOpen(false);
    setUpgradeModalOpen(true);
  };

  return (
    <Dialog
      isOpen={lockedFeatureModalOpen}
      onClose={() => setLockedFeatureModalOpen(false)}
      className="max-w-md bg-surface-50/95 border-glass-border/40 p-6 overflow-hidden text-center flex flex-col items-center"
    >
      <div className="flex flex-col items-center justify-center text-center space-y-6 py-4 relative z-10">
        {/* Background glow behind icon */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-brand-500/10 rounded-full blur-xl -z-10" />

        {/* Lock emoji */}
        <div className="text-4xl select-none animate-bounce duration-1000">🔒</div>

        {/* Title */}
        <h2 className="text-xl font-bold tracking-tight text-text-primary">
          Unlock {lockedFeatureName}
        </h2>

        {/* Subtitle */}
        <div className="space-y-2 px-2">
          <p className="text-xs font-bold text-brand-400 uppercase tracking-wider">
            This feature is available exclusively for Pro members.
          </p>
          <p className="text-xs text-text-muted leading-relaxed">
            Upgrade now to access Thumbnails, Trends, Viral Score, Repurpose and everything CreatorOS AI has to offer.
          </p>
        </div>

        {/* Bullet Points */}
        <div className="w-full max-w-xs bg-surface-100/40 border border-glass-border/20 rounded-xl p-4 text-left space-y-2.5">
          <div className="flex items-center gap-2.5 text-xs text-text-secondary">
            <span className="text-brand-400 font-extrabold text-sm">✦</span>
            <span>Unlimited Viral Hooks</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-text-secondary">
            <span className="text-brand-400 font-extrabold text-sm">✦</span>
            <span>AI Thumbnail Ideas</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-text-secondary">
            <span className="text-brand-400 font-extrabold text-sm">✦</span>
            <span>Trending Topic Alerts</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-text-secondary">
            <span className="text-brand-400 font-extrabold text-sm">✦</span>
            <span>Viral Score Analysis</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-text-secondary">
            <span className="text-brand-400 font-extrabold text-sm">✦</span>
            <span>Repurpose Across Platforms</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-text-secondary">
            <span className="text-brand-400 font-extrabold text-sm">✦</span>
            <span>Priority AI Generation</span>
          </div>
        </div>

        {/* Upgrade to Pro CTA Button */}
        <button
          onClick={handleUpgradeClick}
          className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-bold text-sm shadow-glow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
        >
          Upgrade to Pro ⚡
        </button>

        {/* Maybe Later subtle text link */}
        <button
          onClick={() => setLockedFeatureModalOpen(false)}
          className="text-xs text-text-muted hover:text-text-primary hover:underline transition-all cursor-pointer font-medium"
        >
          Maybe Later
        </button>
      </div>
    </Dialog>
  );
}
