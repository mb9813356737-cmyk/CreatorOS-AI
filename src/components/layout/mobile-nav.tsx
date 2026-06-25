"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/stores/ui-store";
import { useSubscription } from "@/hooks/use-subscription";
import { useUsage } from "@/hooks/use-usage";
import { DASHBOARD_NAV, DASHBOARD_NAV_BOTTOM, APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { X, Sparkles, Lock, Zap, LogOut } from "lucide-react";
import { SignOutButton } from "@/lib/auth";

export function MobileNav() {
  const pathname = usePathname();
  const { sidebarMobileOpen, setSidebarMobileOpen, setUpgradeModalOpen, setLockedFeatureModalOpen } = useUIStore();
  const { subscription } = useSubscription();
  const { usage } = useUsage();

  const handleLinkClick = (e: React.MouseEvent, href: string, label: string, requiresPlan?: string[]) => {
    setSidebarMobileOpen(false);

    const userPlan = subscription?.plan || "FREE";
    const isFreeUser = userPlan === "FREE";
    const lockedFeatures = ["/thumbnails", "/trends", "/viral-score", "/repurpose"];

    if (isFreeUser && lockedFeatures.includes(href)) {
      e.preventDefault();
      setLockedFeatureModalOpen(true, label);
      return;
    }

    if (requiresPlan) {
      const hasAccess = requiresPlan.includes(userPlan);
      if (!hasAccess) {
        e.preventDefault();
        setUpgradeModalOpen(true);
      }
    }
  };

  const planName = subscription?.plan || "FREE";

  return (
    <AnimatePresence>
      {sidebarMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarMobileOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
            className="relative flex flex-col w-72 max-w-[80vw] h-full bg-surface-50 border-r border-glass-border p-6 shadow-cinematic z-10"
          >
            {/* Header / Close */}
            <div className="flex items-center justify-between mb-8">
              <Link href="/dashboard" onClick={() => setSidebarMobileOpen(false)} className="flex items-center gap-2 font-bold text-lg text-text-primary">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-brand-500 to-accent-400 shadow-glow-sm">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span>Creator<span className="bg-linear-to-r from-brand-500 to-accent-400 bg-clip-text text-transparent font-black">OS</span> AI</span>
              </Link>
              
              <button
                onClick={() => setSidebarMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-glass-border/40 hover:bg-surface-100 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Navigation links */}
            <div className="flex-1 space-y-6 overflow-y-auto scrollbar-none pr-1">
              <div className="space-y-1">
                {DASHBOARD_NAV.map((item) => {
                  const isActive = pathname === item.href;
                  const isFreeUser = planName === "FREE";
                  const isLocked = (item.requiresPlan && !item.requiresPlan.includes(planName)) ||
                    (isFreeUser && ["/thumbnails", "/trends", "/viral-score", "/repurpose"].includes(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={(e) => handleLinkClick(e, item.href, item.label, item.requiresPlan as any)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all duration-200 cursor-pointer",
                        isActive
                          ? "bg-brand-500/10 text-brand-400 font-medium"
                          : "text-text-secondary hover:text-text-primary hover:bg-surface-100/50"
                      )}
                    >
                      <item.icon className={cn("h-5 w-5", isActive ? "text-brand-400" : "text-text-secondary", isLocked && "text-text-muted")} />
                      <span className="flex-1 truncate flex items-center gap-1.5">
                        <span>{item.label}</span>
                        {isFreeUser && ["Thumbnails", "Trends", "Viral Score"].includes(item.label) && (
                          <span className="text-xs select-none">🔒</span>
                        )}
                      </span>
                      {isLocked && !["Thumbnails", "Trends", "Viral Score"].includes(item.label) && <Lock className="h-3.5 w-3.5 text-text-muted" />}
                      {item.badge && (
                        <span className={cn(
                          "text-[9px] px-1.5 py-0.5 rounded-full font-bold tracking-wider uppercase",
                          item.badge === "New" ? "bg-emerald-500/20 text-emerald-400" : "bg-brand-500/20 text-brand-400"
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>

              <div className="space-y-1 pt-6 border-t border-glass-border/20">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-3 mb-2">Account</p>
                {DASHBOARD_NAV_BOTTOM.map((item) => {
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all duration-200 cursor-pointer",
                        isActive
                          ? "bg-brand-500/10 text-brand-400 font-medium"
                          : "text-text-secondary hover:text-text-primary hover:bg-surface-100/50"
                      )}
                    >
                      <item.icon className={cn("h-5 w-5", isActive ? "text-brand-400" : "text-text-secondary")} />
                      <span className="flex-1 truncate">{item.label}</span>
                    </Link>
                  );
                })}

                <SignOutButton>
                  <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-text-secondary hover:text-error hover:bg-error/10 transition-all duration-200 cursor-pointer text-left">
                    <LogOut className="h-5 w-5 text-text-secondary" />
                    <span>Sign Out</span>
                  </button>
                </SignOutButton>
              </div>
            </div>

            {/* Bottom info */}
            <div className="pt-6 border-t border-glass-border/20 space-y-4 mt-auto">
              {usage && (
                <div className="p-3.5 rounded-lg bg-surface-100/50 border border-glass-border/20 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-secondary font-medium">Credits</span>
                    <span className="text-text-primary font-semibold">
                      {usage.isUnlimited ? "Unlimited" : `${usage.creditsUsed}/${usage.monthlyCredits}`}
                    </span>
                  </div>
                  
                  {!usage.isUnlimited && (
                    <div className="h-1.5 w-full bg-surface-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-linear-to-r from-brand-500 to-accent-400 rounded-full transition-all duration-500" 
                        style={{ width: `${usage.percentage}%` }}
                      />
                    </div>
                  )}

                  {planName === "FREE" && (
                    <button
                      onClick={() => {
                        setSidebarMobileOpen(false);
                        setUpgradeModalOpen(true);
                      }}
                      className="w-full h-8 flex items-center justify-center gap-1.5 rounded-md bg-linear-to-r from-brand-500 to-accent-400 hover:from-brand-600 hover:to-accent-500 text-white font-bold text-xs shadow-glow-sm hover:shadow-glow-md transition-all cursor-pointer"
                    >
                      <Zap className="h-3 w-3 fill-current" />
                      Upgrade to Pro
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
