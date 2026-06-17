import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { ClerkProvider } from "@/lib/auth";
import "./globals.css";

// ─── Fonts ─────────────────────────────────────────────────
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

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

// ─── Root Layout ───────────────────────────────────────────
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-surface-0 text-text-primary font-sans antialiased">
        <ClerkProvider>
          <SessionLoader>
            {children}
          </SessionLoader>
        </ClerkProvider>
      </body>
    </html>
  );
}
