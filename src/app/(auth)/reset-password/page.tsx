"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lock, Eye, EyeOff, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingParticles } from "@/components/shared/floating-particles";
import { Entropy } from "@/components/ui/entropy";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Invalid reset request: Missing token parameters.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError("No password reset token provided in URL.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setSuccess("Password successfully changed! Redirecting to sign in...");
      setTimeout(() => {
        router.push("/sign-in");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Token may have expired.");
    } finally {
      setLoading(false);
    }
  };

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
          <div className="relative rounded-2xl border border-glass-border bg-surface-50/80 p-6 sm:p-10 shadow-cinematic backdrop-blur-md overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-brand-500 via-accent-400 to-brand-500 opacity-70" />

            <div className="flex flex-col items-center mb-8">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="flex h-8.5 w-8.5 items-center justify-center rounded-lg bg-linear-to-br from-brand-500 to-accent-400 shadow-glow-sm">
                  <Sparkles className="h-4.5 w-4.5 text-white" />
                </div>
                <span className="font-extrabold text-lg tracking-tight text-text-primary">
                  Creator<span className="bg-linear-to-r from-brand-500 to-accent-400 bg-clip-text text-transparent font-black">OS</span> AI
                </span>
              </Link>
              
              <h2 className="text-xl font-extrabold text-text-primary tracking-tight">Choose new password</h2>
              <p className="text-xs text-text-secondary mt-1">Please enter your new credential credentials details below</p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 mb-5 rounded-lg border border-error/25 bg-error/10 text-error text-[11px] font-medium leading-relaxed overflow-hidden"
                >
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 mb-5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 text-[11px] font-medium leading-relaxed overflow-hidden"
                >
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading || !token}
                    className="w-full h-11 pl-10 pr-10 rounded-lg bg-surface-100/40 border border-glass-border hover:border-glass-border-hover focus:border-brand-500/50 text-xs text-text-primary focus:outline-hidden transition-colors disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary focus:outline-hidden"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading || !token}
                    className="w-full h-11 pl-10 pr-4 rounded-lg bg-surface-100/40 border border-glass-border hover:border-glass-border-hover focus:border-brand-500/50 text-xs text-text-primary focus:outline-hidden transition-colors disabled:opacity-50"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full h-11 font-bold text-xs shadow-glow-sm select-none"
                disabled={loading || !token}
                isLoading={loading}
                rightIcon={<ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />}
              >
                Change Password
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-glass-border/20 flex items-center justify-center">
              <Link href="/sign-in" className="flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to login
              </Link>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
