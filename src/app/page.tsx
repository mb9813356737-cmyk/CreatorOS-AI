"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/landing/navbar";
import { InteractiveGlow } from "@/components/landing/interactive-glow";
import { Hero } from "@/components/landing/hero";
import { BrandMarquee } from "@/components/landing/brand-marquee";
import { InfiniteMarquee } from "@/components/landing/infinite-marquee";
import { FeaturesBento } from "@/components/landing/features-bento";
import { Stats } from "@/components/landing/stats";
import { PricingCards } from "@/components/landing/pricing-cards";
import { Testimonials } from "@/components/landing/testimonials";
import { FAQ } from "@/components/landing/faq";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/layout/footer";
import dynamic from "next/dynamic";
import * as React from "react";

const SplashLoader = dynamic(() => import("@/components/landing/splash-loader"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-[#050508] flex items-center justify-center">
      <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

const DynamicEntropy = dynamic(() => import("@/components/ui/entropy").then(mod => mod.Entropy), {
  ssr: false,
});


import { useAuthStore } from "@/stores/auth-store";

export default function Home() {
  const { isAuthenticated, restoreSession, loading } = useAuthStore();
  const [sessionRestored, setSessionRestored] = useState(false);
  const [splashCompleted, setSplashCompleted] = useState(false);

  useEffect(() => {
    restoreSession();
    setSessionRestored(true);
  }, [restoreSession]);

  const handleSplashComplete = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("creatoros_splash_visited", "true");
    }
    setSplashCompleted(true);
  };

  if (!sessionRestored) {
    return null;
  }

  const shouldShowSplash = !isAuthenticated && !splashCompleted;

  return (
    <>
      <AnimatePresence mode="wait">
        {shouldShowSplash && <SplashLoader onCompleteAction={handleSplashComplete} />}
      </AnimatePresence>

      {!shouldShowSplash && (
        <div className="relative min-h-screen bg-surface-0 overflow-hidden flex flex-col">
          {/* Dynamic Cursor spotlight glow & background floating orbs */}
          <InteractiveGlow />

          {/* Centered Entropy background animation */}
          <div className="absolute inset-x-0 top-0 h-[800px] flex items-center justify-center z-0 pointer-events-none opacity-20 mix-blend-screen overflow-hidden">
            <DynamicEntropy size={600} />
          </div>

          {/* Floating Glass Navbar */}
          <Navbar />

          {/* Main Marketing flow */}
          <main className="flex-1 pt-16">
            <Hero />

            <BrandMarquee />

            <FeaturesBento />

            <InfiniteMarquee />

            <Stats />

            <PricingCards />

            <Testimonials />

            <FAQ />

            <CTASection />
          </main>

          {/* Footer */}
          <Footer />
        </div>
      )}
    </>
  );
}

