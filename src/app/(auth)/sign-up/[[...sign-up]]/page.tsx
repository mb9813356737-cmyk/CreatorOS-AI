"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Eye, EyeOff, Lock, Mail, User, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingParticles } from "@/components/shared/floating-particles";
import { Entropy } from "@/components/ui/entropy";

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { signUp, loading } = useAuthStore();



  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "google_cancelled") {
      setError("Google registration was cancelled. Please try again.");
    } else if (errorParam === "invalid_token") {
      setError("Invalid Google token or signup session expired.");
    } else if (errorParam === "network_error") {
      setError("Network error communicating with Google registration services.");
    } else if (errorParam === "unauthorized_access") {
      setError("Google profile verification failed. Make sure your profile email is shared.");
    } else if (errorParam === "suspended") {
      setError("This account email is banned or suspended.");
    } else if (errorParam) {
      setError("Google signup failed. Please try again.");
    }
  }, [searchParams]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name || !email || !password || !confirmPassword) {
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
      await signUp(email, name, password);
      setSuccess("Account successfully created! Redirecting to dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 800);
    } catch (err: unknown) {
      // err.message is set by auth-store from data.error (the safe user-facing string).
      // If the API also returned a `debug` field, it was already console.error'd
      // by the store — here we surface the clean message to the UI.
      const message = err instanceof Error ? err.message : "Failed to register account. Please try again.";
      setError(message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
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
          
          <h2 className="text-xl font-extrabold text-text-primary tracking-tight">Create your account</h2>
          <p className="text-xs text-text-secondary mt-1">Get started with 10 free credits</p>
        </div>

        {/* Notifications */}
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
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                className="w-full h-11 pl-10 pr-4 rounded-lg bg-surface-100/40 border border-glass-border hover:border-glass-border-hover focus:border-brand-500/50 text-xs text-text-primary focus:outline-hidden transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full h-11 pl-10 pr-4 rounded-lg bg-surface-100/40 border border-glass-border hover:border-glass-border-hover focus:border-brand-500/50 text-xs text-text-primary focus:outline-hidden transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
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
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full h-11 pl-10 pr-4 rounded-lg bg-surface-100/40 border border-glass-border hover:border-glass-border-hover focus:border-brand-500/50 text-xs text-text-primary focus:outline-hidden transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full h-11 font-bold text-xs shadow-glow-sm select-none"
            disabled={loading}
            isLoading={loading}
            rightIcon={<ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />}
          >
            Create Account
          </Button>
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-x-0 h-[1px] bg-glass-border/20" />
          <span className="relative px-3 bg-[#050508] text-[10px] font-bold text-text-muted uppercase tracking-widest select-none">
            Or continue with
          </span>
        </div>

        <Button
          type="button"
          variant="secondary"
          className="w-full h-11 font-bold text-xs hover:border-glass-border-hover/80 hover:bg-surface-200/20"
          onClick={() => {
            window.location.href = "/api/auth/google";
          }}
          disabled={loading}
          leftIcon={
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.37 0 3.393 2.666 1.488 6.545l3.778 3.22Z"
              />
              <path
                fill="#4285F4"
                d="M23.455 12.273c0-.818-.073-1.609-.209-2.373H12v4.582h6.418a5.522 5.522 0 0 1-2.395 3.627v3.01h3.873c2.264-2.082 3.564-5.145 3.564-8.846Z"
              />
              <path
                fill="#FBBC05"
                d="M5.266 14.235 1.488 17.455C3.393 21.334 7.37 24 12 24c3.055 0 5.618-1.01 7.49-2.736l-3.873-3.01c-1.073.718-2.445 1.145-3.617 1.145-3.236 0-5.973-2.182-6.955-5.114l-3.778 3.22Z"
              />
              <path
                fill="#34A853"
                d="M1.488 6.545 5.266 9.765a7.042 7.042 0 0 1 6.734 4.47l3.778-3.22c-1.464-4.382-5.59-7.515-10.518-7.515C5.055 3.5 2.973 4.673 1.488 6.545Z"
              />
            </svg>
          }
        >
          Continue with Google
        </Button>

        <div className="mt-8 pt-6 border-t border-glass-border/20 text-center text-[11px] text-text-secondary">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-bold text-brand-400 hover:text-brand-300 transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
