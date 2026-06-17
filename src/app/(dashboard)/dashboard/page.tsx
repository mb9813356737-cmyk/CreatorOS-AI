"use client";

import { PageHeader } from "@/components/shared/page-header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentGenerations } from "@/components/dashboard/recent-generations";
import { AnalyticsOverview } from "@/components/dashboard/analytics-overview";
import { ViralPredictorWidget } from "@/components/dashboard/viral-predictor-widget";
import { useUser } from "@/lib/auth";
import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children";

export default function DashboardPage() {
  const { user } = useUser();

  const firstName = user?.firstName || "Creator";

  return (
    <StaggerChildren className="space-y-8 md:space-y-10 pb-12">
      {/* 1. Header Section */}
      <StaggerItem>
        <PageHeader
          title={`Welcome back, ${firstName}! 👋`}
          description="Your AI-powered Creator Operating System. Generate hooks, write captions, analyze trends, and more."
          badge="Workspace Dashboard"
        />
      </StaggerItem>

      {/* 2. Numerical Stats Overview */}
      <StaggerItem>
        <StatsCards />
      </StaggerItem>

      {/* 3. Bento Grid: Analytics Chart + Quick Virality Predictor */}
      <StaggerItem>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <AnalyticsOverview />
          </div>
          <div className="lg:col-span-5">
            <ViralPredictorWidget />
          </div>
        </div>
      </StaggerItem>

      {/* 4. Tools Quick Action Grid */}
      <StaggerItem>
        <QuickActions />
      </StaggerItem>

      {/* 5. History logs */}
      <StaggerItem>
        <RecentGenerations />
      </StaggerItem>
    </StaggerChildren>
  );
}
