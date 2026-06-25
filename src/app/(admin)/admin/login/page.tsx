"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Lock, Mail, AlertCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [passkey, setPasskey] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !passkey) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, passkey }),
      });

      const data = await res.json();

      if (res.ok) {
        // Redirect to admin console with full reload to update sessions
        window.location.href = data.redirect || "/admin?tab=overview";
      } else {
        setError(data.error || "Invalid admin credentials");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected authentication error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080a] text-text-primary flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background neon glows */}
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-brand-500/10 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-purple-500/10 rounded-full filter blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Card variant="glow" hoverEffect={false} className="border-brand-500/20 overflow-hidden relative p-4">
          <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-brand-500 to-purple-500 shadow-glow-sm" />
          
          <CardHeader className="text-center pb-4">
            <div className="h-12 w-12 mx-auto bg-brand-500/10 border border-brand-500/30 rounded-xl flex items-center justify-center mb-3.5 shadow-glow-sm shadow-brand-500/10">
              <ShieldCheck className="h-6 w-6 text-brand-400" />
            </div>

            <Badge variant="gradient" className="font-extrabold text-[9px] tracking-widest uppercase mb-1.5 mx-auto gap-1 select-none">
              <Sparkles className="h-2.5 w-2.5 fill-current animate-pulse" />
              CreatorOS Admin Gateway
            </Badge>

            <CardTitle className="text-xl font-black tracking-tight text-text-primary">
              Staff Authentication
            </CardTitle>
            <p className="text-[11px] text-text-secondary mt-1">
              Enter your administration email and security passkey.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-error-500/10 border border-error-500/25 flex items-start gap-2.5 text-xs text-error-400 text-left"
              >
                <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                  <input
                    type="email"
                    required
                    placeholder="name@creatoros.ai"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-9 bg-surface-100/50 hover:bg-surface-100 border border-glass-border/30 hover:border-glass-border-hover/50 rounded-lg pl-9 pr-4 text-xs focus:outline-hidden text-text-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Security Passkey</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={passkey}
                    onChange={(e) => setPasskey(e.target.value)}
                    className="w-full h-9 bg-surface-100/50 hover:bg-surface-100 border border-glass-border/30 hover:border-glass-border-hover/50 rounded-lg pl-9 pr-4 text-xs focus:outline-hidden text-text-primary"
                  />
                </div>
              </div>

              <Button
                type="submit"
                isLoading={loading}
                className="w-full h-10 mt-6 font-bold bg-linear-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white shadow-glow-sm"
              >
                Verify & Authenticate
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
