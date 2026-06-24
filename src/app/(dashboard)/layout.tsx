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

  // Render a loading state during evaluation to prevent UI flashing
  if (authLoading || isLoading || (usage && (!usage.niche || !usage.platform))) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-surface-0 relative overflow-hidden">
        <FloatingParticles />
        <div className="relative z-10">
          <CoreSpinLoader text="Syncing profile details..." />
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
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8" data-lenis-prevent>
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
