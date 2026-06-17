"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { XCircle, AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function PaymentFailurePage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-error-500/5 rounded-full filter blur-[80px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        <Card variant="glass" hoverEffect={false} className="border-error-500/20 overflow-hidden relative">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-error-500" />
          
          <CardHeader className="text-center pt-8 pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.15 }}
              className="h-16 w-16 mx-auto bg-error-500/10 border border-error-500/30 rounded-2xl flex items-center justify-center mb-4 shadow-glow-sm shadow-error-500/10"
            >
              <XCircle className="h-9 w-9 text-error-400" />
            </motion.div>

            <Badge variant="outline" className="text-[10px] border-error-500/30 text-error-400 font-extrabold tracking-wider uppercase mb-2 mx-auto">
              Checkout Interrupted
            </Badge>

            <CardTitle className="text-2xl md:text-3xl font-extrabold tracking-tight text-text-primary">
              Payment Unsuccessful
            </CardTitle>
            <p className="text-xs text-text-secondary mt-1.5 max-w-sm mx-auto leading-relaxed">
              We couldn&apos;t complete your checkout session. Your account has not been charged, and your active tier remains unchanged.
            </p>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            <div className="p-4 rounded-lg bg-surface-100/50 border border-glass-border/30 text-xs">
              <h4 className="font-bold text-text-primary mb-2 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-warning-400" />
                Common Troubleshooting Checklist:
              </h4>
              <ul className="space-y-2 text-text-secondary list-disc pl-4">
                <li>Check if international transactions are enabled on your card.</li>
                <li>Verify you have sufficient funds or your credit limit is not exceeded.</li>
                <li>Ensure the OTP or 3D Secure verification wasn&apos;t entered incorrectly or expired.</li>
                <li>Try selecting UPI or alternative net-banking options at checkout.</li>
              </ul>
            </div>

            <div className="text-center py-1">
              <p className="text-[11px] text-text-muted">
                If the amount was deducted from your bank, Razorpay will initiate an automatic refund within 3-5 business days.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6">
            <Link href="/billing" className="w-full sm:flex-1">
              <Button className="w-full font-bold" leftIcon={<RefreshCw className="h-4 w-4" />}>
                Try Again
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full sm:flex-1">
              <Button variant="secondary" className="w-full font-bold" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Back to Safety
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
