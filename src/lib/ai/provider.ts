import { db } from "@/lib/prisma";
import crypto from "crypto";
import { logTelemetry } from "./cost-tracker";
import { getSystemSettings } from "@/lib/system-settings";

export interface GenerateOptions {
  maxTokens?: number;
  temperature?: number;
  model?: string;
  userId?: string;
}

export interface AIResponse {
  content: string;
  tokens: number;
  model: string;
  provider: "gemini" | "groq" | "openai";
}

type AIProviderType = "openai" | "gemini" | "groq";

interface ProviderConfig {
  apiKey: string;
  baseUrl: string;
  defaultModel: string;
}

// ─── Provider Configs ──────────────────────────────────────
function getProviderConfig(provider: AIProviderType): ProviderConfig {
  switch (provider) {
    case "openai":
      return {
        apiKey: process.env.OPENAI_API_KEY || "",
        baseUrl: "https://api.openai.com/v1",
        defaultModel: "gpt-4o",
      };
    case "gemini":
      return {
        apiKey: process.env.GOOGLE_GENERATIVE_AI_KEY || "",
        baseUrl: "https://generativelanguage.googleapis.com/v1beta",
        defaultModel: "gemini-2.5-flash",
      };
    case "groq":
      return {
        apiKey: process.env.GROQ_API_KEY || "",
        baseUrl: "https://api.groq.com/openai/v1",
        defaultModel: "llama-3.3-70b-specdec",
      };
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}

// Helper: Update provider health status in the DB
async function updateProviderHealth(provider: string, isUp: boolean, latencyMs: number) {
  try {
    await db.providerHealth.upsert({
      where: { provider },
      create: {
        provider,
        isUp,
        errorCount: isUp ? 0 : 1,
        averageLatency: latencyMs,
        uptimePercentage: isUp ? 100.0 : 0.0,
      },
      update: {
        isUp,
        errorCount: isUp ? { set: 0 } : { increment: 1 },
        averageLatency: { set: latencyMs },
        lastCheckedAt: new Date(),
      },
    });
  } catch (err) {
    // DB offline or un-migrated, skip gracefully
  }
}

// ─── Unified Generate Function with Failover Retries ────────
export async function generateAI(
  systemPrompt: string,
  userPrompt: string,
  options: GenerateOptions = {}
): Promise<AIResponse> {
  const { userId = "demo_user", maxTokens = 2048, temperature = 0.8, model } = options;

  // 1. Redis Cache Check
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (upstashUrl && upstashToken) {
    try {
      const promptHash = crypto
        .createHash("sha256")
        .update(systemPrompt + userPrompt)
        .digest("hex");
      const cacheKey = `ai:cache:${promptHash}`;

      const res = await fetch(`${upstashUrl}/get/${cacheKey}`, {
        headers: { Authorization: `Bearer ${upstashToken}` },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.result) {
          const cached = JSON.parse(data.result);
          console.log("[AI Cache] Cache hit retrieved successfully.");
          
          // Log cost analytics telemetry for cache hit (free/internal profit)
          logTelemetry({
            userId,
            provider: cached.provider,
            model: cached.model,
            promptText: systemPrompt + userPrompt,
            completionText: cached.content,
            responseTimeMs: 5,
            cacheHit: true,
          });

          return cached;
        }
      }
    } catch (cacheErr) {
      console.warn("[AI Cache] Failed to lookup Redis cache:", cacheErr);
    }
  }

  // 2. Sequential Failover Pipeline Execution
  const settings = await getSystemSettings();
  const providerSetting = settings.activeModel; // "gemini-flash" | "gpt-4o" | "llama3-groq"

  // Ordered fallback sequence starting with system active model or default
  const sequence: AIProviderType[] = [];
  if (providerSetting === "gemini-flash") {
    sequence.push("gemini", "groq", "openai");
  } else if (providerSetting === "gpt-4o") {
    sequence.push("openai", "gemini", "groq");
  } else if (providerSetting === "llama3-groq") {
    sequence.push("groq", "gemini", "openai");
  } else {
    sequence.push("gemini", "groq", "openai");
  }

  // Filter sequence: unique values
  const uniqueSequence = Array.from(new Set(sequence));

  let lastError: any = null;

  for (const currentProvider of uniqueSequence) {
    const config = getProviderConfig(currentProvider);
    if (!config.apiKey || config.apiKey.includes("placeholder") || config.apiKey === "") {
      console.warn(`[AI Failover] Skipped ${currentProvider} due to missing API key.`);
      continue;
    }

    const selectedModel = model || config.defaultModel;
    const startTime = Date.now();

    try {
      console.log(`[AI Failover] Trying provider ${currentProvider} utilizing model ${selectedModel}...`);
      let result: { content: string; tokens: number };

      if (currentProvider === "gemini") {
        result = await generateGemini(config, systemPrompt, userPrompt, {
          maxTokens,
          temperature,
          model: selectedModel,
        });
      } else {
        // OpenAI / Groq compatible API
        const response = await fetch(`${config.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            max_tokens: maxTokens,
            temperature,
          }),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`API error (${response.status}): ${errorBody}`);
        }

        const data = await response.json();
        result = {
          content: data.choices[0]?.message?.content || "",
          tokens: data.usage?.total_tokens || 0,
        };
      }

      const responseTime = Date.now() - startTime;
      console.log(`[AI Failover] Success: ${currentProvider} resolved request in ${responseTime}ms.`);

      const finalResponse: AIResponse = {
        content: result.content,
        tokens: result.tokens,
        model: selectedModel,
        provider: currentProvider,
      };

      // 3. Log System Telemetry & Provider Health
      updateProviderHealth(currentProvider, true, responseTime);
      logTelemetry({
        userId,
        provider: currentProvider,
        model: selectedModel,
        promptText: systemPrompt + userPrompt,
        completionText: result.content,
        responseTimeMs: responseTime,
        cacheHit: false,
      });

      // 4. Cache response in Redis
      if (upstashUrl && upstashToken) {
        try {
          const promptHash = crypto
            .createHash("sha256")
            .update(systemPrompt + userPrompt)
            .digest("hex");
          const cacheKey = `ai:cache:${promptHash}`;

          await fetch(`${upstashUrl}/set/${cacheKey}/EX/3600`, {
            method: "POST",
            headers: { Authorization: `Bearer ${upstashToken}` },
            body: JSON.stringify(finalResponse),
          });
        } catch (cacheErr) {
          console.warn("[AI Cache] Failed to write to Redis cache:", cacheErr);
        }
      }

      return finalResponse;
    } catch (err: any) {
      const latency = Date.now() - startTime;
      console.error(`[AI Failover] Provider ${currentProvider} failed after ${latency}ms:`, err.message || err);
      updateProviderHealth(currentProvider, false, latency);
      lastError = err;
    }
  }

  throw new Error(
    `AI Generation failed across all fallback providers. Last error: ${lastError?.message || "Unknown error"}`
  );
}

// ─── Gemini-specific handler ───────────────────────────────
async function generateGemini(
  config: ProviderConfig,
  systemPrompt: string,
  userPrompt: string,
  options: Omit<Required<GenerateOptions>, "userId">
): Promise<{ content: string; tokens: number }> {
  const url = `${config.baseUrl}/models/${options.model}:generateContent?key=${config.apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: userPrompt }] }],
      generationConfig: {
        maxOutputTokens: options.maxTokens,
        temperature: options.temperature,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const tokens =
    (data.usageMetadata?.promptTokenCount || 0) +
    (data.usageMetadata?.candidatesTokenCount || 0);

  return { content, tokens };
}

// ─── Mock fallback for development ─────────────────────────
export async function generateMock(
  _systemPrompt: string,
  userPrompt: string
): Promise<AIResponse> {
  // Simulate latency
  await new Promise((r) => setTimeout(r, 1000 + Math.random() * 2000));

  if (_systemPrompt.includes("REPURPOSE") || _systemPrompt.includes("repurpose")) {
    const isYoutube = userPrompt.includes("youtube.com") || userPrompt.includes("youtu.be") || userPrompt.includes("youtubeUrl") || userPrompt.includes("youtu");
    if (isYoutube) {
      const match = userPrompt.match(/https?:\/\/[^\s]+/);
      const videoUrl = match ? match[0] : "https://youtube.com/watch?v=dQw4w9WgXcQ";
      const mockJson = {
        original_video: {
          title: "How I Built a $10,000/Month SaaS in 30 Days (Step-by-Step Guide)",
          url: videoUrl
        },
        shorts: [
          {
            id: 1,
            title: "The Ultimate 3-Step SaaS Blueprint",
            timestamp_range: "01:15 - 02:05",
            hook_strength: 95,
            estimated_ctr: "9.2%",
            scenes: [
              {
                timestamp: "0:00 - 0:05",
                dialogue: "Building a SaaS is simple. But 99% of people fail because they build the WRONG product first.",
                visual_cue: "A dynamic zoom-in on the speaker's face with a vibrant background overlay of tech graphics.",
                audio_cue: "Dramatic cinematic drop sound effect followed by a fast rhythmic beat.",
                text_overlay: "THE 99% FAIL!"
              },
              {
                timestamp: "0:05 - 0:25",
                dialogue: "Here is the golden rule: Never write a single line of code until you have at least 5 paying customers who pre-ordered it. Go to Reddit, find the pain points, and offer the solution.",
                visual_cue: "Screen recording of a landing page with a cursor highlighting 'Buy Now' button. Floating Reddit logos.",
                audio_cue: "Upbeat electronic synth loop.",
                text_overlay: "STEP 1: PRE-SELL FIRST"
              },
              {
                timestamp: "0:25 - 0:45",
                dialogue: "Once you get those signups, use a boilerplate like Next.js to deploy a landing page in 24 hours. The goal is validation, not perfection.",
                visual_cue: "Fast-paced editing showcasing Next.js code structure compiling to a beautiful landing page.",
                audio_cue: "Keyboard typing sounds synced to the beat.",
                text_overlay: "STEP 2: BOILERPLATE SPEED"
              },
              {
                timestamp: "0:45 - 0:50",
                dialogue: "Subscribe if you want the exact boilerplate template I used to launch this!",
                visual_cue: "Looming pointer finger clicking a shiny subscribe button animation with glowing sparkles.",
                audio_cue: "High-pitched ding/chime chime.",
                text_overlay: "GET TEMPLATE BELOW!"
              }
            ],
            tips: [
              "Add a high-contrast yellow overlay on 'THE 99% FAIL!' to capture viewers scrolling on mobile.",
              "Ensure your dialogue during Step 1 has fast jump-cuts every 2.5 seconds to maximize retention.",
              "Include a pinned comment with your boilerplate link as soon as you publish."
            ]
          },
          {
            id: 2,
            title: "Reddit is a Goldmine for SaaS Ideas",
            timestamp_range: "04:30 - 05:15",
            hook_strength: 88,
            estimated_ctr: "8.4%",
            scenes: [
              {
                timestamp: "0:00 - 0:04",
                dialogue: "Stop racking your brain for SaaS ideas. Just go to Reddit and search for this one word...",
                visual_cue: "Close-up profile shot of the speaker typing on a laptop, screen glow reflecting on their glasses.",
                audio_cue: "Deep bass hum representing suspense.",
                text_overlay: "FIND SAAS IDEAS FAST"
              },
              {
                timestamp: "0:04 - 0:20",
                dialogue: "Type in 'how do I' or 'is there an app for' inside subreddits like entrepreneur, startup, or marketing. You will find hundreds of people begging for software solutions.",
                visual_cue: "Zoomed screen recording scrolling through a Reddit thread with highlighted pain points.",
                audio_cue: "Rhythmic ticking clock sound effect.",
                text_overlay: "SEARCH THESE WORDS 🔍"
              },
              {
                timestamp: "0:20 - 0:40",
                dialogue: "Build a micro-SaaS that does exactly that one thing. No extra features, just solve their exact problem. Charge $10 a month. Do this 5 times, and you have passive income.",
                visual_cue: "Simple vector illustration of a funnel leading from Reddit comments to cash stacks.",
                audio_cue: "Upbeat synth groove builds up.",
                text_overlay: "MICRO-SAAS FORMULA 💸"
              },
              {
                timestamp: "0:40 - 0:45",
                dialogue: "Follow me for more low-code SaaS tricks!",
                visual_cue: "Creator avatar sliding into center view with confetti animation overlay.",
                audio_cue: "Pop sound effect.",
                text_overlay: "FOLLOW FOR MORE!"
              }
            ],
            tips: [
              "Use a red highlight arrow pointing to the Reddit search bar on screen to direct focus.",
              "Sync sound effects to every new text overlay appearance.",
              "Keep the background music minimal during the 'search words' portion for high clarity."
            ]
          },
          {
            id: 3,
            title: "Why Code is the Slowest Part of SaaS",
            timestamp_range: "12:00 - 12:50",
            hook_strength: 91,
            estimated_ctr: "8.8%",
            scenes: [
              {
                timestamp: "0:00 - 0:05",
                dialogue: "If you think coding is the most important part of your startup, you are already behind.",
                visual_cue: "Cinematic shot of the speaker looking directly at the lens, shaking their head with a serious expression.",
                audio_cue: "Violin sweep building up tension.",
                text_overlay: "CODING IS A TRAP ❌"
              },
              {
                timestamp: "0:05 - 0:25",
                dialogue: "Marketing is 80% of the battle. You can have the best code in the world, but if nobody knows you exist, your revenue is zero. Use AI boilerplates or no-code tools to launch first.",
                visual_cue: "Comparison graphic on screen: 'Code (20%)' vs 'Marketing & Sales (80%)' with flashing neon rings.",
                audio_cue: "Swoosh sound effect on graphic change.",
                text_overlay: "80% IS MARKETING"
              },
              {
                timestamp: "0:25 - 0:45",
                dialogue: "Focus on making content, SEO, and cold outreach. That is how you hit $10k a month. Let the code follow the sales.",
                visual_cue: "Visual footage of a dashboard showing stripe notifications popping up rapidly.",
                audio_cue: "Stripe notification sounds ('ka-ching!') ringing repeatedly.",
                text_overlay: "SALES FIRST, CODE LATER"
              },
              {
                timestamp: "0:45 - 0:50",
                dialogue: "Drop a comment if you're building a SaaS right now!",
                visual_cue: "Subtle zoom out of the creator pointing downwards to the comment section.",
                audio_cue: "Soft transition swoosh.",
                text_overlay: "WHAT ARE YOU BUILDING?"
              }
            ],
            tips: [
              "Use the Stripe sound effects at the 35s mark to keep viewer retention high till the CTA.",
              "Make sure the 'CODING IS A TRAP' overlay is in a bold sans-serif font.",
              "Reply to every comment within the first 1 hour to trigger the algorithm recommendation loop."
            ]
          }
        ]
      };
      return {
        content: JSON.stringify(mockJson, null, 2),
        tokens: 650,
        model: "mock-video-repurpose",
        provider: "gemini",
      };
    } else {
      const mockJson = {
        original_analysis: "High-performing advice on building digital leverage and business systems.",
        repurposed: [
          {
            platform: "twitter",
            format: "thread",
            content: "🧵 1/5: Coding is a trap for founders.\n\nMost startups fail not because their code was bad, but because nobody knew they existed.\n\nHere is how to structure your build for sales-first growth 👇",
            hashtags: ["buildinpublic", "saas", "solopreneur"],
            posting_time: "Tuesday, 9:00 AM",
            tips: "Hook gets curiosity, body delivers value immediately. Keep line breaks wide."
          },
          {
            platform: "linkedin",
            format: "professional_post",
            content: "I used to think code was 80% of a SaaS.\n\nAfter launches that yielded $0 in revenue, I realized marketing and distribution make or break you.\n\nNow, I pre-sell before coding a single feature. Do validation first.",
            hashtags: ["startups", "entrepreneurship", "technology"],
            posting_time: "Wednesday, 8:15 AM",
            tips: "Start with a short punchy hook, use double-spaced paragraphs to maximize mobile dwell time."
          }
        ],
        content_calendar_suggestion: "Publish the Twitter thread on Tuesday, follow up with the Linkedin post on Wednesday morning, and send an email digest summary on Thursday."
      };
      return {
        content: JSON.stringify(mockJson, null, 2),
        tokens: 350,
        model: "mock-text-repurpose",
        provider: "gemini",
      };
    }
  }

  if (_systemPrompt.includes("THUMBNAIL") || _systemPrompt.includes("thumbnail") || _systemPrompt.includes("image_generation_prompt")) {
    const mockJson = {
      image_prompt: `Ultra-high-energy YouTube thumbnail in MrBeast style. A young creator with a shocked wide-eyed expression and open mouth on the left 60% of the frame. Dramatic high-contrast rim lighting wrapping the face. Bold explosive background with electric yellow and deep red. Background features a glowing neon blue AI code dashboard with depth blur. Color palette: electric yellow, deep red, and neon blue. 8K resolution, cinematic composition, rule of thirds framing, ultra detailed skin texture, explosive chaotic energy. Inspired by: "${userPrompt.replace(/\n/g, " ")}". YouTube thumbnail style, ultra high resolution, 16:9 aspect ratio, no text in image`,
      text_overlay: "I TRIED THIS",
      text_color: "#FFFFFF",
      text_position: "bottom",
    };

    return {
      content: JSON.stringify(mockJson, null, 2),
      tokens: 250,
      model: "mock-thumbnail",
      provider: "gemini",
    };
  }

  if (_systemPrompt.includes("VIRAL_SCORE") || _systemPrompt.includes("virality_score") || _systemPrompt.includes("retention_prediction")) {
    const mockJson = {
      virality_score: Math.floor(Math.random() * 20) + 75, // 75 to 95
      ctr_prediction: parseFloat((Math.random() * 4 + 7.5).toFixed(1)), // 7.5 to 11.5%
      emotional_score: Math.floor(Math.random() * 15) + 75,
      emotional_breakdown: {
        happiness: Math.floor(Math.random() * 30) + 30,
        surprise: Math.floor(Math.random() * 25) + 60,
        anger: Math.floor(Math.random() * 15) + 5,
        sadness: Math.floor(Math.random() * 10) + 5,
        curiosity: Math.floor(Math.random() * 15) + 80,
        urgency: Math.floor(Math.random() * 20) + 65
      },
      retention_prediction: [
        100,
        Math.floor(Math.random() * 5) + 85, // 85-90
        Math.floor(Math.random() * 5) + 75, // 75-80
        Math.floor(Math.random() * 5) + 68, // 68-73
        Math.floor(Math.random() * 5) + 64, // 64-69
        Math.floor(Math.random() * 5) + 60, // 60-65
        Math.floor(Math.random() * 5) + 58, // 58-63
        Math.floor(Math.random() * 5) + 55, // 55-60
        Math.floor(Math.random() * 5) + 52, // 52-57
        Math.floor(Math.random() * 5) + 48  // 48-53
      ],
      audience_psychology: [
        {
          trigger: "Cognitive Curiosity Gap",
          reaction: "Immediate focus & click within 1.2 seconds of scrolling.",
          effect: "Unresolved narrative tension triggers standard dopaminergic response."
        },
        {
          trigger: "Complementary Contrast Overlays",
          reaction: "Subconscious reading of typography before background details.",
          effect: "Reduces initial visual load, accelerating clicking commitment."
        },
        {
          trigger: "Urgent Pacing Anchor",
          reaction: "Minimal swipe-away drop-off at the critical 10-second mark.",
          effect: "Fast visual cuts and rhythmic audio triggers sustain adrenaline levels."
        }
      ],
      breakdown: {
        hook: Math.floor(Math.random() * 15) + 80,
        shareability: Math.floor(Math.random() * 15) + 75,
        relatability: Math.floor(Math.random() * 15) + 70,
        timeliness: Math.floor(Math.random() * 15) + 80,
        platform_fit: Math.floor(Math.random() * 15) + 80,
        thumbnail_contrast: Math.floor(Math.random() * 15) + 75
      },
      verdict: "Outstanding viral forecast. Excellent alignment between title curiosity cues and script visual triggers. Predicted performance exceeds benchmark averages.",
      improvements: [
        "Simplify the hook phrasing slightly to improve immediate reader comprehension.",
        "Add a visual signature transition or pattern interrupt exactly at the 5-second checkpoint.",
        "Increase contrast values of thumbnail focal points to pop the subject outline."
      ]
    };

    return {
      content: JSON.stringify(mockJson, null, 2),
      tokens: 280,
      model: "mock-viral-score",
      provider: "gemini",
    };
  }

  if (_systemPrompt.includes("TREND") || _systemPrompt.includes("trend")) {
    const isCompetitor = userPrompt.includes("competitor") || userPrompt.includes("competitorHandle") || userPrompt.includes("@");
    if (isCompetitor) {
      const match = userPrompt.match(/@\w+/);
      const handle = match ? match[0] : "@techcreator";
      const mockJson = {
        competitor: {
          handle,
          niche: "AI Coding & Tech Product Reviews",
          subscribers: "1.4M Subscribers",
          avg_views: "480K views/video"
        },
        top_videos: [
          {
            title: "I Let AI Code a Full SaaS Product in 1 Hour (Mind-blown)",
            views: "2.1M views",
            upload_date: "10 days ago",
            ctr_estimate: "11.8%",
            hook_analysis: "High emotional curiosity hook combined with visual urgency (timer overlay). Direct pattern interrupt.",
            iteration_suggestions: [
              "I Built a Profitable Chrome Extension in 45 Minutes Using AI",
              "I Forced AI to Build and Launch My Mobile App (Day 1 Profit)"
            ]
          },
          {
            title: "Stop Learning Python in 2026. Do This Instead!",
            views: "1.2M views",
            upload_date: "3 weeks ago",
            ctr_estimate: "10.2%",
            hook_analysis: "Controversial shock angle. Direct myth-busting statement targeting standard dev conventions.",
            iteration_suggestions: [
              "Stop Building Portfolios. Do This to Get AI Dev Jobs Fast!",
              "Is Coding Dead? The Brutal Truth for 2026 Beginners"
            ]
          },
          {
            title: "10 AI Tools That Feel Illegal to Know (Dev Edition)",
            views: "950K views",
            upload_date: "1 month ago",
            ctr_estimate: "9.4%",
            hook_analysis: "Exclusivity-based trigger ('illegal to know') combined with utility value listing.",
            iteration_suggestions: [
              "7 Secret AI APIs That Do the Coding for You",
              "My Secret Stack of AI Tools That Saves Me 30 Hours a Week"
            ]
          }
        ]
      };
      return {
        content: JSON.stringify(mockJson, null, 2),
        tokens: 450,
        model: "mock-competitor-spy",
        provider: "gemini",
      };
    } else {
      const mockJson = {
        niche: "Tech Reviews India",
        platform: "YouTube",
        trend_score: 88,
        trend_summary: "AI-powered tools and budget smartphone comparisons are dominating the Indian tech YouTube space right now. Creators who combine Hindi narration with data-driven comparisons are seeing 3x higher average view duration.",
        trending_topics: [
          {
            topic: "Best Budget AI Smartphones Under ₹15,000 in 2026",
            why_trending: "MediaTek Dimensity 7350 launch pushed budget AI phone competition into overdrive this month.",
            content_angle: "Blind test: Can a ₹12,000 phone AI camera beat the iPhone 15 in real-world shots?",
            estimated_views: "High",
            urgency: "Post Now"
          },
          {
            topic: "ChatGPT vs Gemini — Which AI Wins for Indian Students?",
            why_trending: "Board exam season drives massive search volume for AI study tools among 16-22 year olds.",
            content_angle: "Use both AIs to solve actual Class 12 board exam questions and score them live.",
            estimated_views: "High",
            urgency: "Post Now"
          },
          {
            topic: "OnePlus 13 vs Samsung S25 — Real World 30 Day Test",
            why_trending: "Both flagships dropped within 6 weeks of each other triggering comparison search spikes.",
            content_angle: "Day 30 honest review: 5 things OnePlus does better + 3 things Samsung wins.",
            estimated_views: "High",
            urgency: "This Week"
          },
          {
            topic: "How I Set Up My ₹50,000 YouTube Studio in India",
            why_trending: "Creator economy growth is pushing mid-tier creators to invest in production quality.",
            content_angle: "Exact Amazon India links, actual prices, what I would do differently for ₹30K budget.",
            estimated_views: "Medium",
            urgency: "This Week"
          },
          {
            topic: "5G Router vs Fiber Broadband — Which is Actually Faster in India?",
            why_trending: "Jio and Airtel 5G home broadband expansion is creating massive buyer confusion.",
            content_angle: "Speed test in 3 Indian cities over 7 days — real data, no sponsored bias.",
            estimated_views: "Medium",
            urgency: "This Month"
          }
        ],
        trending_formats: [
          {
            format: "Versus Long Form (15-20 min)",
            why_working: "Indian tech viewers spend 40% more time on comparison videos because they research before buying.",
            example_title: "Realme GT 6T vs Poco F6 Pro — I Used Both for 30 Days (Honest Review)"
          },
          {
            format: "YouTube Shorts — Quick Tips",
            why_working: "60-second spec comparisons get 5x shares from budget buyers forwarding to family before purchase.",
            example_title: "The ONE feature that makes this ₹8000 phone worth it 🔥"
          },
          {
            format: "Series — Best of Month",
            why_working: "Monthly roundup series drive consistent subscriber return rate above 60% in tech niche.",
            example_title: "5 Best Tech Buys This Month (June 2026) — Under ₹10K, ₹20K, ₹50K"
          }
        ],
        best_posting_times: {
          days: ["Tuesday", "Wednesday", "Saturday"],
          time: "7 PM to 10 PM IST",
          reason: "Indian tech viewers are active after work and dinner on weekdays, with Saturday evening being the highest watch-time window for purchase research videos."
        },
        trending_keywords: [
          "budget smartphone 2026",
          "best phone under 15000",
          "AI camera test India",
          "5G phone review Hindi",
          "tech unboxing India"
        ],
        content_gaps: [
          "Gap 1 — No creator is doing honest long-term durability tests (6 month reviews) for Indian budget phones — audience asks this in every comment section",
          "Gap 2 — Zero coverage of gaming performance on budget phones for BGMI and Free Fire at India-specific server conditions",
          "Gap 3 — Software update track record comparisons — Indian buyers don't know which brands give 3+ years of Android updates"
        ],
        niche_health: {
          competition_level: "Very High",
          growth_potential: "High",
          monetization_potential: "Very High",
          audience_size: "Massive"
        },
        pro_tip: "Add a pinned comment with an Amazon India affiliate product table immediately after uploading — tech review viewers have the highest purchase intent within 2 hours of watching, and a pinned affiliate link converts 3x better than description links alone."
      };
      return {
        content: JSON.stringify(mockJson, null, 2),
        tokens: 380,
        model: "mock-trends",
        provider: "gemini",
      };
    }
  }

  return {
    content: `[Mock AI Response]\n\nBased on your input: "${userPrompt.slice(0, 100)}..."\n\n1. 🔥 Hook #1: "Yeh video dekhne ke baad aapki zindagi badal jayegi..."\n2. 💡 Hook #2: "Maine ₹0 se ₹10 lakh kamaye — yeh hai formula"\n3. 🚀 Hook #3: "99% log yeh galti karte hain..."\n4. 😱 Hook #4: "Aapko yeh pehle kyun nahi bataya?"\n5. 🎯 Hook #5: "Sirf 5 minute mein seekho..."\n\n---\n*Generated by CreatorOS AI (Mock Mode)*`,
    tokens: 150,
    model: "mock",
    provider: "gemini",
  };
}
