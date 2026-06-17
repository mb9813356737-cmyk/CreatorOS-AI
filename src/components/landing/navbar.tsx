"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth, UserButton } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Sparkles, Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { isSignedIn } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full flex justify-center py-4 select-none pointer-events-none">
      <div
        className={cn(
          "w-[calc(100%-2rem)] max-w-5xl flex items-center justify-between px-6 py-2.5 rounded-full border transition-all duration-300 pointer-events-auto",
          scrolled
            ? "glass-strong border-glass-border-hover/30 shadow-elevated scale-[0.99] bg-surface-50/90"
            : "glass border-glass-border/30 shadow-cinematic bg-surface-0/40"
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <motion.div
            whileHover={{ rotate: 12, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="flex h-8.5 w-8.5 items-center justify-center rounded-lg bg-linear-to-br from-brand-500 to-accent-500 shadow-glow-sm group-hover:shadow-glow-cyan transition-shadow"
          >
            <Sparkles className="h-4.5 w-4.5 text-white" />
          </motion.div>
          <span className="font-extrabold text-sm tracking-tight text-text-primary group-hover:text-white transition-colors">
            Creator<span className="bg-linear-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent font-black">OS</span> AI
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wide uppercase">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-text-secondary hover:text-accent-400 hover:translate-y-[-0.5px] transition-all relative group py-1"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-accent-500 group-hover:w-full transition-all duration-300 rounded-full" />
            </a>
          ))}
        </nav>

        {/* Auth / Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {isSignedIn ? (
            <>
              <Link href="/dashboard">
                <Button
                  variant="glow"
                  size="sm"
                  className="text-[11px] font-extrabold uppercase border border-brand-500/20 group/btn h-9 px-4 rounded-full"
                  rightIcon={<ArrowRight className="h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />}
                >
                  Dashboard
                </Button>
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox:
                      "h-8.5 w-8.5 border border-brand-500/30 hover:border-brand-500 transition-colors shadow-glow-sm",
                  },
                }}
              />
            </>
          ) : (
            <Link href="/sign-in">
              <Button
                variant="glow"
                size="sm"
                className="text-[11px] font-extrabold uppercase border border-brand-500/20 group/btn h-9 px-4 rounded-full"
                rightIcon={<ArrowRight className="h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />}
              >
                Dashboard
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex h-8.5 w-8.5 items-center justify-center rounded-full border border-glass-border/40 hover:bg-surface-100 text-text-secondary hover:text-text-primary transition-all cursor-pointer"
        >
          {mobileMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-5xl rounded-2xl border border-glass-border/20 bg-surface-0/95 backdrop-blur-xl overflow-hidden pointer-events-auto shadow-elevated"
          >
            <div className="px-6 py-6 space-y-4 flex flex-col">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-text-secondary hover:text-accent-400 font-bold text-sm py-1 border-b border-glass-border/10"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-3 pt-2">
                {isSignedIn ? (
                  <div className="flex items-center justify-between gap-4 border-t border-glass-border/20 pt-4">
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                      <Button variant="glow" className="w-full justify-center text-xs font-bold uppercase rounded-full">
                        Go to Dashboard
                      </Button>
                    </Link>
                    <UserButton
                      appearance={{
                        elements: {
                          userButtonAvatarBox:
                            "h-9 w-9 border border-brand-500/30 hover:border-brand-500 transition-colors shadow-glow-sm",
                        },
                      }}
                    />
                  </div>
                ) : (
                  <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="glow" className="w-full justify-center text-xs font-bold uppercase rounded-full">
                      Go to Dashboard
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
