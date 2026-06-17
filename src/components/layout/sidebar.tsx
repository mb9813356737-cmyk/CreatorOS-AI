"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useUIStore } from "@/stores/ui-store";
import { useSubscription } from "@/hooks/use-subscription";
import { useUsage } from "@/hooks/use-usage";
import { DASHBOARD_NAV, DASHBOARD_NAV_BOTTOM, APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { 
  ChevronLeft, 
  ChevronRight, 
  Lock, 
  Zap, 
  LogOut,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { SignOutButton } from "@/lib/auth";

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, setUpgradeModalOpen } = useUIStore();
  const { subscription, isPro, isAgency } = useSubscription();
  const { usage } = useUsage();

  const handleFeatureClick = (e: React.MouseEvent, requiresPlan?: string[]) => {
    if (!requiresPlan) return;
    
    const userPlan = subscription?.plan || "FREE";
    const hasAccess = requiresPlan.includes(userPlan);
    
    if (!hasAccess) {
      e.preventDefault();
      setUpgradeModalOpen(true);
    }
  };

  const activePlanName = subscription?.plan || "FREE";

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 80 : 260 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="hidden md:flex flex-col h-screen bg-linear-to-b from-surface-50 to-surface-0 border-r border-glass-border/40 shrink-0 select-none overflow-hidden"
    >
      {/* Sidebar Header */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-glass-border/20">
        <Link href="/dashboard" className="flex items-center gap-2">
          {!sidebarCollapsed ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 font-bold text-xl tracking-tight text-text-primary"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-brand-500 to-accent-400 shadow-glow-sm">
                <Sparkles className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-text-primary">Creator<span className="bg-linear-to-r from-brand-500 to-accent-400 bg-clip-text text-transparent font-black">OS</span> AI</span>
            </motion.div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-brand-500 to-accent-400 shadow-glow-sm">
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
            </div>
          )}
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-6 px-4 space-y-8 overflow-y-auto scrollbar-none">
        <div className="space-y-1">
          {DASHBOARD_NAV.map((item) => {
            const isActive = pathname === item.href;
            const userPlan = subscription?.plan || "FREE";
            const isLocked = item.requiresPlan && !item.requiresPlan.includes(userPlan);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleFeatureClick(e, item.requiresPlan as any)}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all duration-200 group cursor-pointer",
                  isActive
                    ? "bg-brand-500/10 text-brand-400 font-medium"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-100/50"
                )}
              >
                {/* Active Highlight Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1 bottom-1 w-1 rounded-full bg-brand-500 shadow-glow-sm"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                <item.icon className={cn(
                  "h-5 w-5 shrink-0 transition-transform duration-300", 
                  isActive ? "text-brand-400 scale-105" : "text-text-secondary group-hover:scale-105",
                  isLocked && "text-text-muted"
                )} />

                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 truncate"
                  >
                    {item.label}
                  </motion.span>
                )}

                {!sidebarCollapsed && isLocked && (
                  <Lock className="h-3.5 w-3.5 text-text-muted shrink-0" />
                )}

                {!sidebarCollapsed && item.badge && (
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-bold tracking-wider uppercase shrink-0",
                    item.badge === "New" ? "bg-emerald-500/20 text-emerald-400" : "bg-brand-500/20 text-brand-400"
                  )}>
                    {item.badge}
                  </span>
                )}

                {/* Collapsed Tooltip fallback */}
                {sidebarCollapsed && (
                  <div className="absolute left-16 scale-0 group-hover:scale-100 transition-transform duration-150 origin-left bg-surface-100 border border-glass-border/60 text-text-primary text-xs rounded-md py-1.5 px-3 whitespace-nowrap shadow-elevated z-50">
                    {item.label}
                    {isLocked && " (Locked)"}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Secondary/Settings Nav */}
        <div className="space-y-1 pt-6 border-t border-glass-border/20">
          {!sidebarCollapsed && (
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-3 mb-2">Account</p>
          )}
          {DASHBOARD_NAV_BOTTOM.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all duration-200 group cursor-pointer",
                  isActive
                    ? "bg-brand-500/10 text-brand-400 font-medium"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-100/50"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1 bottom-1 w-1 rounded-full bg-brand-500 shadow-glow-sm"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                <item.icon className={cn(
                  "h-5 w-5 shrink-0 transition-transform duration-300", 
                  isActive ? "text-brand-400 scale-105" : "text-text-secondary group-hover:scale-105"
                )} />

                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 truncate"
                  >
                    {item.label}
                  </motion.span>
                )}

                {sidebarCollapsed && (
                  <div className="absolute left-16 scale-0 group-hover:scale-100 transition-transform duration-150 origin-left bg-surface-100 border border-glass-border/60 text-text-primary text-xs rounded-md py-1.5 px-3 whitespace-nowrap shadow-elevated z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}

          <SignOutButton>
            <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-text-secondary hover:text-error hover:bg-error/10 transition-all duration-200 group cursor-pointer">
              <LogOut className="h-5 w-5 shrink-0 text-text-secondary group-hover:text-error transition-transform group-hover:translate-x-0.5" />
              {!sidebarCollapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  Sign Out
                </motion.span>
              )}
              {sidebarCollapsed && (
                <div className="absolute left-16 scale-0 group-hover:scale-100 transition-transform duration-150 origin-left bg-surface-100 border border-glass-border/60 text-text-primary text-xs rounded-md py-1.5 px-3 whitespace-nowrap shadow-elevated z-50">
                  Sign Out
                </div>
              )}
            </button>
          </SignOutButton>
        </div>
      </div>

      {/* Usage Panel / Footer */}
      <div className="p-4 border-t border-glass-border/20 space-y-4">
        {!sidebarCollapsed && usage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3.5 rounded-lg bg-surface-100/50 border border-glass-border/20 space-y-3"
          >
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

            {activePlanName === "FREE" && (
              <button
                onClick={() => setUpgradeModalOpen(true)}
                className="w-full h-8 flex items-center justify-center gap-1.5 rounded-md bg-linear-to-r from-brand-500 to-accent-400 hover:from-brand-600 hover:to-accent-500 text-white font-bold text-xs shadow-glow-sm hover:shadow-glow-md transition-all cursor-pointer"
              >
                <Zap className="h-3 w-3 fill-current" />
                Upgrade to Pro
              </button>
            )}
          </motion.div>
        )}

        {/* Collapsible toggle */}
        <div className="flex justify-center">
          <button
            onClick={toggleSidebar}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-glass-border/40 hover:border-brand-500/50 hover:bg-brand-500/10 text-text-secondary hover:text-brand-400 transition-colors cursor-pointer"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
