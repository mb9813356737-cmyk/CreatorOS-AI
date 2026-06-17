"use client";

import { useUIStore } from "@/stores/ui-store";
import { useUsage } from "@/hooks/use-usage";
import { useSubscription } from "@/hooks/use-subscription";
import { UserButton, useUser } from "@/lib/auth";
import { Menu, Zap, Loader2 } from "lucide-react";
import { AnimatedSearch } from "@/components/ui/animated-search";

export function Topbar() {
  const { user } = useUser();
  const { setSidebarMobileOpen, setUpgradeModalOpen } = useUIStore();
  const { usage, isLoading: usageLoading } = useUsage();
  const { subscription } = useSubscription();

  const planName = subscription?.plan || "FREE";

  return (
    <header 
      className="flex h-16 w-full items-center justify-between px-6 border-b border-glass-border/20 bg-surface-0/60 backdrop-blur-md sticky top-0 z-30 select-none border-electric"
      style={{ animationDuration: "4s" }}
    >
      {/* Mobile Toggle & Search */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={() => setSidebarMobileOpen(true)}
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-glass-border/40 hover:bg-surface-100 hover:border-glass-border text-text-secondary hover:text-text-primary transition-all cursor-pointer border-dash"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search Bar */}
        <div className="hidden sm:flex">
          <AnimatedSearch placeholder="Search dashboard..." />
        </div>
      </div>

      {/* User Actions & Credit Counter */}
      <div className="flex items-center gap-4">
        {/* Credits Counter Widget */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-glass-border/45 bg-surface-50/50">
          {usageLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-400" />
          ) : (
            <Zap className="h-3.5 w-3.5 text-brand-400 fill-current" />
          )}
          <span className="text-xs font-semibold text-text-secondary">
            {usageLoading ? (
              "..."
            ) : usage?.isUnlimited ? (
              "Unlimited"
            ) : (
              `${usage ? usage.monthlyCredits - usage.creditsUsed : 0} Credits Left`
            )}
          </span>
        </div>

        {/* Upgrade Button */}
        {planName === "FREE" && (
          <button
            onClick={() => setUpgradeModalOpen(true)}
            className="hidden md:flex h-9 items-center justify-center gap-1.5 px-4 rounded-md bg-linear-to-r from-brand-500 to-accent-400 hover:from-brand-600 hover:to-accent-500 text-white font-bold text-xs shadow-glow-sm hover:shadow-glow-md transition-all cursor-pointer border-dash"
          >
            Upgrade
          </button>
        )}

        {/* Clerk User Button */}
        <div className="flex items-center gap-2 border-l border-glass-border/20 pl-4 h-8">
          {user && (
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-semibold text-text-primary leading-none mb-0.5">{user.fullName}</span>
              <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest leading-none">{planName}</span>
            </div>
          )}
          <div className="border-corners">
            <div className="border-corners-inner flex items-center justify-center p-0.5 rounded-full">
              <UserButton 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "h-9 w-9 border border-brand-500/30 hover:border-brand-500 transition-colors shadow-glow-sm"
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
