"use client";

import React from "react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/layout/footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar } from "lucide-react";

export default function TermsAndConditionsPage() {
  return (
    <div className="relative min-h-screen bg-surface-0 overflow-hidden flex flex-col pt-28">
      {/* Background spotlights */}
      <div className="absolute inset-x-0 top-0 h-[800px] flex items-center justify-center z-0 pointer-events-none opacity-20 overflow-hidden">
        <div
          className="absolute left-[-200px] top-0 w-[600px] h-[600px] rounded-full"
          style={{
            border: "150px solid #6366f1",
            filter: "blur(120px)",
          }}
        />
        <div
          className="absolute right-[-200px] top-0 w-[600px] h-[600px] rounded-full"
          style={{
            border: "150px solid #a855f7",
            filter: "blur(120px)",
          }}
        />
      </div>

      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 relative z-10 w-full flex flex-col justify-center">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <Badge variant="gradient" className="font-extrabold px-3 py-1 text-xs bg-linear-to-r from-pink-500 to-accent-500 text-white">
            Terms of Use
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight">
            Terms & Conditions
          </h1>
          <div className="flex items-center justify-center gap-2 text-xs text-text-muted mt-2">
            <Calendar className="h-3.5 w-3.5" />
            <span>Last updated: July 1, 2026</span>
          </div>
        </div>

        {/* Content Card */}
        <Card className="border border-glass-border/20 bg-surface-100/50 backdrop-blur-md p-8 md:p-10 space-y-8 text-sm text-text-secondary leading-relaxed select-text">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">1. Agreement to Terms</h2>
            <p>
              These Terms & Conditions constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and CreatorOS AI ("we," "us," or "our"), concerning your access to and use of the CreatorOS AI website and application.
            </p>
            <p>
              By accessing the service, you acknowledge that you have read, understood, and agree to be bound by all of these Terms & Conditions. If you do not agree, you are prohibited from using the service and must terminate access immediately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">2. Description of Service</h2>
            <p>
              CreatorOS AI provides an AI-powered content creation operating system and suite of templates designed for content creators on platforms such as YouTube, Instagram, TikTok, LinkedIn, and others. The services include, but are not limited to: generating viral hooks, Hindi/Hinglish captions, video scripts, thumbnail prompts, trend analysis, and viral score predictions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">3. User Accounts & Security</h2>
            <p>
              To access certain tools and dashboard metrics, you must authenticate your identity. You agree to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Provide accurate, current, and complete profile information.</li>
              <li>Maintain the security and confidentiality of your credentials.</li>
              <li>Notify us immediately if you suspect unauthorized access or any security breach.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">4. Billing, Subscriptions & Razorpay Integration</h2>
            <p>
              We offer both free trial quotas and paid premium plans (Pro and Agency memberships).
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong className="text-text-primary">Billing Cycle:</strong> Paid subscriptions are billed on a recurring monthly basis via Razorpay. Your billing period starts on the day you upgrade.
              </li>
              <li>
                <strong className="text-text-primary">Auto-Renewal:</strong> Subscriptions automatically renew each month unless you cancel before the next renewal date.
              </li>
              <li>
                <strong className="text-text-primary">Cancellation:</strong> You can cancel your subscription at any time. Cancellation stops future automatic renewals, and you will retain dashboard access until your current billing period ends.
              </li>
              <li>
                <strong className="text-text-primary">Fees:</strong> We reserve the right to change our subscription rates, but will notify you in advance of any price changes.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">5. Acceptable Use Policy</h2>
            <p>
              You agree not to use CreatorOS AI to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Generate illegal, abusive, defamatory, harassing, or hate-speech content.</li>
              <li>Attempt to reverse-engineer, exploit, or bypass service restrictions, rate-limiters, or credit meters.</li>
              <li>Resell, share, or lease access to your subscription or user account to third parties.</li>
              <li>Upload malicious code, scrapers, or launch automated scripts targeting our servers.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">6. Intellectual Property Rights</h2>
            <p>
              <strong className="text-text-primary">Our Technology:</strong> We own all proprietary software, designs, algorithms, codebases, interfaces, branding, and assets on the CreatorOS AI platform.
            </p>
            <p>
              <strong className="text-text-primary">Your Content:</strong> You own all intellectual property rights in the text, scripts, outputs, prompts, and suggestions generated using our AI models. We claim no ownership over your generated content.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, CreatorOS AI and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues (whether incurred directly or indirectly), arising from your use of or inability to use the AI services or platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">8. Governing Law & Jurisdiction</h2>
            <p>
              These Terms & Conditions and your use of CreatorOS AI shall be governed by and construed in accordance with the laws of India, without regard to conflict of law principles. Any legal action or proceeding arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in Bengaluru, Karnataka, India.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">9. Contact Us</h2>
            <p>
              If you have any questions or queries regarding these Terms & Conditions, please contact us at:
            </p>
            <div className="mt-2 p-4 rounded-lg bg-surface-200/50 border border-glass-border/10 text-xs">
              <p className="font-semibold text-text-primary">CreatorOS AI Terms Coordinator</p>
              <p className="mt-1">Email: <a href="mailto:support@creatoros.ai" className="text-brand-400 hover:underline">support@creatoros.ai</a></p>
              <p>Address: Bengaluru, Karnataka, India</p>
            </div>
          </section>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
