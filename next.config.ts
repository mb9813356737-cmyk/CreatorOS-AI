import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─── Performance ─────────────────────────────────────────
  reactStrictMode: true,
  poweredByHeader: false,

  // ─── Image Optimization ──────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "images.clerk.dev" },
      { protocol: "https", hostname: "**.googleusercontent.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // ─── Security Headers ───────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },

  // ─── Compiler Optimizations ─────────────────────────────
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },

  // ─── Experimental ───────────────────────────────────────
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
    ],
  },
};

export default nextConfig;
