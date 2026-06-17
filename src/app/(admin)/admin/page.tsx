"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { 
  Users, 
  TrendingUp, 
  Terminal, 
  LifeBuoy, 
  Sliders, 
  Settings, 
  FileText, 
  Database,
  Search,
  Filter,
  Check,
  X,
  Plus,
  RefreshCw,
  UserCheck,
  Ban,
  ShieldCheck,
  Clock,
  Download,
  AlertTriangle,
  Play,
  ArrowRight,
  TrendingDown,
  Lock,
  ChevronRight,
  Cpu,
  Trash2,
  CreditCard,
  Tag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LineChart, Line, 
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { cn } from "@/lib/utils";


// Types matching API
interface UserProfile {
  id: string;
  clerkId?: string | null;
  email: string;
  name: string | null;
  role: string;
  plan: string;
  subscriptionStatus: string;
  monthlyCredits: number;
  creditsUsed: number;
  banned: boolean;
  suspendedUntil: string | null;
  createdAt: string;
}

interface PaymentRecord {
  id: string;
  userId: string;
  razorpayPaymentId: string | null;
  razorpaySubscriptionId: string | null;
  amount: number;
  status: string;
  plan: string;
  billingPeriod: string | null;
  createdAt: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  assignedTo: string | null;
  internalNote: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

interface FeatureFlag {
  id: string;
  name: string;
  description: string | null;
  isEnabled: boolean;
  rolloutPct: number;
  createdAt: string;
}

interface PromptConfig {
  id: string;
  type: string;
  description: string;
  currentVersion: string;
  content: string;
  history: Array<{
    version: string;
    date: string;
    author: string;
    notes: string;
  }>;
}

interface AuditLog {
  id: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string | null;
  details: string | null;
  createdAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  // Mounting state for charts safety
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // API State
  const [stats, setStats] = React.useState<any>(null);
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [payments, setPayments] = React.useState<PaymentRecord[]>([]);
  const [coupons, setCoupons] = React.useState<any[]>([]);
  const [tickets, setTickets] = React.useState<SupportTicket[]>([]);
  const [flags, setFlags] = React.useState<FeatureFlag[]>([]);
  const [prompts, setPrompts] = React.useState<PromptConfig[]>([]);
  const [auditLogs, setAuditLogs] = React.useState<AuditLog[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Filters for User Tab
  const [userSearch, setUserSearch] = React.useState("");
  const [userFilterPlan, setUserFilterPlan] = React.useState("all");
  const [userFilterRole, setUserFilterRole] = React.useState("all");
  const [userFilterBanned, setUserFilterBanned] = React.useState("all");

  // Selected entities for action modals
  const [selectedUser, setSelectedUser] = React.useState<UserProfile | null>(null);
  const [selectedTicket, setSelectedTicket] = React.useState<SupportTicket | null>(null);
  const [selectedPrompt, setSelectedPrompt] = React.useState<PromptConfig | null>(null);
  
  // Modal toggle flags
  const [userModalOpen, setUserModalOpen] = React.useState(false);
  const [ticketModalOpen, setTicketModalOpen] = React.useState(false);
  const [promptModalOpen, setPromptModalOpen] = React.useState(false);

  // Impersonation loader
  const [impersonating, setImpersonating] = React.useState<string | null>(null);
  const [actionProcessing, setActionProcessing] = React.useState(false);

  // System options
  const [activeModel, setActiveModel] = React.useState("gemini-flash");
  const [maintenanceMode, setMaintenanceMode] = React.useState(false);

  // Refetch active tab statistics
  const loadTabStats = React.useCallback(async () => {
    try {
      setLoading(true);
      if (activeTab === "overview") {
        const res = await fetch("/api/admin/stats");
        if (res.ok) setStats(await res.json());
      } else if (activeTab === "users") {
        const queryParams = new URLSearchParams({
          search: userSearch,
          plan: userFilterPlan,
          role: userFilterRole,
          banned: userFilterBanned,
        });
        const res = await fetch(`/api/admin/users?${queryParams}`);
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users);
        }
      } else if (activeTab === "subscriptions") {
        const res = await fetch("/api/admin/subscriptions");
        if (res.ok) {
          const data = await res.json();
          setPayments(data.payments || []);
          setCoupons(data.coupons || []);
        }
      } else if (activeTab === "ai") {
        // AI usage and Cost telemetry loads from stats as well
        const res = await fetch("/api/admin/stats");
        if (res.ok) setStats(await res.json());
      } else if (activeTab === "tickets") {
        const res = await fetch("/api/admin/tickets");
        if (res.ok) {
          const data = await res.json();
          setTickets(data.tickets);
        }
      } else if (activeTab === "flags") {
        const res = await fetch("/api/admin/flags");
        if (res.ok) {
          const data = await res.json();
          setFlags(data.flags);
        }
      } else if (activeTab === "prompts") {
        const res = await fetch("/api/admin/prompts");
        if (res.ok) {
          const data = await res.json();
          setPrompts(data.prompts);
        }
      } else if (activeTab === "audit") {
        const res = await fetch("/api/admin/audit");
        if (res.ok) {
          const data = await res.json();
          setAuditLogs(data.auditLogs);
        }
      } else if (activeTab === "system") {
        const res = await fetch("/api/admin/stats");
        if (res.ok) setStats(await res.json());

        const sysRes = await fetch("/api/admin/system");
        if (sysRes.ok) {
          const sysData = await sysRes.json();
          setActiveModel(sysData.activeModel);
          setMaintenanceMode(sysData.maintenanceMode);
        }
      }
    } catch (err) {
      console.error("Error loading admin stats:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, userSearch, userFilterPlan, userFilterRole, userFilterBanned]);

  React.useEffect(() => {
    loadTabStats();
  }, [activeTab, loadTabStats]);

  // Impersonate User Click Trigger
  const handleImpersonateUser = async (targetUser: UserProfile) => {
    try {
      setImpersonating(targetUser.id);
      
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "impersonate_start",
          targetUserId: targetUser.id,
        }),
      });

      if (res.ok) {
        // Impersonation successful, redirect to client user dashboard page
        alert(`Successfully acting as creator ${targetUser.name || targetUser.email}! Redirecting...`);
        router.push("/dashboard");
      } else {
        alert("Failed to start impersonation");
      }
    } catch (err) {
      console.error(err);
      alert("Error setting up impersonation");
    } finally {
      setImpersonating(null);
    }
  };

  // Adjust User Details POST triggers (refills, role, ban, suspension)
  const handleModifyUser = async (action: string, payload: any) => {
    if (!selectedUser) return;
    try {
      setActionProcessing(true);
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          targetUserId: selectedUser.id,
          ...payload,
        }),
      });

      if (res.ok) {
        setUserModalOpen(false);
        loadTabStats();
        alert(`Admin profile adjustment successful.`);
      } else {
        alert("Failed to perform administration action");
      }
    } catch (err) {
      console.error(err);
      alert("Error modifying user details");
    } finally {
      setActionProcessing(false);
    }
  };

  // Update support ticket details (assignment, resolution)
  const handleModifyTicket = async (payload: any) => {
    if (!selectedTicket) return;
    try {
      setActionProcessing(true);
      const res = await fetch("/api/admin/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          ...payload,
        }),
      });

      if (res.ok) {
        setTicketModalOpen(false);
        loadTabStats();
        alert(`Support ticket status updated.`);
      } else {
        alert("Failed to modify support ticket");
      }
    } catch (err) {
      console.error(err);
      alert("Error modifying support ticket");
    } finally {
      setActionProcessing(false);
    }
  };

  // Update feature flag canary configurations
  const handleModifyFlag = async (flagId: string, isEnabled: boolean, rolloutPct: number) => {
    try {
      const res = await fetch("/api/admin/flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          flagId,
          isEnabled,
          rolloutPct,
        }),
      });

      if (res.ok) {
        loadTabStats();
      } else {
        alert("Failed to update feature flag configuration");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create new feature flag
  const handleCreateFlag = async (name: string, description: string) => {
    try {
      setActionProcessing(true);
      const res = await fetch("/api/admin/flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          name,
          description,
        }),
      });

      if (res.ok) {
        loadTabStats();
        alert("Canary feature flag created successfully.");
      } else {
        alert("Failed to create feature flag");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionProcessing(false);
    }
  };

  // Update system configurations persistently on server
  const handleUpdateSystemConfig = async (payload: { activeModel?: string; maintenanceMode?: boolean }) => {
    try {
      setActionProcessing(true);
      const res = await fetch("/api/admin/system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setActiveModel(data.settings.activeModel);
          setMaintenanceMode(data.settings.maintenanceMode);
        }
      } else {
        alert("Failed to save system settings.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating settings.");
    } finally {
      setActionProcessing(false);
    }
  };

  // Refund individual payments
  const handleRefundPayment = async (paymentId: string) => {
    if (!confirm("Are you sure you want to refund this payment? This action is irreversible.")) return;
    try {
      setActionProcessing(true);
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "refund",
          paymentId,
        }),
      });

      if (res.ok) {
        loadTabStats();
        alert("Payment refunded successfully.");
      } else {
        alert("Failed to process payment refund");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionProcessing(false);
    }
  };

  // Toggle active/inactive coupon codes
  const handleToggleCoupon = async (code: string) => {
    try {
      setActionProcessing(true);
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggleCoupon",
          code,
        }),
      });

      if (res.ok) {
        loadTabStats();
      } else {
        alert("Failed to toggle coupon status");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionProcessing(false);
    }
  };

  // Delete coupon codes
  const handleDeleteCoupon = async (code: string) => {
    if (!confirm(`Are you sure you want to delete coupon code ${code}?`)) return;
    try {
      setActionProcessing(true);
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "deleteCoupon",
          code,
        }),
      });

      if (res.ok) {
        loadTabStats();
      } else {
        alert("Failed to delete coupon");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionProcessing(false);
    }
  };

  // Create new coupon codes
  const handleCreateCoupon = async (code: string, discount: number, type: string) => {
    try {
      setActionProcessing(true);
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createCoupon",
          code,
          discount,
          type,
        }),
      });

      if (res.ok) {
        loadTabStats();
        alert("New coupon code registered successfully.");
      } else {
        alert("Failed to create coupon code");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionProcessing(false);
    }
  };

  // Backup trigger (Manual full JSON dump utility)
  const handleDownloadBackup = async () => {
    try {
      setActionProcessing(true);
      const res = await fetch("/api/admin/backups", {
        method: "POST",
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `creatoros-backup-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        alert("Database dump generated and downloaded successfully.");
      } else {
        alert("Failed to compile database backup");
      }
    } catch (err) {
      console.error(err);
      alert("Backup error");
    } finally {
      setActionProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Tab Switch Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-glass-border/20 pb-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary capitalize flex items-center gap-2 tracking-tight">
            Admin Console: <span className="gradient-text">{activeTab.replace("-", " ")}</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Global monitoring control board, financial audits, rollouts flags, and prompt diagnostics.
          </p>
        </div>
        <Button 
          onClick={loadTabStats} 
          variant="secondary" 
          size="sm" 
          className="bg-surface-100 hover:bg-surface-200 border border-glass-border/30 hover:border-glass-border-hover/50 text-xs font-bold shrink-0 cursor-pointer"
          leftIcon={<RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />}
        >
          Refresh Statistics
        </Button>
      </div>

      {/* Tab Panels with Staggered animations */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          {loading ? (
            <div className="py-24 text-center text-xs text-text-secondary flex flex-col items-center justify-center gap-3">
              <RefreshCw className="h-6 w-6 animate-spin text-brand-400" />
              <span>Fetching telemetry data...</span>
            </div>
          ) : (
            <>
              {/* OVERVIEW PANEL */}
              {activeTab === "overview" && stats && (
                <div className="space-y-6">
                  {/* Financial operations metrics grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card variant="glass" className="p-5 flex flex-col justify-between h-32 hover:translate-y-[-2px] hover:border-brand-500/30 transition-all border-glass-border/30 shadow-glow-sm shadow-brand-500/1 text-left">
                      <CardHeader className="p-0 flex flex-row items-center justify-between text-text-muted">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Monthly Recurring Revenue</span>
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                      </CardHeader>
                      <CardContent className="p-0 mt-3">
                        <span className="text-2xl font-black text-text-primary">₹{(stats.mrr / 100).toLocaleString("en-IN")}</span>
                        <div className="text-[9px] text-emerald-400 font-extrabold mt-1 uppercase flex items-center gap-1 select-none">
                          <span>+{stats.revenueGrowthPct}% vs last month</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card variant="glass" className="p-5 flex flex-col justify-between h-32 hover:translate-y-[-2px] hover:border-brand-500/30 transition-all border-glass-border/30 text-left">
                      <CardHeader className="p-0 flex flex-row items-center justify-between text-text-muted">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Annual Run Rate</span>
                        <ShieldCheck className="h-4 w-4 text-brand-400" />
                      </CardHeader>
                      <CardContent className="p-0 mt-3">
                        <span className="text-2xl font-black text-text-primary">₹{(stats.arr / 100).toLocaleString("en-IN")}</span>
                        <div className="text-[9px] text-text-muted mt-1 font-mono uppercase">Calculated Arr forecast</div>
                      </CardContent>
                    </Card>

                    <Card variant="glass" className="p-5 flex flex-col justify-between h-32 hover:translate-y-[-2px] hover:border-brand-500/30 transition-all border-glass-border/30 text-left">
                      <CardHeader className="p-0 flex flex-row items-center justify-between text-text-muted">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Active paid Users</span>
                        <Users className="h-4 w-4 text-brand-400" />
                      </CardHeader>
                      <CardContent className="p-0 mt-3">
                        <span className="text-2xl font-black text-text-primary">{stats.activeSubscriptions}</span>
                        <div className="text-[9px] text-text-muted mt-1 uppercase">Pro & Agency accounts</div>
                      </CardContent>
                    </Card>

                    <Card variant="glass" className="p-5 flex flex-col justify-between h-32 hover:translate-y-[-2px] hover:border-brand-500/30 transition-all border-glass-border/30 text-left">
                      <CardHeader className="p-0 flex flex-row items-center justify-between text-text-muted">
                        <span className="text-[10px] font-bold uppercase tracking-wider">SaaS Churn Rate</span>
                        <TrendingDown className="h-4 w-4 text-error-400" />
                      </CardHeader>
                      <CardContent className="p-0 mt-3">
                        <span className="text-2xl font-black text-text-primary">{stats.churnRate}%</span>
                        <div className="text-[9px] text-error-400 font-extrabold mt-1 uppercase select-none">Average industry benchmarks</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recharts graph panel */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card variant="glass" className="lg:col-span-2 p-6 flex flex-col justify-between min-h-[350px]">
                      <CardHeader className="p-0 mb-6 text-left">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                          <TrendingUp className="h-4.5 w-4.5 text-brand-400" />
                          Monthly Revenue vs OpenAI/Gemini cost log
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 h-64">
                        {mounted && (
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.mrrHistory}>
                              <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25}/>
                                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.25}/>
                                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                              <XAxis dataKey="month" stroke="rgba(255, 255, 255, 0.4)" fontSize={10} />
                              <YAxis stroke="rgba(255, 255, 255, 0.4)" fontSize={10} />
                              <Tooltip contentStyle={{ backgroundColor: "#0d0e12", borderColor: "rgba(255, 255, 255, 0.15)", borderRadius: "8px" }} />
                              <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (INR)" />
                              <Area type="monotone" dataKey="spend" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#colorSpend)" name="AI spend (INR)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        )}
                      </CardContent>
                    </Card>

                    {/* Server status telemetry */}
                    <Card variant="glass" className="p-6 flex flex-col justify-between">
                      <CardHeader className="p-0 mb-6 text-left">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                          <Sliders className="h-4.5 w-4.5 text-brand-400" />
                          System Health telemetry
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 space-y-5">
                        <div className="space-y-1.5 text-left">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>CPU utilization</span>
                            <span className="font-bold font-mono text-brand-400">{stats.systemHealth.cpuUsagePct}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-surface-100 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${stats.systemHealth.cpuUsagePct}%` }} className="h-full bg-brand-500 shadow-glow-sm" />
                          </div>
                        </div>

                        <div className="space-y-1.5 text-left">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>RAM memory usage</span>
                            <span className="font-bold font-mono text-pink-400">{stats.systemHealth.memoryUsagePct}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-surface-100 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${stats.systemHealth.memoryUsagePct}%` }} className="h-full bg-pink-500 shadow-glow-sm" />
                          </div>
                        </div>

                        <div className="space-y-1.5 text-left">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>PostgreSQL DB Latency</span>
                            <span className="font-bold font-mono text-emerald-400">{stats.systemHealth.dbLatencyMs} ms</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-surface-100 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, stats.systemHealth.dbLatencyMs * 4)}%` }} className="h-full bg-emerald-500 shadow-glow-sm" />
                          </div>
                        </div>

                        <div className="p-3.5 rounded-lg bg-surface-100/50 border border-glass-border/30 flex justify-between items-center text-xs">
                          <span>Redis Cache Hit Rate:</span>
                          <span className="font-bold text-emerald-400">{stats.systemHealth.redisCacheHitRate}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Live Activity Feed */}
                  <Card variant="glass" className="p-6">
                    <CardHeader className="p-0 mb-4 border-b border-glass-border/20 pb-3 text-left">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Users className="h-4.5 w-4.5 text-brand-400" />
                        Live Operations activity ticker
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 divide-y divide-glass-border/10">
                      {stats.liveActivity.map((activity: any) => (
                        <div key={activity.id} className="py-3 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant={activity.type === "signup" ? "success" : activity.type === "payment" ? "gradient" : activity.type === "ban" ? "error" : "secondary"} 
                              className="text-[9px] font-mono font-bold uppercase"
                            >
                              {activity.type}
                            </Badge>
                            <span className="font-bold text-text-primary">{activity.user}</span>
                            <span className="text-text-secondary">{activity.desc}</span>
                          </div>
                          <span className="text-text-muted font-mono text-[10px]">{activity.time}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* USER CONTROL PANEL */}
              {activeTab === "users" && (
                <div className="space-y-6">
                  {/* Users search filters */}
                  <Card variant="glass" className="p-4 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                      <input
                        type="text"
                        placeholder="Search by name, email or User ID..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full h-9 bg-surface-100/50 hover:bg-surface-100 border border-glass-border/30 hover:border-glass-border-hover/50 rounded-lg pl-9 pr-4 text-xs focus:outline-hidden"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                      <select 
                        value={userFilterPlan} 
                        onChange={(e) => setUserFilterPlan(e.target.value)}
                        className="h-9 bg-[#0d0e12] border border-glass-border/30 hover:border-glass-border-hover/50 rounded-lg px-2 text-xs focus:outline-hidden text-text-secondary"
                      >
                        <option value="all">All Plans</option>
                        <option value="FREE">Starter</option>
                        <option value="PRO">Pro</option>
                        <option value="AGENCY">Agency</option>
                      </select>

                      <select 
                        value={userFilterRole} 
                        onChange={(e) => setUserFilterRole(e.target.value)}
                        className="h-9 bg-[#0d0e12] border border-glass-border/30 hover:border-glass-border-hover/50 rounded-lg px-2 text-xs focus:outline-hidden text-text-secondary"
                      >
                        <option value="all">All Roles</option>
                        <option value="USER">User</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                        <option value="FINANCE_ADMIN">Finance Admin</option>
                      </select>

                      <select 
                        value={userFilterBanned} 
                        onChange={(e) => setUserFilterBanned(e.target.value)}
                        className="h-9 bg-[#0d0e12] border border-glass-border/30 hover:border-glass-border-hover/50 rounded-lg px-2 text-xs focus:outline-hidden text-text-secondary"
                      >
                        <option value="all">Banned Status</option>
                        <option value="true">Banned</option>
                        <option value="false">Active Only</option>
                      </select>

                      <Button onClick={loadTabStats} size="sm" className="bg-brand-500 font-bold h-9">
                        Apply Filters
                      </Button>
                    </div>
                  </Card>

                  {/* Users Table */}
                  <Card variant="glass" className="overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-glass-border/20 text-[10px] font-bold text-text-muted uppercase bg-surface-50/20">
                            <th className="px-6 py-4">Name / Email</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Active Plan</th>
                            <th className="px-6 py-4">Credit Balance</th>
                            <th className="px-6 py-4">Account status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-glass-border/10">
                          {users.map((u) => (
                            <tr key={u.id} className="hover:bg-surface-50/15 transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-bold text-text-primary">{u.name || "Anonymous"}</div>
                                <div className="text-[10px] text-text-muted mt-0.5 select-all">{u.email}</div>
                              </td>
                              <td className="px-6 py-4">
                                <Badge variant="outline" className="text-[9px] font-mono font-bold uppercase">{u.role}</Badge>
                              </td>
                              <td className="px-6 py-4">
                                <Badge variant={u.plan === "FREE" ? "outline" : "gradient"} className="text-[9px] font-mono font-bold uppercase">{u.plan}</Badge>
                              </td>
                              <td className="px-6 py-4 font-mono font-bold text-text-secondary">
                                {u.monthlyCredits === -1 ? "Unlimited" : `${u.creditsUsed} / ${u.monthlyCredits} used`}
                              </td>
                              <td className="px-6 py-4">
                                <Badge variant={u.banned ? "error" : "success"} className="text-[9px] font-bold uppercase">
                                  {u.banned ? "Banned" : "Active"}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 text-right space-x-2">
                                <Button 
                                  onClick={() => handleImpersonateUser(u)} 
                                  isLoading={impersonating === u.id}
                                  variant="secondary"
                                  size="sm"
                                  className="text-[9px] font-extrabold uppercase border border-glass-border/30 hover:bg-surface-100"
                                >
                                  Impersonate
                                </Button>
                                <Button 
                                  onClick={() => { setSelectedUser(u); setUserModalOpen(true); }}
                                  variant="outline"
                                  size="sm"
                                  className="text-[9px] font-extrabold uppercase"
                                >
                                  Manage
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}

              {/* SUBSCRIPTIONS & TRANSACTIONS PANEL */}
              {activeTab === "subscriptions" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Side: Recent Transactions List */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card variant="glass" className="p-6">
                      <CardHeader className="p-0 mb-4 border-b border-glass-border/20 pb-3 text-left">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                          <CreditCard className="h-4.5 w-4.5 text-brand-400" />
                          Recent Transactions Logs
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-glass-border/20 text-[10px] font-bold text-text-muted uppercase bg-surface-50/20">
                              <th className="px-4 py-3">Transaction ID</th>
                              <th className="px-4 py-3">Plan</th>
                              <th className="px-4 py-3">Amount</th>
                              <th className="px-4 py-3">Period</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-glass-border/10">
                            {payments.map((p) => (
                              <tr key={p.id} className="hover:bg-surface-50/15 transition-colors">
                                <td className="px-4 py-3">
                                  <div className="font-mono font-bold text-text-primary">{p.razorpayPaymentId || p.id}</div>
                                  <div className="text-[9px] text-text-muted mt-0.5 font-mono select-all">User Ref: {p.userId}</div>
                                </td>
                                <td className="px-4 py-3">
                                  <Badge variant="gradient" className="text-[9px] font-mono font-bold uppercase">{p.plan}</Badge>
                                </td>
                                <td className="px-4 py-3 font-mono font-bold text-text-secondary">
                                  ₹{(p.amount / 100).toLocaleString("en-IN")}
                                </td>
                                <td className="px-4 py-3 font-mono capitalize text-[10px]">
                                  {p.billingPeriod || "Monthly"}
                                </td>
                                <td className="px-4 py-3">
                                  <Badge 
                                    variant={p.status === "SUCCESS" ? "success" : p.status === "REFUNDED" ? "secondary" : "error"} 
                                    className="text-[9px] font-bold uppercase"
                                  >
                                    {p.status}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  {p.status === "SUCCESS" && (
                                    <Button 
                                      onClick={() => handleRefundPayment(p.id)}
                                      variant="outline"
                                      size="sm"
                                      className="text-[9px] font-extrabold uppercase border-error-500/20 text-error-400 hover:bg-error-500/10 cursor-pointer h-7"
                                    >
                                      Refund
                                    </Button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Side: Coupons Management */}
                  <div className="space-y-6">
                    {/* Create Coupon Card */}
                    <Card variant="glass" className="p-5 border-glass-border/30">
                      <CardHeader className="p-0 mb-4 text-left">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                          <Plus className="h-4.5 w-4.5 text-brand-400" />
                          Create New Coupon
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <form 
                          onSubmit={async (e) => {
                            e.preventDefault();
                            const form = e.currentTarget;
                            const code = (form.elements.namedItem("coupon-code") as HTMLInputElement).value;
                            const discount = (form.elements.namedItem("coupon-discount") as HTMLInputElement).value;
                            const type = (form.elements.namedItem("coupon-type") as HTMLSelectElement).value;
                            if (!code || !discount) return;
                            await handleCreateCoupon(code, Number(discount), type);
                            form.reset();
                          }}
                          className="space-y-4 text-left"
                        >
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Coupon Code</label>
                            <input
                              type="text"
                              name="coupon-code"
                              placeholder="e.g. FESTIVE50"
                              required
                              className="w-full h-9 bg-[#0d0e12] border border-glass-border/30 hover:border-glass-border-hover/50 rounded-lg px-3 text-xs focus:outline-hidden text-text-primary font-mono uppercase"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Value</label>
                              <input
                                type="number"
                                name="coupon-discount"
                                placeholder="50"
                                required
                                className="w-full h-9 bg-[#0d0e12] border border-glass-border/30 hover:border-glass-border-hover/50 rounded-lg px-3 text-xs focus:outline-hidden text-text-primary"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Type</label>
                              <select
                                name="coupon-type"
                                className="w-full h-9 bg-[#0d0e12] border border-glass-border/30 hover:border-glass-border-hover/50 rounded-lg px-2 text-xs focus:outline-hidden text-text-secondary"
                              >
                                <option value="percentage">Percent (%)</option>
                                <option value="flat">Flat (₹)</option>
                              </select>
                            </div>
                          </div>

                          <Button type="submit" isLoading={actionProcessing} className="w-full bg-brand-500 font-bold h-9">
                            Register Coupon Code
                          </Button>
                        </form>
                      </CardContent>
                    </Card>

                    {/* Active Coupons List Card */}
                    <Card variant="glass" className="p-5 border-glass-border/30">
                      <CardHeader className="p-0 mb-4 text-left">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                          <Tag className="h-4.5 w-4.5 text-brand-400" />
                          Canary Coupon Codes
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 space-y-3.5 text-left">
                        {coupons.map((c) => (
                          <div key={c.code} className="p-3 rounded-lg border border-glass-border/20 bg-surface-50/20 flex items-center justify-between group">
                            <div className="space-y-1 text-left">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs text-text-primary uppercase tracking-wider">{c.code}</span>
                                <Badge variant={c.active ? "success" : "secondary"} className="text-[8px] px-1.5 h-4.5 flex items-center font-bold">
                                  {c.active ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              <div className="text-[10px] text-text-secondary">
                                Discount: <span className="font-bold text-text-primary">{c.type === "percentage" ? `${c.discount}%` : `₹${c.discount}`}</span>
                                <span className="mx-2">•</span>
                                Usages: <span className="font-bold text-text-primary">{c.usageCount}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleToggleCoupon(c.code)}
                                className={cn(
                                  "relative h-4.5 w-8 rounded-full border border-glass-border transition-colors flex items-center p-0.5 cursor-pointer",
                                  c.active ? "bg-brand-500" : "bg-surface-100"
                                )}
                              >
                                <div className={cn("h-3.2 w-3.2 rounded-full bg-white transition-all", c.active ? "translate-x-3.2" : "translate-x-0")} />
                              </button>
                              <button
                                onClick={() => handleDeleteCoupon(c.code)}
                                className="p-1 rounded hover:bg-error/10 text-text-muted hover:text-error opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                title="Delete coupon"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* AI COST PANEL */}
              {activeTab === "ai" && stats && (
                <div className="space-y-6">
                  {/* Recharts chart mappings */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card variant="glass" className="lg:col-span-2 p-6 min-h-[350px]">
                      <CardHeader className="p-0 mb-6 text-left">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                          <Terminal className="h-4.5 w-4.5 text-brand-400" />
                          Daily cost calculation vs margin ratios
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 h-64">
                        {mounted && (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.aiUsage.dailyCosts}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                              <XAxis dataKey="day" stroke="rgba(255, 255, 255, 0.4)" fontSize={10} />
                              <YAxis stroke="rgba(255, 255, 255, 0.4)" fontSize={10} />
                              <Tooltip contentStyle={{ backgroundColor: "#0d0e12", borderColor: "rgba(255, 255, 255, 0.15)", borderRadius: "8px" }} />
                              <Legend />
                              <Bar dataKey="cost" fill="#ec4899" name="AI costs (paise)" />
                              <Bar dataKey="profit" fill="#7c3aed" name="Net profit (paise)" />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </CardContent>
                    </Card>

                    {/* LLM providers latencies radar */}
                    <Card variant="glass" className="p-6 flex flex-col justify-between">
                      <CardHeader className="p-0 mb-4 text-left">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                          <Cpu className="h-4.5 w-4.5 text-brand-400" />
                          AI Model Active switches
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 space-y-4">
                        <div className="text-left text-xs font-semibold space-y-1.5">
                          <span>Primary Active model</span>
                          <select 
                            value={activeModel} 
                            onChange={async (e) => {
                              const newModel = e.target.value;
                              setActiveModel(newModel);
                              await handleUpdateSystemConfig({ activeModel: newModel });
                            }}
                            className="w-full h-9 bg-[#0d0e12] border border-glass-border/30 hover:border-glass-border-hover/50 rounded-lg px-2 text-xs focus:outline-hidden text-text-secondary"
                          >
                            <option value="gemini-flash">Google Gemini 2.5 Flash (Primary)</option>
                            <option value="gpt-4o">OpenAI GPT-4o</option>
                            <option value="llama3-groq">Groq Llama 3 70B (Low Latency)</option>
                          </select>
                        </div>

                        <div className="p-3.5 rounded-lg bg-surface-100/50 border border-glass-border/30 text-xs text-left">
                          <h4 className="font-bold text-text-primary flex items-center gap-1.5 mb-1.5">
                            <ShieldCheck className="h-4 w-4 text-brand-400" />
                            Model Failover active rules:
                          </h4>
                          <p className="text-[11px] text-text-secondary leading-relaxed">
                            If primary model latencies exceed **1200ms** or error rate rises above **2%**, traffic automatically routes to secondary Llama3 backup nodes.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* SUPPORT TICKETS PANEL */}
              {activeTab === "tickets" && (
                <div className="space-y-6 select-none">
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-text-primary mb-3">Customer Support Live Queue</h3>
                  </div>
                  
                  <Card variant="glass" className="overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-glass-border/20 text-[10px] font-bold text-text-muted uppercase bg-surface-50/20">
                            <th className="px-6 py-4">Ticket ID</th>
                            <th className="px-6 py-4">Subject</th>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Priority</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Moderation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-glass-border/10">
                          {tickets.map((t) => (
                            <tr key={t.id} className="hover:bg-surface-50/15 transition-colors">
                              <td className="px-6 py-4 font-mono font-bold text-brand-400">{t.id}</td>
                              <td className="px-6 py-4">
                                <div className="font-bold text-text-primary truncate max-w-xs">{t.subject}</div>
                                <div className="text-[10px] text-text-muted mt-0.5 truncate max-w-sm">{t.message}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="font-semibold text-text-secondary">{t.user.name}</div>
                                <div className="text-[9px] text-text-muted mt-0.5 select-all">{t.user.email}</div>
                              </td>
                              <td className="px-6 py-4">
                                <Badge 
                                  variant={t.priority === "URGENT" ? "error" : t.priority === "HIGH" ? "warning" : "secondary"}
                                  className="text-[9px] font-bold uppercase"
                                >
                                  {t.priority}
                                </Badge>
                              </td>
                              <td className="px-6 py-4">
                                <Badge 
                                  variant={t.status === "OPEN" ? "default" : t.status === "IN_PROGRESS" ? "warning" : "success"}
                                  className="text-[9px] font-bold uppercase"
                                >
                                  {t.status}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <Button 
                                  onClick={() => { setSelectedTicket(t); setTicketModalOpen(true); }}
                                  variant="outline"
                                  size="sm"
                                  className="text-[9px] font-extrabold uppercase"
                                >
                                  Open details
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}

              {/* FEATURE FLAGS ROLLOUTS */}
              {activeTab === "flags" && (
                <div className="space-y-6 select-none">
                  <div className="text-left flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-text-primary">Canary Feature Flag Rollouts</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {flags.map((flag) => (
                      <Card key={flag.id} variant="glass" className="p-5 flex flex-col justify-between h-48 border-glass-border/30">
                        <div className="space-y-2 text-left">
                          <div className="flex justify-between items-center">
                            <h4 className="font-bold text-sm text-text-primary font-mono">{flag.name}</h4>
                            <button
                              onClick={() => handleModifyFlag(flag.id, !flag.isEnabled, flag.rolloutPct)}
                              className={cn(
                                "relative h-5 w-10 rounded-full border border-glass-border transition-colors flex items-center p-0.5 cursor-pointer",
                                flag.isEnabled ? "bg-brand-500" : "bg-surface-100"
                              )}
                            >
                              <div className={cn("h-3.8 w-3.8 rounded-full bg-white transition-all shadow-glow-sm", flag.isEnabled ? "translate-x-4.5" : "translate-x-0")} />
                            </button>
                          </div>
                          <p className="text-[11px] text-text-secondary leading-relaxed h-12 overflow-hidden">{flag.description}</p>
                        </div>
                        
                        <div className="pt-3 border-t border-glass-border/10 space-y-1.5 text-left">
                          <div className="flex justify-between text-[10px] text-text-secondary">
                            <span>Canary rollout percentage:</span>
                            <span className="font-bold text-brand-400 font-mono">{flag.rolloutPct}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="10"
                            value={flag.rolloutPct}
                            onChange={(e) => handleModifyFlag(flag.id, flag.isEnabled, Number(e.target.value))}
                            className="w-full accent-brand-500 bg-surface-100 cursor-pointer h-1.5 rounded-lg"
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* TUNING PROMPTS PANEL */}
              {activeTab === "prompts" && (
                <div className="space-y-6 text-left select-none">
                  <div className="text-left mb-3">
                    <h3 className="text-sm font-bold text-text-primary">AI Prompt Version Management</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                    {prompts.map((p) => (
                      <Card key={p.id} variant="glass" className="p-5 flex flex-col justify-between border-glass-border/30">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <Badge variant="outline" className="text-[8px] font-mono font-bold uppercase">{p.type}</Badge>
                            <span className="text-[10px] text-text-muted font-bold">Active: {p.currentVersion}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-text-primary mt-1">Prompt template details</h4>
                            <p className="text-[11px] text-text-secondary leading-relaxed mt-1">{p.description}</p>
                          </div>
                          
                          <div className="p-2.5 rounded bg-[#0d0e12] border border-glass-border/20 font-mono text-[9px] text-text-muted line-clamp-4 leading-relaxed">
                            {p.content}
                          </div>
                        </div>

                        <CardFooter className="p-0 border-t-0 mt-5 flex justify-end">
                          <Button 
                            onClick={() => { setSelectedPrompt(p); setPromptModalOpen(true); }}
                            size="sm"
                            className="w-full text-[10px] font-extrabold uppercase bg-brand-500/10 border border-brand-500/20 text-brand-400 hover:bg-brand-500/20 cursor-pointer"
                          >
                            Edit Prompt Templates & Rollbacks
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* AUDIT SECURITY LOGS */}
              {activeTab === "audit" && (
                <div className="space-y-6 select-none">
                  <div className="text-left flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-text-primary">Admin Action Audit log</h3>
                  </div>

                  <Card variant="glass" className="overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-glass-border/20 text-[10px] font-bold text-text-muted uppercase bg-surface-50/20">
                            <th className="px-6 py-4">Action</th>
                            <th className="px-6 py-4">Admin Email</th>
                            <th className="px-6 py-4">Change detail description</th>
                            <th className="px-6 py-4">Target Type</th>
                            <th className="px-6 py-4 text-right">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-glass-border/10">
                          {auditLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-surface-50/15 transition-colors">
                              <td className="px-6 py-4 font-mono font-bold text-brand-400 text-[10px]">{log.action}</td>
                              <td className="px-6 py-4 select-all">{log.adminEmail}</td>
                              <td className="px-6 py-4 text-text-secondary">{log.details}</td>
                              <td className="px-6 py-4">
                                <Badge variant="outline" className="text-[9px] font-mono font-bold uppercase">{log.targetType}</Badge>
                              </td>
                              <td className="px-6 py-4 text-right text-text-muted font-mono text-[10px]">
                                {new Date(log.createdAt).toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}

              {/* SYSTEM PANEL */}
              {activeTab === "system" && (
                <div className="space-y-6 text-left select-none">
                  <div className="text-left mb-3">
                    <h3 className="text-sm font-bold text-text-primary">System Utilities Configuration</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* DB manual backups trigger */}
                    <Card variant="glass" className="p-6 flex flex-col justify-between h-48 border-glass-border/30">
                      <div className="space-y-2">
                        <h4 className="font-bold text-sm text-text-primary flex items-center gap-1.5">
                          <Database className="h-4.5 w-4.5 text-brand-400" />
                          Compile database manual Backup
                        </h4>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          Generate a comprehensive backup JSON document representing payments, users, tickets, and feature flags. Download instantly to storage records.
                        </p>
                      </div>

                      <Button 
                        onClick={handleDownloadBackup}
                        isLoading={actionProcessing}
                        className="bg-brand-500 font-bold w-full"
                        leftIcon={<Download className="h-4 w-4" />}
                      >
                        Download Backup JSON Dump
                      </Button>
                    </Card>

                    {/* Maintenance toggle switch */}
                    <Card variant="glass" className="p-6 flex flex-col justify-between h-48 border-glass-border/30">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-sm text-text-primary flex items-center gap-1.5">
                            <Lock className="h-4.5 w-4.5 text-pink-400" />
                            SaaS Maintenance Mode
                          </h4>
                          <button
                            onClick={async () => {
                              const newMode = !maintenanceMode;
                              setMaintenanceMode(newMode);
                              await handleUpdateSystemConfig({ maintenanceMode: newMode });
                            }}
                            className={cn(
                              "relative h-5 w-10 rounded-full border border-glass-border transition-colors flex items-center p-0.5 cursor-pointer",
                              maintenanceMode ? "bg-pink-500 shadow-glow-sm shadow-pink-500/20" : "bg-surface-100"
                            )}
                          >
                            <div className={cn("h-3.8 w-3.8 rounded-full bg-white transition-all", maintenanceMode ? "translate-x-4.5" : "translate-x-0")} />
                          </button>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          Scheduled maintenance disables AI routes and payments access, warning users with standard offline landing banners. Enable only during emergency deployments.
                        </p>
                      </div>
                      
                      {maintenanceMode && (
                        <div className="flex items-center gap-1.5 text-[10px] text-pink-400 font-bold uppercase tracking-wider select-none animate-pulse">
                          <AlertTriangle className="h-4.5 w-4.5" />
                          <span>Warning: System Lockdown in progress!</span>
                        </div>
                      )}
                    </Card>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* USER MANAGEMENT DIALOG */}
      <Dialog
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        title="Admin User Management Control Matrix"
        description="Inspect activity parameters, adjust credits quota limits, alter roles, or toggle ban flags."
        className="max-w-md bg-[#0d0e12]/95 border-glass-border/40 text-left"
      >
        {selectedUser && (
          <div className="space-y-6 pt-4 text-xs select-none">
            <div className="p-3 rounded-lg bg-surface-100/50 border border-glass-border/20 space-y-1.5">
              <div className="font-bold text-sm">{selectedUser.name || "Anonymous User"}</div>
              <div className="text-[10px] text-text-secondary select-all">{selectedUser.email}</div>
              <div className="text-[9px] text-text-muted mt-1 select-all font-mono">User ID: {selectedUser.id}</div>
            </div>

            {/* Change monthly credits limit */}
            <div className="space-y-2">
              <h4 className="font-bold text-text-primary">Refill Monthly AI Credits:</h4>
              <div className="flex gap-2.5">
                <input
                  type="number"
                  placeholder="Enter credit count (e.g. 500)"
                  defaultValue={selectedUser.monthlyCredits}
                  id="adjust-credits-input"
                  className="w-full bg-[#0d0e12] border border-glass-border/30 hover:border-glass-border-hover/50 rounded-lg px-3 py-2 text-xs focus:outline-hidden text-text-secondary"
                />
                <Button 
                  onClick={() => {
                    const input = document.getElementById("adjust-credits-input") as HTMLInputElement;
                    handleModifyUser("adjustCredits", { amount: Number(input?.value || 10) });
                  }}
                  isLoading={actionProcessing}
                  size="sm"
                  className="bg-brand-500 font-bold shrink-0"
                >
                  Adjust Limit
                </Button>
              </div>
            </div>

            {/* Account suspension and Role adjustments */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-bold text-text-primary">Assign Role Level:</h4>
                <select
                  defaultValue={selectedUser.role}
                  onChange={(e) => handleModifyUser("changeRole", { role: e.target.value })}
                  className="w-full h-9 bg-[#0d0e12] border border-glass-border/30 hover:border-glass-border-hover/50 rounded-lg px-2 text-xs focus:outline-hidden text-text-secondary"
                >
                  <option value="USER">User (Standard)</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="SUPPORT_AGENT">Support Agent</option>
                  <option value="ANALYST">Analyst</option>
                  <option value="FINANCE_ADMIN">Finance Admin</option>
                </select>
              </div>

              <div className="space-y-2 flex flex-col justify-end">
                <h4 className="font-bold text-text-primary">Action Controls:</h4>
                <Button
                  onClick={() => handleModifyUser("toggleBan", { banned: !selectedUser.banned })}
                  isLoading={actionProcessing}
                  variant={selectedUser.banned ? "glow" : "outline"}
                  size="sm"
                  className={cn(
                    "w-full font-extrabold uppercase text-[10px]",
                    selectedUser.banned ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "border-error-500/20 text-error-400 hover:bg-error-500/10"
                  )}
                  leftIcon={<Ban className="h-3.5 w-3.5" />}
                >
                  {selectedUser.banned ? "Unban Account" : "Ban Account"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* TICKETING RESPONSE DIALOG */}
      <Dialog
        isOpen={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        title="Support Ticket Management Console"
        description="Write internal staff comments and adjust resolution states."
        className="max-w-md bg-[#0d0e12]/95 border-glass-border/40 text-left"
      >
        {selectedTicket && (
          <div className="space-y-5 pt-4 text-xs select-none">
            <div className="p-3.5 rounded-lg bg-surface-100/50 border border-glass-border/20 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[10px] font-mono text-brand-400">{selectedTicket.id}</span>
                <Badge variant={selectedTicket.priority === "URGENT" ? "error" : "warning"}>{selectedTicket.priority}</Badge>
              </div>
              <div className="font-bold text-sm text-text-primary">{selectedTicket.subject}</div>
              <p className="text-text-secondary leading-relaxed text-[11px]">{selectedTicket.message}</p>
              <div className="pt-2 border-t border-glass-border/10 flex justify-between text-[10px] text-text-muted">
                <span>By: {selectedTicket.user.name}</span>
                <span>Date: {new Date(selectedTicket.createdAt).toLocaleDateString("en-IN")}</span>
              </div>
            </div>

            {/* Note text field */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-text-primary">Private internal note:</h4>
              <textarea
                placeholder="Enter staff observations..."
                defaultValue={selectedTicket.internalNote || ""}
                id="ticket-note-input"
                rows={3}
                className="w-full bg-[#0d0e12] border border-glass-border/30 hover:border-glass-border-hover/50 rounded-lg p-2.5 text-xs focus:outline-hidden text-text-secondary leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <h4 className="font-bold text-text-primary">Assign Resolution State:</h4>
                <select
                  defaultValue={selectedTicket.status}
                  id="ticket-status-select"
                  className="w-full h-9 bg-[#0d0e12] border border-glass-border/30 hover:border-glass-border-hover/50 rounded-lg px-2 text-xs focus:outline-hidden text-text-secondary"
                >
                  <option value="OPEN">Open (New)</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved (Complete)</option>
                  <option value="CLOSED">Closed (Archived)</option>
                </select>
              </div>

              <div className="space-y-1.5 flex flex-col justify-end">
                <Button
                  onClick={() => {
                    const select = document.getElementById("ticket-status-select") as HTMLSelectElement;
                    const note = document.getElementById("ticket-note-input") as HTMLTextAreaElement;
                    handleModifyTicket({
                      status: select?.value || "OPEN",
                      internalNote: note?.value || "",
                    });
                  }}
                  isLoading={actionProcessing}
                  className="bg-brand-500 font-bold h-9"
                >
                  Save Updates
                </Button>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* PROMPTS CONFIG DIALOG */}
      <Dialog
        isOpen={promptModalOpen}
        onClose={() => setPromptModalOpen(false)}
        title="Prompt Template System Editor"
        description="Modify system prompts content and view template compile history."
        className="max-w-lg bg-[#0d0e12]/95 border-glass-border/40 text-left"
      >
        {selectedPrompt && (
          <div className="space-y-5 pt-4 text-xs select-none">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Badge variant="outline">{selectedPrompt.type}</Badge>
                <span className="text-[10px] text-text-muted font-bold">Active: {selectedPrompt.currentVersion}</span>
              </div>
              <h4 className="font-bold text-text-primary">System Template String:</h4>
              <textarea
                defaultValue={selectedPrompt.content}
                id="prompt-content-input"
                rows={6}
                className="w-full bg-[#0d0e12] border border-glass-border/30 hover:border-glass-border-hover/50 rounded-lg p-2.5 font-mono text-[10px] leading-relaxed text-text-secondary focus:outline-hidden"
              />
            </div>

            {/* Version logs */}
            <div className="space-y-2">
              <h4 className="font-bold text-text-primary">Prompt modification logs history:</h4>
              <div className="max-h-24 overflow-y-auto space-y-1.5 p-2 rounded-lg bg-[#0d0e12] border border-glass-border/20 text-[10px]">
                {selectedPrompt.history.map((h, i) => (
                  <div key={i} className="flex justify-between py-1 border-b border-glass-border/10 last:border-0">
                    <span className="font-bold text-brand-400">{h.version}</span>
                    <span className="text-text-secondary truncate px-2">{h.notes}</span>
                    <span className="text-text-muted">{h.date}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2.5">
              <Button 
                onClick={() => setPromptModalOpen(false)} 
                variant="secondary"
                size="sm"
                className="font-bold"
              >
                Cancel Changes
              </Button>
              <Button 
                onClick={async () => {
                  const input = document.getElementById("prompt-content-input") as HTMLTextAreaElement;
                  setActionProcessing(true);
                  const res = await fetch("/api/admin/prompts", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      promptId: selectedPrompt.id,
                      content: input?.value || "",
                    }),
                  });
                  if (res.ok) {
                    setPromptModalOpen(false);
                    loadTabStats();
                    alert("Prompt updated successfully.");
                  } else {
                    alert("Error saving prompt.");
                  }
                  setActionProcessing(false);
                }}
                isLoading={actionProcessing}
                size="sm"
                className="bg-brand-500 font-bold"
              >
                Compile & Save Template
              </Button>
            </div>
          </div>
        )}
      </Dialog>

    </div>
  );
}
