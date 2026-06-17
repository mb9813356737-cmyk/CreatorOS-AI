import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

// ─── 404 Page ──────────────────────────────────────────────
export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center mx-auto">
          <Compass className="w-10 h-10 text-brand-400" />
        </div>
        <div>
          <h1 className="text-6xl font-bold gradient-text mb-2">404</h1>
          <h2 className="text-xl font-semibold text-text-primary">
            Page not found
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white font-medium text-sm hover:bg-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
