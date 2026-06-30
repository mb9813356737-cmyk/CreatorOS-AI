"use client";

import React from "react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/layout/footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Calendar } from "lucide-react";

export default function PrivacyPolicyPage() {
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
            Legal Document
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight">
            Privacy Policy
          </h1>
          <div className="flex items-center justify-center gap-2 text-xs text-text-muted mt-2">
            <Calendar className="h-3.5 w-3.5" />
            <span>Last updated: July 1, 2026</span>
          </div>
        </div>

        {/* Content Card */}
        <Card className="border border-glass-border/20 bg-surface-100/50 backdrop-blur-md p-8 md:p-10 space-y-8 text-sm text-text-secondary leading-relaxed select-text">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">1. Introduction</h2>
            <p>
              Welcome to CreatorOS AI ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy describes how we collect, use, and share information when you use our website, application, services, or platforms.
            </p>
            <p>
              By accessing or using CreatorOS AI, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with any terms in this policy, please discontinue use of our service immediately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">2. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us when creating or modifying an account, making payments, or interacting with our services:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong className="text-text-primary">Account Credentials:</strong> Login credentials, profile information, name, email addresses, and niches/platforms specified during registration.
              </li>
              <li>
                <strong className="text-text-primary">Usage Content:</strong> The text prompts, inputs, scripts, and video descriptions that you enter into our templates to generate AI content.
              </li>
              <li>
                <strong className="text-text-primary">Billing and Payments:</strong> Payment credentials, billing details, and order transactions. Payment processing is handled exclusively by Razorpay, and we do not store raw credit/debit card numbers or UPI PINs on our servers.
              </li>
              <li>
                <strong className="text-text-primary">Device & Log Data:</strong> IP addresses, browser types, operating systems, referring URLs, and logs of API events.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">3. How We Use Your Information</h2>
            <p>
              We process your personal information for purposes based on legitimate business interests, performance of our contract with you, compliance with legal obligations, and consent:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To provide, operate, and maintain the CreatorOS AI platform.</li>
              <li>To facilitate billing, process payments, and verify subscriptions through Razorpay.</li>
              <li>To process inputs and send prompts to our integrated AI providers (such as Gemini and Claude APIs) to return content.</li>
              <li>To improve our user experience, customize features, and design templates.</li>
              <li>To respond to support requests, send administrative notices, and prevent security breaches.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">4. Third-Party Services and Data Sharing</h2>
            <p>
              We share data with trusted third-party providers only as necessary to deliver our services, process payments, and comply with law:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong className="text-text-primary">Razorpay:</strong> To process payments, verify subscription transactions, and facilitate refunds under KYC compliance.
              </li>
              <li>
                <strong className="text-text-primary">AI API Providers:</strong> Prompts and text inputs are securely shared with Google (Gemini API) and Anthropic (Claude API) for real-time text and media suggestions. None of your personal account details (e.g. email) are shared with LLM providers.
              </li>
              <li>
                <strong className="text-text-primary">Authentication (Clerk):</strong> User login and session synchronization are managed by Clerk.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">5. Cookies and Trackers</h2>
            <p>
              We use standard session cookies and local storage tokens to persist your authentication status, theme configuration (dark mode), and profile settings. You can manage cookie settings in your browser, but blocking essential cookies may prevent you from using the dashboard features.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">6. Data Security</h2>
            <p>
              We implement industry-standard administrative, physical, and digital security measures to safeguard your personal data. However, please remember that no transmission over the internet or database storage is 100% secure. You are responsible for keeping your login credentials confidential.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">7. Your Rights and Choices</h2>
            <p>
              Depending on your location, you have rights regarding your personal information:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>The right to request access and obtain a copy of your personal data.</li>
              <li>The right to correct inaccurate account fields.</li>
              <li>The right to request deletion of your account and related usage data.</li>
            </ul>
            <p>
              To exercise any of these rights, please email us at <a href="mailto:support@creatoros.ai" className="text-brand-400 hover:underline">support@creatoros.ai</a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">8. Contact Us</h2>
            <p>
              If you have any questions or comments about this Privacy Policy, please contact our privacy compliance officer at:
            </p>
            <div className="mt-2 p-4 rounded-lg bg-surface-200/50 border border-glass-border/10 text-xs">
              <p className="font-semibold text-text-primary">CreatorOS AI Privacy Support</p>
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
