import {
  Sparkles,
  MessageSquareText,
  Film,
  Image,
  TrendingUp,
  BarChart3,
  Repeat2,
  LayoutDashboard,
  History,
  Settings,
  CreditCard,
  type LucideIcon,
} from "lucide-react";

// ─── Plan Configuration ────────────────────────────────────
export const PLANS = {
  FREE: {
    id: "FREE" as const,
    name: "Starter",
    description: "Get started with basic AI tools",
    price: 0,
    priceDisplay: "₹0",
    period: "forever",
    credits: 10,
    features: [
      "10 generations/month",
      "Viral hook generator",
      "Caption generator",
      "Basic support",
    ],
    limits: {
      VIRAL_HOOK: true,
      CAPTION: true,
      SCRIPT: false,
      THUMBNAIL: false,
      TREND: false,
      VIRAL_SCORE: false,
      REPURPOSE: false,
    },
  },
  PRO: {
    id: "PRO" as const,
    name: "Pro",
    description: "For serious creators who want to grow",
    price: 49900, // paise
    priceDisplay: "₹499",
    period: "month",
    credits: 500,
    popular: true,
    features: [
      "500 generations/month",
      "All AI tools unlocked",
      "Viral score prediction",
      "Trend analysis",
      "Thumbnail prompts",
      "Shorts scripts",
      "Priority support",
    ],
    limits: {
      VIRAL_HOOK: true,
      CAPTION: true,
      SCRIPT: true,
      THUMBNAIL: true,
      TREND: true,
      VIRAL_SCORE: true,
      REPURPOSE: false,
    },
  },
  AGENCY: {
    id: "AGENCY" as const,
    name: "Agency",
    description: "For teams and agencies managing multiple creators",
    price: 199900, // paise
    priceDisplay: "₹1,999",
    period: "month",
    credits: -1, // unlimited
    features: [
      "Unlimited generations",
      "All AI tools unlocked",
      "Content repurposing",
      "API access",
      "Priority support",
      "Custom prompts",
      "Team management (coming soon)",
    ],
    limits: {
      VIRAL_HOOK: true,
      CAPTION: true,
      SCRIPT: true,
      THUMBNAIL: true,
      TREND: true,
      VIRAL_SCORE: true,
      REPURPOSE: true,
    },
  },
} as const;

export type PlanId = keyof typeof PLANS;

// ─── Navigation ────────────────────────────────────────────
export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  requiresPlan?: PlanId[];
}

export const DASHBOARD_NAV: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Viral Hooks",
    href: "/hooks",
    icon: Sparkles,
  },
  {
    label: "Captions",
    href: "/captions",
    icon: MessageSquareText,
  },
  {
    label: "Scripts",
    href: "/scripts",
    icon: Film,
  },
  {
    label: "Thumbnails",
    href: "/thumbnails",
    icon: Image,
  },
  {
    label: "Trends",
    href: "/trends",
    icon: TrendingUp,
    badge: "New",
  },
  {
    label: "Viral Score",
    href: "/viral-score",
    icon: BarChart3,
  },
  {
    label: "Repurpose",
    href: "/repurpose",
    icon: Repeat2,
    badge: "Pro",
  },
];

export const DASHBOARD_NAV_BOTTOM: NavItem[] = [
  {
    label: "History",
    href: "/history",
    icon: History,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    label: "Billing",
    href: "/billing",
    icon: CreditCard,
  },
];

// ─── Platform Options ──────────────────────────────────────
export const PLATFORMS = [
  { value: "youtube", label: "YouTube", emoji: "🎬" },
  { value: "instagram", label: "Instagram", emoji: "📸" },
  { value: "twitter", label: "Twitter/X", emoji: "🐦" },
  { value: "linkedin", label: "LinkedIn", emoji: "💼" },
  { value: "shorts", label: "YT Shorts", emoji: "📱" },
  { value: "reels", label: "Reels", emoji: "🎞️" },
] as const;

// ─── Tone Options ──────────────────────────────────────────
export const TONES = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "humorous", label: "Humorous" },
  { value: "motivational", label: "Motivational" },
  { value: "educational", label: "Educational" },
  { value: "controversial", label: "Controversial" },
  { value: "storytelling", label: "Storytelling" },
  { value: "emotional", label: "Emotional" },
  { value: "shocking", label: "Shocking" },
  { value: "hindi", label: "Hindi" },
  { value: "haryanvi", label: "Haryanvi" },
  { value: "genz", label: "Gen-Z" },
  { value: "luxury", label: "Luxury" },
] as const;

// ─── Language Options ──────────────────────────────────────
export const LANGUAGES = [
  { value: "english", label: "English" },
  { value: "hindi", label: "Hindi" },
  { value: "hinglish", label: "Hinglish" },
  { value: "haryanvi", label: "Haryanvi" },
] as const;

// ─── App Constants ─────────────────────────────────────────
export const APP_NAME = "CreatorOS AI";
export const APP_DESCRIPTION =
  "AI-powered Creator Operating System for Indian creators. Generate viral hooks, captions, scripts, and more.";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// ─── Rate Limits ───────────────────────────────────────────
export const RATE_LIMITS = {
  FREE: { maxRequests: 5, windowMs: 60_000 },    // 5 req/min
  PRO: { maxRequests: 30, windowMs: 60_000 },     // 30 req/min
  AGENCY: { maxRequests: 100, windowMs: 60_000 }, // 100 req/min
} as const;

// ─── Generation Types Metadata ─────────────────────────────
export const GENERATION_TYPES = {
  VIRAL_HOOK: {
    label: "Viral Hooks",
    description: "Generate scroll-stopping hooks for your content",
    icon: Sparkles,
    color: "brand",
    href: "/hooks",
  },
  CAPTION: {
    label: "Captions",
    description: "Hindi/Hinglish captions with trending hashtags",
    icon: MessageSquareText,
    color: "accent",
    href: "/captions",
  },
  SCRIPT: {
    label: "Scripts",
    description: "Complete Shorts & Reels scripts with timestamps",
    icon: Film,
    color: "pink",
    href: "/scripts",
  },
  THUMBNAIL: {
    label: "Thumbnails",
    description: "CTR-optimized thumbnail prompts for AI generation",
    icon: Image,
    color: "emerald",
    href: "/thumbnails",
  },
  TREND: {
    label: "Trend Analysis",
    description: "Discover trending topics in your niche",
    icon: TrendingUp,
    color: "amber",
    href: "/trends",
  },
  VIRAL_SCORE: {
    label: "Viral Score",
    description: "Predict virality potential of your content",
    icon: BarChart3,
    color: "brand",
    href: "/viral-score",
  },
  REPURPOSE: {
    label: "Repurpose",
    description: "Transform content across platforms",
    icon: Repeat2,
    color: "accent",
    href: "/repurpose",
  },
} as const;
