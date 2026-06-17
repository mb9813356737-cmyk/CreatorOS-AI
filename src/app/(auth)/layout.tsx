"use client";

import { FloatingParticles } from "@/components/shared/floating-particles";
import { Entropy } from "@/components/ui/entropy";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-surface-0 relative overflow-hidden px-4 select-none">
      {/* Background aesthetics */}
      <FloatingParticles />
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(124,58,237,0.08)_0%,transparent_70%)]" />

      {/* Centered Entropy background animation */}
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none opacity-25 mix-blend-screen">
        <Entropy size={800} />
      </div>

      {/* Main card wrapper */}
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
