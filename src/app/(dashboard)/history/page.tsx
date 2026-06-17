"use client";

import { PageHeader } from "@/components/shared/page-header";
import { RecentGenerations } from "@/components/dashboard/recent-generations";

export default function HistoryPage() {
  return (
    <div className="space-y-6 md:space-y-8 pb-12">
      <PageHeader
        title="Generation Logs"
        description="Browse, filter, copy, and inspect all previously generated AI scripts, hooks, and captions in your browser workspace."
        badge="Workspace history"
      />

      <RecentGenerations />
    </div>
  );
}
