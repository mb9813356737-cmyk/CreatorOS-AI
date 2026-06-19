"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/lib/auth";
import { useSubscription } from "@/hooks/use-subscription";
import { useUsage } from "@/hooks/use-usage";
import { useUIStore } from "@/stores/ui-store";
import { toast } from "sonner";
import { 
  User, 
  Settings as SettingsIcon, 
  Zap, 
  Key, 
  Monitor, 
  Languages,
  QrCode,
  CheckCircle2,
  Smartphone,
  RefreshCw,
  Sliders,
  Send
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user } = useUser();
  const { subscription } = useSubscription();
  const { usage } = useUsage();
  const { setUpgradeModalOpen } = useUIStore();

  const email = user?.emailAddresses[0]?.emailAddress || "";
  const name = user?.fullName || "Content Creator";
  const plan = subscription?.plan || "FREE";

  // Tab State
  const [activeTab, setActiveTab] = React.useState<"general" | "whatsapp">("general");

  // WhatsApp States
  const [isLinking, setIsLinking] = React.useState(false);
  const [isLinked, setIsLinked] = React.useState(false);
  const [whatsappActive, setWhatsappActive] = React.useState(false);
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [targetGroup, setTargetGroup] = React.useState("My Viral Channel Updates");

  const triggerLinkDevice = () => {
    setIsLinking(true);
    setTimeout(() => {
      setIsLinking(false);
      setIsLinked(true);
      setWhatsappActive(true);
    }, 3000); // 3 seconds scan simulation
  };

  const unlinkDevice = () => {
    setIsLinked(false);
    setWhatsappActive(false);
    setPhoneNumber("");
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      <PageHeader
        title="Settings & Profile"
        description="Manage your account preferences, subscription status, developer API keys, and automated social distribution bots."
        badge="Account Settings"
      />

      {/* Tab Selectors */}
      <div className="flex gap-2 p-1 bg-surface-100/50 border border-glass-border/30 rounded-xl max-w-sm select-none">
        <button
          onClick={() => setActiveTab("general")}
          className={cn(
            "flex-1 py-2 px-4 text-xs font-bold rounded-lg transition-all duration-200 uppercase tracking-wider",
            activeTab === "general"
              ? "bg-brand-500 text-white shadow-glow-sm"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-200/30"
          )}
        >
          ⚙️ General Settings
        </button>
        <button
          onClick={() => setActiveTab("whatsapp")}
          className={cn(
            "flex-1 py-2 px-4 text-xs font-bold rounded-lg transition-all duration-200 uppercase tracking-wider",
            activeTab === "whatsapp"
              ? "bg-brand-500 text-white shadow-glow-sm"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-200/30"
          )}
        >
          💬 WhatsApp Bot
        </button>
      </div>

      {activeTab === "general" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
          {/* Profile and Plan Details */}
          <div className="lg:col-span-6 space-y-6">
            {/* Profile Card */}
            <Card variant="glass">
              <CardHeader className="flex flex-row items-center gap-4">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt="Profile"
                    className="h-14 w-14 rounded-full border border-brand-500/30"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center">
                    <User className="h-6 w-6" />
                  </div>
                )}
                <div>
                  <CardTitle className="text-base font-bold">{name}</CardTitle>
                  <p className="text-xs text-text-secondary">{email}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="border-t border-glass-border/20 pt-4 flex justify-between items-center text-xs">
                  <span className="text-text-secondary font-medium">Account Identifier</span>
                  <span className="text-text-muted font-mono truncate max-w-[200px] select-all">{user?.id}</span>
                </div>
              </CardContent>
            </Card>

            {/* Plan cap status */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-brand-400 fill-current" />
                  Membership Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-secondary font-medium">Subscription Plan</span>
                  <Badge variant={plan === "FREE" ? "outline" : "gradient"} className="uppercase font-extrabold font-mono tracking-wider">
                    {plan}
                  </Badge>
                </div>

                {usage && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-text-secondary font-semibold">
                      <span>Usage Allotment</span>
                      <span>{usage.isUnlimited ? "Unlimited" : `${usage.creditsUsed}/${usage.monthlyCredits} generations`}</span>
                    </div>
                    {!usage.isUnlimited && (
                      <div className="h-1.5 w-full bg-surface-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-linear-to-r from-brand-500 to-pink-500 rounded-full" 
                          style={{ width: `${usage.percentage}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {plan === "FREE" && (
                  <Button
                    onClick={() => setUpgradeModalOpen(true)}
                    className="w-full h-10 mt-2 bg-linear-to-r from-brand-600 to-pink-600 text-white font-bold"
                    leftIcon={<Zap className="h-4 w-4 fill-current" />}
                  >
                    Upgrade Membership
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Preferences and Developer Config */}
          <div className="lg:col-span-6 space-y-6">
            {/* System preferences */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-brand-400" />
                  Workspace UI Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary font-medium">Theme Setting</span>
                  <span className="font-bold text-text-primary uppercase tracking-widest bg-surface-100 px-2 py-0.5 rounded border border-glass-border">Dark Mode Default</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary font-medium">Locale Zone</span>
                  <span className="font-bold text-text-primary uppercase tracking-widest bg-surface-100 px-2 py-0.5 rounded border border-glass-border">English / IN</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary font-medium">Transition Animations</span>
                  <span className="font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Framer Spring Active</span>
                </div>
              </CardContent>
            </Card>

            {/* AI Settings */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Key className="h-5 w-5 text-brand-400" />
                  Developer AI Providers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0 text-xs leading-relaxed text-text-secondary select-none">
                <p>
                  By default, this app is running in <span className="font-bold text-brand-400">Sandbox Mock Mode</span> without requiring individual OpenAI/Gemini keys.
                </p>
                <p>
                  To enable live production generations, configure your <code className="font-mono bg-surface-100 border border-glass-border px-1 rounded text-text-primary">.env.local</code> file on the server with real API credentials (e.g. <code className="font-mono bg-surface-100 border border-glass-border px-1 rounded text-text-primary">GOOGLE_GENERATIVE_AI_KEY</code>).
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fadeIn">
          {/* Instructions Walkthrough & Rules Config */}
          <div className="lg:col-span-6 space-y-6">
            {/* Walkthrough Card */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-brand-400" />
                  Bot Setup Walkthrough
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0 text-xs">
                <div className="relative border-l border-glass-border/30 pl-4.5 ml-2 space-y-5 select-none">
                  {/* Step 1 */}
                  <div className="relative">
                    <div className="absolute -left-[27px] top-1 h-3.5 w-3.5 rounded-full bg-brand-500 border-2 border-surface-0 shadow-glow-sm" />
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-[10px] text-brand-400 uppercase tracking-wider block">Step 1: Scan Device Authorization</span>
                      <p className="text-text-secondary">Scan the QR code on the right with your phone via WhatsApp &gt; Linked Devices to register the bot.</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative">
                    <div className={cn("absolute -left-[27px] top-1 h-3.5 w-3.5 rounded-full border-2 border-surface-0 shadow-glow-sm transition-colors duration-300", isLinked ? "bg-brand-500" : "bg-surface-200")} />
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-[10px] text-brand-400 uppercase tracking-wider block">Step 2: Assign Target Channel/Group</span>
                      <p className="text-text-secondary">Input your target WhatsApp Group Name or custom broadcast phone number below.</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative">
                    <div className={cn("absolute -left-[27px] top-1 h-3.5 w-3.5 rounded-full border-2 border-surface-0 shadow-glow-sm transition-colors duration-300", isLinked && whatsappActive ? "bg-brand-500" : "bg-surface-200")} />
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-[10px] text-brand-400 uppercase tracking-wider block">Step 3: Activate Automation Loop</span>
                      <p className="text-text-secondary">Enable the Messaging Loop. The bot will automatically push new content drafts instantly.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Config Rules Card */}
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-brand-400" />
                  Broadcast Configurations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4.5 pt-0 text-xs">
                <div className="space-y-1.5">
                  <label htmlFor="connected-phone" className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Connected Mobile Line</label>
                  <Input
                    id="connected-phone"
                    placeholder="Not Connected"
                    value={isLinked ? "+91 98765 43210 (Linked)" : "Awaiting scanner authentication..."}
                    disabled
                    className="bg-surface-100/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="target-group" className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Target WhatsApp Group/Broadcast Name</label>
                  <Input
                    id="target-group"
                    placeholder="e.g. My Viral Channel Updates"
                    value={targetGroup}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetGroup(e.target.value)}
                    disabled={!isLinked}
                    className="bg-surface-50/50 focus:bg-surface-50"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-glass-border/20">
                  <div className="space-y-0.5">
                    <span className="font-bold text-text-primary text-[11px]">Automated Messaging Loop</span>
                    <p className="text-[9px] text-text-secondary">Directly post generated high-CTR content scripts to targets.</p>
                  </div>
                  <button
                    onClick={() => setWhatsappActive(!whatsappActive)}
                    disabled={!isLinked}
                    className={cn(
                      "w-12 h-6.5 rounded-full p-1 transition-all duration-300 relative border cursor-pointer",
                      whatsappActive 
                        ? "bg-brand-500 border-brand-400" 
                        : isLinked 
                          ? "bg-surface-200 border-glass-border/50"
                          : "bg-surface-200 border-glass-border/50 opacity-60 cursor-not-allowed"
                    )}
                  >
                    <div className={cn("h-4.5 w-4.5 rounded-full bg-white transition-all duration-300 shadow", whatsappActive ? "translate-x-5.5" : "translate-x-0")} />
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* QR Scanner Module */}
          <div className="lg:col-span-6">
            <Card variant="glass" className="h-full flex flex-col justify-center min-h-[380px]">
              <CardContent className="pt-6 flex flex-col items-center justify-center text-center space-y-5">
                {!isLinked ? (
                  <>
                    <div className="relative p-6 bg-surface-100/40 border border-glass-border rounded-2xl select-none group">
                      {/* Stylized QR Code Scanner Corners */}
                      <div className="border-t-4 border-l-4 border-brand-500 w-6 h-6 absolute top-0 left-0 rounded-tl-lg" />
                      <div className="border-t-4 border-r-4 border-brand-500 w-6 h-6 absolute top-0 right-0 rounded-tr-lg" />
                      <div className="border-b-4 border-l-4 border-brand-500 w-6 h-6 absolute bottom-0 left-0 rounded-bl-lg" />
                      <div className="border-b-4 border-r-4 border-brand-500 w-6 h-6 absolute bottom-0 right-0 rounded-br-lg" />

                      <div className="relative flex items-center justify-center h-32 w-32 bg-white rounded-lg p-2 overflow-hidden border border-glass-border/30">
                        {isLinking ? (
                          <div className="absolute inset-0 bg-surface-900/60 flex flex-col items-center justify-center text-center p-2 z-20">
                            <RefreshCw className="h-7 w-7 text-brand-400 animate-spin" />
                            <span className="text-[8px] font-mono text-white mt-1.5 uppercase tracking-widest animate-pulse">Linking Account...</span>
                          </div>
                        ) : (
                          <>
                            {/* Scanning laser line */}
                            <div className="absolute left-0 right-0 h-1 bg-emerald-500 shadow-[0_0_10px_#10B981] animate-[bounce_2.5s_infinite] z-10" />
                            <QrCode className="h-full w-full text-surface-900 opacity-90" />
                          </>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1.5 flex flex-col items-center">
                      <Badge variant="outline" className="text-amber-400 border-amber-500/30 uppercase tracking-widest text-[9px] font-extrabold mx-auto select-none">
                        Beta — Mock Mode
                      </Badge>
                      <h4 className="font-extrabold text-sm text-text-primary uppercase tracking-wider">Authorize WhatsApp Device</h4>
                      <p className="text-[10px] text-text-secondary leading-relaxed max-w-[280px]">
                        Scan this QR code using Linked Devices on WhatsApp. Session tokens are encrypted and sandbox isolated. (This feature is currently running in local demonstration mode).
                      </p>
                    </div>
                    <Button
                      onClick={() => toast.info("WhatsApp Bot integration is coming soon in the next release!")}
                      disabled
                      className="h-9 px-5 bg-surface-200 text-text-muted font-bold text-xs cursor-not-allowed opacity-60"
                      leftIcon={<QrCode className="h-3.5 w-3.5" />}
                    >
                      Scan & Link Device (Coming Soon)
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-glow-emerald animate-pulse">
                      <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-extrabold text-sm text-text-primary uppercase tracking-wider">Device Synchronization Successful</h4>
                      <div className="space-y-1 text-xs select-none">
                        <p className="text-text-secondary">Session Status: <span className="text-emerald-400 font-bold">ACTIVE</span></p>
                        <p className="text-text-muted text-[10px]">Connected Device: <span className="font-mono">WhatsApp Web Session (Apple MacOS)</span></p>
                        <p className="text-text-muted text-[10px]">Connected Number: <span className="font-mono">+91 98765 43210</span></p>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={unlinkDevice}
                      className="h-9 px-5 border border-glass-border hover:bg-error/10 hover:text-error transition-all font-bold text-xs"
                      leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
                    >
                      Disconnect WhatsApp Session
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
