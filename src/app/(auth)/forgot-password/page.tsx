"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingParticles } from "@/components/shared/floating-particles";
import { Entropy } from "@/components/ui/entropy";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [testUrl, setTestUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setTestUrl(null);
    
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate password reset.");
      }

      setSuccess(data.message);
      
      // Save test reset link in development mode to make it easy for the developer
      if (data._testUrl) {
        setTestUrl(data._testUrl);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
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
              
              <h2 className="text-xl font-extrabold text-text-primary tracking-tight">Reset password</h2>
              <p className="text-xs text-text-secondary mt-1">We will send you a link to reset your password</p>
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

              <Button
                type="submit"
                variant="primary"
                className="w-full h-11 font-bold text-xs shadow-glow-sm select-none"
                disabled={loading}
                isLoading={loading}
                rightIcon={<ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />}
              >
                Send Reset Link
              </Button>
            </form>

            {testUrl && (
              <div className="p-3 mt-4 rounded-lg border border-brand-500/20 bg-brand-500/5 text-center text-xs">
                <span className="font-bold text-brand-400 block mb-1">Developer Testing Mode Link:</span>
                <Link href={testUrl} className="underline text-text-primary font-mono text-[10px] break-all select-all">
                  {testUrl}
                </Link>
              </div>
            )}

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
