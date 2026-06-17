"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUsage } from "@/hooks/use-usage";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UpgradeModal } from "@/components/shared/upgrade-modal";
import { PageTransition } from "@/components/motion/page-transition";
import { FloatingParticles } from "@/components/shared/floating-particles";
import { SpiralAnimation } from "@/components/ui/spiral-animation";
import { CoreSpinLoader } from "@/components/ui/core-spin-loader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading: authLoading } = useAuthGuard();
  const { usage, isLoading } = useUsage();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && usage && isAuthenticated) {
      if (!usage.niche || !usage.platform) {
        router.push("/onboarding");
      }
    }
  }, [usage, isLoading, router, isAuthenticated]);

  // Render a skeleton loading state to prevent layout flashing (Rule 10)
  if (authLoading || isLoading || (usage && (!usage.niche || !usage.platform))) {
    return (
      <div className="flex h-screen w-screen bg-surface-0 relative overflow-hidden">
        {/* Mock Sidebar Skeleton */}
        <div className="hidden md:flex flex-col w-64 border-r border-glass-border bg-surface-50 p-6 space-y-8">
          <div className="h-8 w-36 skeleton" />
          <div className="space-y-4 flex-1">
            <div className="h-10 w-full skeleton" />
            <div className="h-10 w-full skeleton" />
            <div className="h-10 w-full skeleton" />
            <div className="h-10 w-full skeleton" />
            <div className="h-10 w-full skeleton" />
          </div>
          <div className="h-16 w-full skeleton" />
        </div>

        {/* Mock Main Layout Skeleton */}
        <div className="flex-1 flex flex-col p-6 md:p-8 space-y-8 overflow-hidden">
          {/* Topbar Skeleton */}
          <div className="flex justify-between items-center pb-4 border-b border-glass-border">
            <div className="h-8 w-48 skeleton" />
            <div className="flex space-x-4">
              <div className="h-10 w-10 rounded-full skeleton" />
              <div className="h-10 w-28 skeleton" />
            </div>
          </div>

          {/* Grid Content Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="h-28 rounded-lg skeleton" />
            <div className="h-28 rounded-lg skeleton" />
            <div className="h-28 rounded-lg skeleton" />
            <div className="h-28 rounded-lg skeleton" />
          </div>

          {/* Chart + Widgets Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
            <div className="lg:col-span-7 h-80 rounded-lg skeleton" />
            <div className="lg:col-span-5 h-80 rounded-lg skeleton" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-0 relative">
      {/* Background Floating Particles for premium look */}
      <FloatingParticles />

      {/* Background Spiral Animation */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-screen overflow-hidden">
        <SpiralAnimation />
      </div>

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden relative z-10">
        {/* Topbar Header */}
        <Topbar />

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8">
          <PageTransition className="w-full max-w-6xl mx-auto h-full">
            {children}
          </PageTransition>
        </main>
      </div>

      {/* Mobile Drawer Navigation */}
      <MobileNav />

      {/* App-Wide Upgrade Gating Dialog */}
      <UpgradeModal />
    </div>
  );
}
