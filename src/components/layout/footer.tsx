import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-glass-border/20 bg-surface-0/80 backdrop-blur-md py-12 px-6 select-none relative z-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Column */}
        <div className="space-y-4 col-span-1 md:col-span-2">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-text-primary">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-brand-500 to-accent-400 shadow-glow-sm">
              <Sparkles className="h-4.5 w-4.5 text-white" />
            </div>
            <span>Creator<span className="bg-linear-to-r from-brand-500 to-accent-400 bg-clip-text text-transparent font-black">OS</span> AI</span>
          </Link>
          <p className="text-sm text-text-secondary max-w-sm leading-relaxed">
            The premium all-in-one Creator Operating System for Indian creators. Build, score, and scale your content like a professional.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-lg border border-glass-border/40 hover:border-brand-500 hover:text-brand-400 flex items-center justify-center text-text-secondary transition-all cursor-pointer">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-lg border border-glass-border/40 hover:border-brand-500 hover:text-brand-400 flex items-center justify-center text-text-secondary transition-all cursor-pointer">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.53 3.54 12 3.54 12 3.54s-7.53 0-9.388.515a3.003 3.003 0 0 0-2.11 2.108C0 8.017 0 12 0 12s0 3.983.51 5.837a3.003 3.003 0 0 0 2.11 2.108C4.47 20.46 12 20.46 12 20.46s7.53 0 9.388-.515a3.003 3.003 0 0 0 2.11-2.108C24 15.983 24 12 24 12s0-3.983-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-lg border border-glass-border/40 hover:border-brand-500 hover:text-brand-400 flex items-center justify-center text-text-secondary transition-all cursor-pointer">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"/></svg>
            </a>
          </div>
        </div>

        {/* Links Column */}
        <div className="space-y-3.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">Product</h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/features" className="text-text-secondary hover:text-brand-400 transition-colors">Features</Link>
            </li>
            <li>
              <Link href="/pricing" className="text-text-secondary hover:text-brand-400 transition-colors">Pricing</Link>
            </li>
            <li>
              <Link href="/dashboard" className="text-text-secondary hover:text-brand-400 transition-colors">Dashboard</Link>
            </li>
            <li>
              <Link href="/contact" className="text-text-secondary hover:text-brand-400 transition-colors">Contact Us</Link>
            </li>
          </ul>
        </div>

        {/* Legal Column */}
        <div className="space-y-3.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary">Legal</h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/privacy-policy" className="text-text-secondary hover:text-brand-400 transition-colors">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/terms-and-conditions" className="text-text-secondary hover:text-brand-400 transition-colors">Terms & Conditions</Link>
            </li>
            <li>
              <Link href="/refund-policy" className="text-text-secondary hover:text-brand-400 transition-colors">Refund Policy</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-glass-border/20 flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-4">
        <span>&copy; {new Date().getFullYear()} CreatorOS AI. All rights reserved. Made for Indian Creators.</span>
        <span>Premium Cinematic Experience</span>
      </div>
    </footer>
  );
}
