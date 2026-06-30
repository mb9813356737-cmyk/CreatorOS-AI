"use client";

import React from "react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/layout/footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Calendar } from "lucide-react";

export default function RefundPolicyPage() {
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
            Refunds & Cancellations
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight">
            Refund & Cancellation Policy
          </h1>
          <div className="flex items-center justify-center gap-2 text-xs text-text-muted mt-2">
            <Calendar className="h-3.5 w-3.5" />
            <span>Last updated: July 1, 2026</span>
          </div>
        </div>

        {/* Content Card */}
        <Card className="border border-glass-border/20 bg-surface-100/50 backdrop-blur-md p-8 md:p-10 space-y-8 text-sm text-text-secondary leading-relaxed select-text">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">1. Overview</h2>
            <p>
              CreatorOS AI is a digital subscription service providing AI-powered content generation tools for creators. Because our platform offers instant access to our proprietary algorithms and premium templates upon subscription activation, we maintain a clear refund and cancellation policy as outlined below.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">2. Cancellation Policy</h2>
            <p>
              You are free to cancel your active premium subscription at any time.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong className="text-text-primary">Self-Service Cancellation:</strong> You may cancel your subscription anytime directly from the <strong className="text-text-primary">Billing</strong> section in your Settings dashboard page.
              </li>
              <li>
                <strong className="text-text-primary">Access Post-Cancellation:</strong> Upon cancellation, the auto-renewal for future cycles will be stopped. You will retain full access to all upgraded tools and remaining credit quotas until the end of your current active billing cycle. No further amounts will be debited from your payment method.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">3. Refund Policy</h2>
            <p>
              Due to the digital and instant-access nature of our service:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong className="text-text-primary">No Standard Refunds:</strong> We do not offer standard refunds once a billing cycle has started, payments have been processed, and the service has been accessed.
              </li>
              <li>
                <strong className="text-text-primary">Technical Error Exceptions:</strong> If you experience a critical technical issue that prevents you from accessing the platform or generating content, please contact our support team at <a href="mailto:support@creatoros.ai" className="text-brand-400 hover:underline">support@creatoros.ai</a> within 7 days of the transaction. We will investigate the issue and, if verified, issue a proportional or full refund.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">4. Refund Processing and Timeline</h2>
            <p>
              When a refund is approved by our compliance and billing team:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong className="text-text-primary">Payment Route:</strong> The refund will be credited back to the original payment method (Credit Card, Debit Card, NetBanking, or UPI) that you used during purchase.
              </li>
              <li>
                <strong className="text-text-primary">Processing Provider:</strong> All refunds are processed securely via our gateway partner, Razorpay.
              </li>
              <li>
                <strong className="text-text-primary">Timeline:</strong> The refunded amount will typically appear in your account within <strong className="text-text-primary">5-7 business days</strong>, depending on your bank's processing times.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">5. Deductions and Activation Failures</h2>
            <p>
              In rare instances of connection dropouts, if money is debited from your card/UPI account but your CreatorOS AI subscription is not upgraded on the dashboard due to a technical error, you are eligible for a full refund or manual plan activation:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Please email <a href="mailto:support@creatoros.ai" className="text-brand-400 hover:underline">support@creatoros.ai</a> with your account email address, payment receipt, and Razorpay Order/Payment ID.
              </li>
              <li>
                Our billing administrators will verify the log transaction and manually activate your plan or approve the refund request immediately.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-text-primary">6. Contact for Refund Requests</h2>
            <p>
              For all cancellations support, billing discrepancies, or refund queries, contact us at:
            </p>
            <div className="mt-2 p-4 rounded-lg bg-surface-200/50 border border-glass-border/10 text-xs">
              <p className="font-semibold text-text-primary">CreatorOS AI Billing Support</p>
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
