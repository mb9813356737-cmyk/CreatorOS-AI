"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

// ─── Error Boundary ────────────────────────────────────────
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service in production
    console.error("[CreatorOS Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-6">
      <div className="glass rounded-2xl p-8 max-w-md w-full text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-error/10 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-error" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary">
          Something went wrong
        </h2>
        <p className="text-sm text-text-secondary">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        {error.digest && (
          <p className="text-xs text-text-muted font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white font-medium text-sm hover:bg-brand-600 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}
