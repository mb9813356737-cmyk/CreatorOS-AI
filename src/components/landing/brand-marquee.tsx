"use client";

import React from "react";
import { Music, Share2, Compass, Layers } from "lucide-react";

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
    <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const BRANDS = [
  { name: "YouTube Shorts", icon: YoutubeIcon, color: "text-[#FF0000]" },
  { name: "Instagram Reels", icon: InstagramIcon, color: "text-[#E1306C]" },
  { name: "Moj App", icon: Music, color: "text-[#FFD700]" },
  { name: "Spotify Podcast", icon: Compass, color: "text-[#1DB954]" },
  { name: "LinkedIn Video", icon: Layers, color: "text-[#0A66C2]" },
  { name: "Josh App", icon: Share2, color: "text-[#FF4500]" },
];

export function BrandMarquee() {
  return (
    <section className="py-10 border-y border-glass-border/10 bg-surface-50/10 overflow-hidden relative select-none w-full">
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-surface-0 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-surface-0 to-transparent z-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 text-center mb-6">
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Optimized for Major Bharatiya Platforms</p>
      </div>

      <div className="flex w-max relative">
        {/* First Marquee Row */}
        <div className="flex gap-16 items-center animate-[marquee_25s_linear_infinite] shrink-0 px-8">
          {BRANDS.concat(BRANDS).map((brand, idx) => (
            <div key={idx} className="flex items-center gap-2.5 opacity-40 hover:opacity-85 transition-opacity duration-300 group cursor-default">
              <brand.icon className={`h-5.5 w-5.5 transition-transform duration-300 group-hover:scale-110 ${brand.color}`} />
              <span className="font-bold text-sm text-text-primary tracking-tight font-sans">{brand.name}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}
