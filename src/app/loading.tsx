import { CoreSpinLoader } from "@/components/ui/core-spin-loader";

// ─── Global Loading State ──────────────────────────────────
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-0">
      <CoreSpinLoader />
    </div>
  );
}
