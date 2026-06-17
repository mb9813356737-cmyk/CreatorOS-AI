"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";
import { useSubscription } from "@/hooks/use-subscription";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldAlert, 
  Users, 
  TrendingUp, 
  Cpu, 
  Settings, 
  Terminal, 
  FileText, 
  Search, 
  Bell, 
  LifeBuoy, 
  Activity, 
  LogOut,
  Maximize2,
  Sliders,
  AlertOctagon,
  ArrowRight,
  Database,
  CreditCard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Real time notification alerts feed
const ALERT_METRICS = [
  { text: "System Online (Uptime: 99.98%)", color: "text-emerald-400" },
  { text: "Live Revenue: ₹2,45,900 MRR", color: "text-brand-400" },
  { text: "Token Burns: Gemini-Flash latency steady at 380ms", color: "text-purple-400" },
  { text: "Security Warning: 2 duplicate account attempts auto-blocked", color: "text-warning-400" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const { subscription } = useSubscription();
  const [activeAlertIndex, setActiveAlertIndex] = React.useState(0);
  const [cmdSearch, setCmdSearch] = React.useState("");
  const [authorized, setAuthorized] = React.useState<boolean | null>(null);

  // Logout handler: clear cookie and redirect to admin login
  const handleExitConsole = React.useCallback(() => {
    document.cookie = "admin_session_active=; path=/; max-age=0";
    setAuthorized(false);
    router.push("/admin/login");
  }, [router]);

  // Client-side authentication guard
  React.useEffect(() => {
    const isLoginPath = window.location.pathname === "/admin/login";
    const hasAdminSession = document.cookie.includes("admin_session_active=true");

    if (!hasAdminSession && !isLoginPath) {
      setAuthorized(false);
      router.push("/admin/login");
    } else {
      setAuthorized(true);
    }
  }, [pathname, router]);

  // Rotate notifications ticker
  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveAlertIndex((prev) => (prev + 1) % ALERT_METRICS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Global hotkey listener for Cmd+K command palette
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  const adminRole = subscription?.plan === "FREE" ? "SUPER_ADMIN" : "SUPER_ADMIN"; // Fallback to Super Admin for local testing

  // Render dedicated admin login page fullscreen without dashboard sidebar shell
  const isLoginPath = pathname === "/admin/login";
  if (isLoginPath) {
    return <>{children}</>;
  }

  // Loading state while verifying credentials session cookie
  if (authorized === null) {
    return (
      <div className="min-h-screen bg-[#07080a] flex items-center justify-center text-xs text-text-secondary select-none">
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-brand-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Verifying secure admin session...</span>
        </div>
      </div>
    );
  }

  // Sidebar links
  const sidebarLinks = [
    { label: "Overview", href: "/admin", query: "overview", icon: Activity },
    { label: "User Control Matrix", href: "/admin", query: "users", icon: Users },
    { label: "Subscriptions & Coupons", href: "/admin", query: "subscriptions", icon: CreditCard },
    { label: "AI Cost Analyzer", href: "/admin", query: "ai", icon: Terminal },
    { label: "Support Tickets", href: "/admin", query: "tickets", icon: LifeBuoy, count: 2 },
    { label: "Feature Rollouts", href: "/admin", query: "flags", icon: Sliders },
    { label: "Tuning Prompts", href: "/admin", query: "prompts", icon: Settings },
    { label: "Audit Logs", href: "/admin", query: "audit", icon: FileText },
    { label: "System Control", href: "/admin", query: "system", icon: Database },
  ];

  // Commands search results
  const commands = [
    { label: "Go to Overview Dashboard", action: () => { router.push("/admin?tab=overview"); setCommandPaletteOpen(false); } },
    { label: "Manage User Profiles & Credits", action: () => { router.push("/admin?tab=users"); setCommandPaletteOpen(false); } },
    { label: "Manage Subscriptions & Coupons", action: () => { router.push("/admin?tab=subscriptions"); setCommandPaletteOpen(false); } },
    { label: "Review AI Cost & Token usage", action: () => { router.push("/admin?tab=ai"); setCommandPaletteOpen(false); } },
    { label: "Resolve Support Ticketing Queue", action: () => { router.push("/admin?tab=tickets"); setCommandPaletteOpen(false); } },
    { label: "Enable/Disable Feature Flags", action: () => { router.push("/admin?tab=flags"); setCommandPaletteOpen(false); } },
    { label: "Tune AI prompts / version tuning", action: () => { router.push("/admin?tab=prompts"); setCommandPaletteOpen(false); } },
    { label: "Export full database backup", action: () => { router.push("/admin?tab=system"); setCommandPaletteOpen(false); } },
    { label: "Exit Administration Panel", action: () => { router.push("/dashboard"); setCommandPaletteOpen(false); } },
  ];

  const filteredCommands = commands.filter(c => 
    c.label.toLowerCase().includes(cmdSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#07080a] text-text-primary flex flex-col font-sans select-none overflow-hidden relative">
      {/* Dynamic light gradient accents */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-brand-500/5 rounded-full filter blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full filter blur-[120px] pointer-events-none z-0" />

      {/* Top Banner alert ticker */}
      <div className="h-9 w-full bg-[#0d0e12] border-b border-glass-border/30 px-6 flex items-center justify-between text-xs z-30 select-none">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px] border-purple-500/30 text-purple-400 bg-purple-950/10 font-bold uppercase tracking-wider h-5 flex items-center shrink-0">
            SYSTEM TELEMETRY
          </Badge>
          <div className="overflow-hidden h-5 flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeAlertIndex}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -15, opacity: 0 }}
                transition={{ duration: 0.35 }}
                className={cn("font-medium", ALERT_METRICS[activeAlertIndex].color)}
              >
                {ALERT_METRICS[activeAlertIndex].text}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4 text-text-muted text-[10px]">
          <span>CPU: 32%</span>
          <span>RAM: 64%</span>
          <span>Redis Cache hit: 98%</span>
        </div>
      </div>

      <div className="flex flex-1 z-10 relative overflow-hidden">
        {/* Futuristic Glass Sidebar */}
        <aside className="w-64 border-r border-glass-border/30 bg-[#0d0e12]/60 backdrop-blur-xl flex flex-col justify-between shrink-0 h-[calc(100vh-36px)] z-20">
          <div className="p-4 space-y-6">
            {/* Header logo */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-linear-to-br from-brand-500 to-accent-400 flex items-center justify-center font-extrabold text-white text-sm shadow-glow-sm">
                  C
                </div>
                <div>
                  <span className="font-extrabold tracking-tight text-xs block text-text-primary">
                    Creator<span className="bg-linear-to-r from-brand-500 to-accent-400 bg-clip-text text-transparent font-extrabold">OS</span> AI
                  </span>
                  <span className="text-[9px] text-text-muted tracking-wider uppercase font-mono font-bold">Admin Console</span>
                </div>
              </div>
              <Badge variant="outline" className="border-emerald-500/20 text-emerald-400 font-mono font-black uppercase text-[8px] tracking-wide">
                SUPER ADMIN
              </Badge>
            </div>

            {/* CMD search trigger */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="w-full h-9 rounded-lg bg-surface-100/50 hover:bg-surface-100 border border-glass-border/30 hover:border-glass-border-hover/50 px-3 flex items-center justify-between text-left text-xs text-text-muted cursor-pointer transition-all select-none focus:outline-hidden"
            >
              <span className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5" />
                Quick Search...
              </span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-200 text-[9px] font-mono border border-glass-border/20">
                ⌘K
              </kbd>
            </button>

            {/* Links index */}
            <nav className="space-y-1 select-none">
              {sidebarLinks.map((link) => {
                const currentTab = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("tab") || "overview" : "overview";
                const isActive = currentTab === link.query;

                return (
                  <Link
                    key={link.label}
                    href={`${link.href}?tab=${link.query}`}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 select-none group",
                      isActive
                        ? "bg-brand-500/10 border border-brand-500/20 text-brand-400 shadow-glow-sm shadow-brand-500/5"
                        : "border border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-50/15"
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <link.icon className={cn("h-4 w-4 transition-colors", isActive ? "text-brand-400" : "text-text-muted group-hover:text-text-secondary")} />
                      {link.label}
                    </span>
                    {link.count && (
                      <span className="h-4.5 w-4.5 rounded-full bg-brand-500/20 text-brand-400 font-mono font-bold text-[9px] flex items-center justify-center border border-brand-500/30">
                        {link.count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer credentials */}
          <div className="p-4 border-t border-glass-border/10 space-y-3 bg-surface-50/10 select-none">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-surface-200 flex items-center justify-center font-extrabold text-xs text-text-primary">
                A
              </div>
              <div className="overflow-hidden">
                <span className="font-bold text-xs text-text-primary block truncate">Admin Profile</span>
                <span className="text-[10px] text-text-muted truncate block">admin@creatoros.ai</span>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExitConsole}
              className="w-full font-bold h-8 text-[11px] justify-center bg-surface-100 hover:bg-surface-200 text-text-secondary hover:text-text-primary cursor-pointer border border-glass-border/30 hover:border-glass-border-hover/50"
              leftIcon={<LogOut className="h-3.5 w-3.5" />}
            >
              Exit Console
            </Button>
          </div>
        </aside>

        {/* Content body container */}
        <main className="flex-1 overflow-y-auto h-[calc(100vh-36px)] bg-[#07080a] relative select-none">
          <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 select-none">
            {children}
          </div>
        </main>
      </div>

      {/* Global Command palette Dialog modal */}
      <Dialog
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        className="max-w-lg bg-[#0d0e12]/95 border-glass-border/40 p-0 overflow-hidden shadow-cinematic backdrop-blur-lg"
      >
        <div className="flex items-center gap-3 px-4 border-b border-glass-border/20 h-12 select-none">
          <Search className="h-4.5 w-4.5 text-text-muted" />
          <input
            type="text"
            placeholder="Type a command or route name..."
            value={cmdSearch}
            onChange={(e) => setCmdSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-hidden"
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto p-2 space-y-0.5 select-none">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-xs text-text-muted">No commands matching &ldquo;{cmdSearch}&rdquo;</div>
          ) : (
            filteredCommands.map((cmd, idx) => (
              <button
                key={idx}
                onClick={cmd.action}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-brand-500/10 text-xs font-bold hover:text-brand-400 flex items-center justify-between group cursor-pointer transition-colors"
              >
                {cmd.label}
                <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))
          )}
        </div>
        <div className="h-9 px-4 border-t border-glass-border/10 bg-surface-50/20 flex items-center justify-between text-[10px] text-text-muted font-mono select-none">
          <span>Navigate using search actions</span>
          <span>ESC to exit</span>
        </div>
      </Dialog>
    </div>
  );
}

// Inline helper component for commands list
function ChevronRight(props: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth="2.5" 
      stroke="currentColor" 
      className={props.className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}
