"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShaderBackground } from "@/components/ui/shader-background";
import { Entropy } from "@/components/ui/entropy";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "How does the Hinglish translation engine work?",
    answer: "Our translation model is fine-tuned to balance standard Hindi slang, English technical terms, and high-CTR social media structures. It converts corporate or plain English sentences into natural, engaging spoken Hinglish, exactly like top Indian creators speak.",
  },
  {
    question: "Do my unused credits roll over to the next month?",
    answer: "No, credits reset monthly at the start of your billing cycle to ensure maximum pipeline efficiency. Pro plans receive 500 credits per month, while Agency tiers offer unlimited credits.",
  },
  {
    question: "Can I cancel my Pro/Agency subscription anytime?",
    answer: "Absolutely. You can cancel, upgrade, or downgrade your plan directly from the Billing settings page at any time. Once cancelled, your plan benefits remain active until the end of your current 30-day billing cycle.",
  },
  {
    question: "Are payment transactions secure?",
    answer: "Yes, all transactions are processed through Razorpay, India's leading payment gateway. CreatorOS AI does not store credit card details or bank credentials. All subscription events are authenticated server-side using HMAC SHA-256 signatures.",
  },
  {
    question: "Can I connect my actual OpenAI or Gemini key?",
    answer: "By default, the platform runs on our premium shared API clusters. However, if you hit token limits, you can easily insert your own API keys in your profile settings to switch to direct local request piping.",
  },
];

function FAQAccordionItem({ item, isOpen, onClick }: { item: FAQItem; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="border border-glass-border rounded-xl bg-surface-50/20 backdrop-blur-xs overflow-hidden select-none">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-5 text-left text-text-primary hover:text-brand-400 hover:bg-surface-50/40 transition-all font-bold text-sm cursor-pointer"
      >
        <span>{item.question}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-text-secondary shrink-0 transition-transform duration-300",
            isOpen && "rotate-180 text-brand-400"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden bg-surface-50/10 border-t border-glass-border/10"
          >
            <div className="p-5 text-xs text-text-secondary leading-relaxed">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="py-20 max-w-4xl mx-auto px-6 relative z-10 select-none overflow-hidden" id="faq">
      {/* WebGL Shader Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 overflow-hidden">
        <ShaderBackground />
      </div>

      {/* Entropy Particle Grid */}
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none opacity-15 mix-blend-screen overflow-hidden">
        <Entropy size={1000} />
      </div>


      <div className="text-center space-y-3.5 mb-16">
        <Badge variant="gradient" className="font-extrabold px-3 py-1 text-xs">Help Center</Badge>
        <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
          Frequently Asked <span className="gradient-text">Questions</span>
        </h2>
        <p className="max-w-md mx-auto text-sm text-text-secondary">
          Find fast answers to billing queries, credit rollouts, and translation specifications.
        </p>
      </div>

      <div className="space-y-4">
        {FAQS.map((faq, idx) => (
          <FAQAccordionItem
            key={idx}
            item={faq}
            isOpen={openIdx === idx}
            onClick={() => toggle(idx)}
          />
        ))}
      </div>
    </section>
  );
}
