"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, Video, TrendingUp, Compass, Film, MessageSquareText, Layers, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingParticles } from "@/components/shared/floating-particles";
import { Entropy } from "@/components/ui/entropy";
import { useAuthStore } from "@/stores/auth-store";

const NICHES = [
  { value: "tech", label: "Tech & Gadgets", emoji: "💻", description: "Reviews, code, and guides." },
  { value: "finance", label: "Finance & Tax", emoji: "📈", description: "Investing, money, and trading." },
  { value: "vlogs", label: "Vlogs & Travel", emoji: "✈️", description: "Daily diaries and travel stories." },
  { value: "comedy", label: "Comedy & Memes", emoji: "🎭", description: "Skits, reactions, and jokes." },
  { value: "education", label: "Education & Skills", emoji: "🧠", description: "Tutorials, facts, and lessons." },
  { value: "business", label: "Business & Startup", emoji: "🚀", description: "Marketing, SaaS, and strategy." },
];

const PLATFORMS = [
  { value: "youtube", label: "YouTube Video", icon: Video, color: "text-[#FF0000] border-[#FF0000]/10 bg-[#FF0000]/5" },
  { value: "shorts", label: "YouTube Shorts", icon: Film, color: "text-[#FF4500] border-[#FF4500]/10 bg-[#FF4500]/5" },
  { value: "reels", label: "Instagram Reels", icon: Film, color: "text-[#E1306C] border-[#E1306C]/10 bg-[#E1306C]/5" },
  { value: "linkedin", label: "LinkedIn Post", icon: Layers, color: "text-[#0A66C2] border-[#0A66C2]/10 bg-[#0A66C2]/5" },
  { value: "twitter", label: "Twitter/X Thread", icon: MessageSquareText, color: "text-[#f0f0f5] border-glass-border/35 bg-surface-50/5" },
];

export default function OnboardingPage() {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNextStep = () => {
    if (step === 1 && !selectedNiche) {
      setError("Please select a content niche.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleBackStep = () => {
    setError(null);
    setStep(1);
  };

  const handleComplete = async () => {
    if (!selectedPlatform) {
      setError("Please select your primary platform.");
      return;
    }
    setError(null);

    try {
      setLoading(true);
      
      const response = await fetch("/api/user/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: selectedNiche,
          platform: selectedPlatform,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save onboarding settings");
      }

      // Sync settings with local store
      useAuthStore.getState().updateUserFields({ niche: selectedNiche || undefined, platform: selectedPlatform || undefined });

      // Success, route to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to complete onboarding.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-surface-0 relative overflow-hidden px-6 select-none">
      {/* Background aesthetics */}
      <FloatingParticles />
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(circle, var(--color-brand-500) 0%, transparent 70%)', opacity: 0.15 }}
      />

      {/* Centered Entropy background animation */}
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none opacity-20 mix-blend-screen">
        <Entropy size={900} />
      </div>

      {/* Main card wrapper */}
      <div className="relative z-10 w-full max-w-2xl my-12">
        <div className="relative rounded-2xl border border-glass-border bg-surface-50/80 p-6 sm:p-10 shadow-cinematic backdrop-blur-md overflow-hidden border-electric glow-electric flicker">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-brand-500 via-accent-500 to-brand-500 opacity-70" />
          
          {/* Top Progress bar */}
          <div className="w-full flex items-center gap-2 mb-8">
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 1 ? "bg-accent-500 shadow-glow-cyan" : "bg-surface-200"}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= 2 ? "bg-accent-500 shadow-glow-cyan" : "bg-surface-200"}`} />
          </div>

          {/* Title Header */}
          <div className="space-y-2 mb-8">
            <div className="flex items-center gap-2">
              <Badge variant="gradient" className="gap-1 font-bold">
                <Sparkles className="h-3 w-3 fill-current" />
                Setup Wizard
              </Badge>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Step {step} of 2</span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">
              {step === 1 ? "Choose Your Niche" : "Select Your Main Stage"}
            </h2>
            
            <p className="text-xs text-text-secondary leading-relaxed">
              {step === 1 
                ? "This helps customize the Hinglish phrasing engine, vocabulary slangs, and content tone configurations." 
                : "Choose the platform you publish to most. We will optimize prompt ratios for this size format."
              }
            </p>
          </div>

          {/* Error display */}
          <AnimatePresence>
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
          </AnimatePresence>

          {/* Forms */}
          <div className="min-h-[250px]">
            {step === 1 ? (
              /* STEP 1: NICHE SELECTION */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {NICHES.map((niche) => {
                  const isSelected = selectedNiche === niche.value;
                  return (
                    <button
                      key={niche.value}
                      onClick={() => {
                        setSelectedNiche(niche.value);
                        setError(null);
                      }}
                      className="text-left w-full focus:outline-hidden cursor-pointer"
                    >
                      <Card
                        variant="glass"
                        className={`p-4 border transition-all duration-200 cursor-pointer h-24 flex flex-col justify-between relative overflow-hidden border-electric glow-electric ${
                          isSelected
                            ? "border-accent-500 bg-accent-500/10 shadow-glow-cyan"
                            : "border-glass-border hover:border-glass-border-hover"
                        }`}
                        hoverEffect={false}
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-lg select-none">{niche.emoji}</span>
                          {isSelected && <CheckCircle2 className="h-4.5 w-4.5 text-accent-500 fill-current" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-text-primary text-xs tracking-tight">{niche.label}</h4>
                          <p className="text-[10px] text-text-secondary mt-0.5 line-clamp-1">{niche.description}</p>
                        </div>
                      </Card>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* STEP 2: PLATFORM SELECTION */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PLATFORMS.map((platform) => {
                  const isSelected = selectedPlatform === platform.value;
                  return (
                    <button
                      key={platform.value}
                      onClick={() => {
                        setSelectedPlatform(platform.value);
                        setError(null);
                      }}
                      className="text-left w-full focus:outline-hidden cursor-pointer"
                    >
                      <Card
                        variant="glass"
                        className={`p-4 border transition-all duration-200 cursor-pointer h-24 flex flex-col justify-between relative overflow-hidden border-electric glow-electric ${
                          isSelected
                            ? "border-accent-500 bg-accent-500/10 shadow-glow-cyan"
                            : "border-glass-border hover:border-glass-border-hover"
                        }`}
                        hoverEffect={false}
                      >
                        <div className="flex items-start justify-between">
                          <platform.icon className={`h-5 w-5 ${platform.color.split(" ")[0]}`} />
                          {isSelected && <CheckCircle2 className="h-4.5 w-4.5 text-accent-500 fill-current" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-text-primary text-xs tracking-tight">{platform.label}</h4>
                          <p className="text-[10px] text-text-secondary mt-0.5 select-none">CTR ratio optimized</p>
                        </div>
                      </Card>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between border-t border-glass-border/20 pt-6 mt-8">
            {step === 2 ? (
              <button
                type="button"
                onClick={handleBackStep}
                className="text-[10px] font-bold text-text-muted hover:text-text-primary uppercase tracking-widest cursor-pointer disabled:opacity-50 border-dash"
                disabled={loading}
              >
                &larr; Back to Niche
              </button>
            ) : (
              <div />
            )}

            <Button
              onClick={step === 1 ? handleNextStep : handleComplete}
              variant="primary"
              className="h-10.5 px-6 font-bold text-xs shadow-glow-sm border-dash"
              disabled={loading}
              isLoading={loading}
              rightIcon={step === 1 ? <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" /> : undefined}
            >
              {step === 1 ? "Next: Platforms" : "Complete Profile"}
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
