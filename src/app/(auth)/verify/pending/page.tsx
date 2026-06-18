"use client";

import React from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function VerificationPendingPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="relative rounded-2xl border border-glass-border bg-surface-50/80 p-6 sm:p-10 shadow-cinematic backdrop-blur-md overflow-hidden text-center">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-brand-500 via-accent-400 to-brand-500 opacity-70" />

        <div className="flex flex-col items-center mb-6">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <div className="flex h-8.5 w-8.5 items-center justify-center rounded-lg bg-linear-to-br from-brand-500 to-accent-400 shadow-glow-sm">
              <Sparkles className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-text-primary">
              Creator<span className="bg-linear-to-r from-brand-500 to-accent-400 bg-clip-text text-transparent font-black">OS</span> AI
            </span>
          </Link>
          
          <div className="flex h-16 w-16 rounded-full bg-brand-500/10 border border-brand-500/20 items-center justify-center mb-4 text-brand-400 shadow-glow-sm">
            <Mail className="h-8 w-8 animate-pulse" />
          </div>

          <h2 className="text-xl font-extrabold text-text-primary tracking-tight">Verify your email</h2>
          <p className="text-xs text-text-secondary mt-2 max-w-sm leading-relaxed">
            We have sent a verification link to your email address. Please click on the link to verify your account and activate your CreatorOS workspace.
          </p>
        </div>

        <div className="p-4 rounded-lg border border-brand-500/10 bg-brand-500/5 text-xs text-brand-300 leading-relaxed mb-6">
          <span className="font-bold block mb-1">Testing Tip:</span>
          Since you are in local developer mode, check the server terminal console output to find the verification link!
        </div>

        <div className="pt-6 border-t border-glass-border/20 flex items-center justify-center">
          <Link href="/sign-in" className="flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to login
          </Link>
        </div>

      </div>
    </motion.div>
  );
}
