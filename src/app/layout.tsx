import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk, Geist } from "next/font/google";
import { ClerkProvider } from "@/lib/auth";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { ReactLenis } from "lenis/react";

// ─── Fonts ─────────────────────────────────────────────────
const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

// ─── Metadata ──────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: "CreatorOS AI — AI-Powered Creator Operating System",
    template: "%s | CreatorOS AI",
  },
  description:
    "The AI-powered Creator Operating System for Indian creators. Generate viral hooks, Hindi/Hinglish captions, Shorts scripts, thumbnail prompts, trend analysis, and viral score predictions.",
  keywords: [
    "AI creator tools",
    "viral hooks generator",
    "Hindi captions",
    "Hinglish captions",
    "YouTube shorts scripts",
    "thumbnail prompts",
    "content creator India",
    "viral score predictor",
    "trend analysis",
    "CreatorOS",
  ],
  authors: [{ name: "CreatorOS AI" }],
  creator: "CreatorOS AI",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "CreatorOS AI — AI-Powered Creator Operating System",
    description:
      "Generate viral hooks, captions, scripts & more with AI. Built for Indian creators.",
    siteName: "CreatorOS AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "CreatorOS AI",
    description:
      "AI-powered tools for Indian content creators. Generate viral content in seconds.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

import { SessionLoader } from "@/components/shared/session-loader";
import { cn } from "@/lib/utils";

import { Toaster } from "sonner";

// ─── Root Layout ───────────────────────────────────────────
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(spaceGrotesk.variable, jetbrainsMono.variable, "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-surface-0 text-text-primary font-sans antialiased">
        <ClerkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <SkeletonTheme baseColor="#141426" highlightColor="#1b1b33">
              <ReactLenis root>
                <SessionLoader>
                  {children}
                </SessionLoader>
              </ReactLenis>
              <Toaster richColors closeButton theme="dark" />
            </SkeletonTheme>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
