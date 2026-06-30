"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Clock, MapPin, Send, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      // Simulate form submission API call or log it
      console.log("Contact form submitted:", formData);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast.success("Thank you! Your message has been received.");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 relative z-10 w-full flex flex-col justify-center">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <Badge variant="gradient" className="font-extrabold px-3 py-1 text-xs bg-linear-to-r from-pink-500 to-accent-500 text-white">
            Support
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight">
            Contact Us
          </h1>
          <p className="max-w-md mx-auto text-sm text-text-secondary">
            Got questions, feedback, or need help with your account? Fill out the form or reach out directly.
          </p>
        </div>

        {/* Grid split: Info card & Form */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
          {/* Info Card */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border border-glass-border/20 bg-surface-100/50 backdrop-blur-md p-6 space-y-6">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-brand-400" />
                Contact Info
              </h3>
              
              <div className="space-y-5 text-sm text-text-secondary">
                <div className="flex items-start gap-4">
                  <div className="h-9 w-9 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">Email Support</p>
                    <a href="mailto:support@creatoros.ai" className="hover:text-brand-400 transition-colors">
                      support@creatoros.ai
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-9 w-9 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                    <Clock className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">Response Time</p>
                    <p>We typically respond within 24-48 hours.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-9 w-9 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
                    <MapPin className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">Business Address</p>
                    <p className="leading-relaxed">CreatorOS AI Technologies,<br />Bengaluru, Karnataka, India</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Form */}
          <div className="md:col-span-3">
            <Card className="border border-glass-border/20 bg-surface-100/50 backdrop-blur-md p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-xs font-bold text-text-primary uppercase tracking-wide">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your Name"
                      className="w-full text-sm bg-surface-200/50 border border-glass-border/20 rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-text-muted"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-xs font-bold text-text-primary uppercase tracking-wide">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      className="w-full text-sm bg-surface-200/50 border border-glass-border/20 rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-text-muted"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-xs font-bold text-text-primary uppercase tracking-wide">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Subject of message"
                    className="w-full text-sm bg-surface-200/50 border border-glass-border/20 rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-text-muted"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-xs font-bold text-text-primary uppercase tracking-wide">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Describe your issue or request..."
                    rows={5}
                    className="w-full text-sm bg-surface-200/50 border border-glass-border/20 rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all placeholder:text-text-muted resize-none"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="glow"
                  className="w-full font-bold flex items-center justify-center gap-2 mt-2 h-10"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
