"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sparkles, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingParticles } from "@/components/shared/floating-particles";
import { Entropy } from "@/components/ui/entropy";
import { CoreSpinLoader } from "@/components/ui/core-spin-loader";
import { useAuthStore } from "@/stores/auth-store";

function VerifyEmailInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { restoreSession } = useAuthStore();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setStatus("error");
        setErrorMsg("Missing or invalid email verification token.");
        return;
      }

      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Verification failed");
        }

        setStatus("success");
        // Sync custom auth state store
        await restoreSession();

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 2000);
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err.message || "Something went wrong. The link may have expired.");
      }
    };

    performVerification();
  }, [token, router, restoreSession]);

  return (
    <div className="relative rounded-2xl border border-glass-border bg-surface-50/80 p-6 sm:p-10 shadow-cinematic backdrop-blur-md overflow-hidden text-center">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-brand-500 via-accent-400 to-brand-500 opacity-70" />

      <div className="flex flex-col items-center mb-6">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <div className="flex h-8.5 w-8.5 items-center justify-center rounded-lg bg-linear-to-br from-brand-500 to-accent-400 shadow-glow-sm">
            <Sparkles className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-text-primary">
            Creator<span className="bg-linear-to-r from-brand-500 to-accent-400 bg-clip-text text-transparent font-black">OS</span> AI
          </span>
        </Link>

        {status === "loading" && (
          <div className="flex flex-col items-center">
            <div className="scale-75"><CoreSpinLoader /></div>
            <h2 className="text-lg font-bold text-text-primary mt-6 tracking-tight">Verifying your email...</h2>
            <p className="text-xs text-text-secondary mt-1">Please wait while we activate your account.</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 items-center justify-center mb-4 text-emerald-400 shadow-glow-sm">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-bold text-text-primary tracking-tight">Email Verified!</h2>
            <p className="text-xs text-text-secondary mt-1">Your account is active. Redirecting to your workspace...</p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 rounded-full bg-error/10 border border-error/20 items-center justify-center mb-4 text-error shadow-glow-sm">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-bold text-text-primary tracking-tight">Verification Failed</h2>
            <p className="text-xs text-error mt-2 max-w-sm leading-relaxed">{errorMsg}</p>
          </div>
        )}
      </div>

      {status === "error" && (
        <div className="pt-6 border-t border-glass-border/20 flex items-center justify-center">
          <Link href="/sign-in" className="flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to login
          </Link>
        </div>
      )}

    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-surface-0 relative overflow-hidden px-6 select-none">
      <FloatingParticles />
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(124,58,237,0.06)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none opacity-20 mix-blend-screen">
        <Entropy size={950} />
      </div>

      <div className="relative z-10 w-full max-w-md my-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Suspense fallback={
            <div className="relative rounded-2xl border border-glass-border bg-surface-50/80 p-6 sm:p-10 shadow-cinematic backdrop-blur-md overflow-hidden text-center flex flex-col items-center">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-brand-500 via-accent-400 to-brand-500 opacity-70" />
              <CoreSpinLoader />
              <h2 className="text-lg font-bold text-text-primary mt-6 tracking-tight">Loading verification session...</h2>
            </div>
          }>
            <VerifyEmailInner />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}
