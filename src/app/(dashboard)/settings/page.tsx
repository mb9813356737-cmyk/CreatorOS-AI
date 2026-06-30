"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/auth";
import { useSubscription } from "@/hooks/use-subscription";
import { useUsage } from "@/hooks/use-usage";
import { useUIStore } from "@/stores/ui-store";
import { 
  User, 
  Zap, 
  Key, 
  Monitor
} from "lucide-react";

export default function SettingsPage() {
  const { user } = useUser();
  const { subscription } = useSubscription();
  const { usage } = useUsage();
  const { setUpgradeModalOpen } = useUIStore();

  const email = user?.emailAddresses[0]?.emailAddress || "";
  const name = user?.fullName || "Content Creator";
  const plan = subscription?.plan || "FREE";

  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      <PageHeader
        title="Settings & Profile"
        description="Manage your account preferences, subscription status, and developer API keys."
        badge="Account Settings"
      />

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
    </div>
  );
}
