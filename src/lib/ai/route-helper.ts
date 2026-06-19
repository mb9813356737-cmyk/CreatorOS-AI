import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { db } from "@/lib/prisma";
import { generateAI, generateMock } from "./provider";
import { checkRateLimit } from "./rate-limiter";
import { RATE_LIMITS, PLANS } from "@/lib/constants";
import type { GenerationType } from "@/types/ai";
import { getSystemSettings } from "@/lib/system-settings";
import { handleRouteError } from "@/lib/errors";

export async function handleAIGeneration({
  type,
  systemPrompt,
  userPrompt,
  platform,
  language,
  inputData,
}: {
  type: GenerationType;
  systemPrompt: string;
  userPrompt: string;
  platform?: string;
  language?: string;
  inputData: any;
}) {
  try {
    // Check maintenance mode
    const settings = await getSystemSettings();
    if (settings.maintenanceMode) {
      return NextResponse.json(
        { error: "CreatorOS AI is currently undergoing scheduled maintenance. Please try again shortly." },
        { status: 503 }
      );
    }

    // 1. Auth check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch User & check credits
    let user;
    let dbOffline = false;
    try {
      user = await db.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    } catch (dbErr) {
      console.warn("Database connection issue in AI route-helper. Using mock session:", dbErr);
      dbOffline = true;
      user = {
        id: "mock-user-id",
        clerkId: userId,
        plan: "PRO",
        monthlyCredits: 500,
        creditsUsed: 0,
      };
    }

    // Check plan limits
    const userPlan = (user.plan || "FREE") as keyof typeof PLANS;
    const planConfig = PLANS[userPlan] || PLANS.FREE;
    const isAllowed = planConfig.limits[type as keyof typeof planConfig.limits];

    if (!isAllowed) {
      return NextResponse.json(
        { error: "This feature is not available on your current plan. Please upgrade to access it." },
        { status: 403 }
      );
    }

    // Check credits
    const isUnlimited = user.monthlyCredits === -1;
    if (!isUnlimited && user.creditsUsed >= user.monthlyCredits) {
      return NextResponse.json(
        { error: "No credits remaining. Please upgrade your plan." },
        { status: 403 }
      );
    }

    // 3. Rate Limit check
    const rateLimitConfig = RATE_LIMITS[user.plan as keyof typeof RATE_LIMITS] || RATE_LIMITS.FREE;
    const rateLimitResult = await checkRateLimit(user.id, rateLimitConfig);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a moment." },
        { status: 429 }
      );
    }

    // 4. Generate content
    let content: string;
    let tokens: number;
    let modelName: string;

    const rawKey =
      process.env.AI_PROVIDER === "gemini"
        ? process.env.GOOGLE_GENERATIVE_AI_KEY
        : process.env.AI_PROVIDER === "groq"
        ? process.env.GROQ_API_KEY
        : process.env.OPENAI_API_KEY;

    const providerKeyDefined = !!rawKey && !rawKey.includes("placeholder") && rawKey !== "";

    if (!providerKeyDefined) {
      return NextResponse.json(
        { error: "AI Generation is unavailable: Missing API credentials on the server. Please configure GOOGLE_GENERATIVE_AI_KEY." },
        { status: 500 }
      );
    }

    // Real API mode
    const aiResult = await generateAI(systemPrompt, userPrompt);
    content = aiResult.content;
    tokens = aiResult.tokens;
    modelName = aiResult.model;

    // Attempt to parse out viralScore if it exists in the JSON output
    let viralScore: number | undefined;
    try {
      const cleanContent = content.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(cleanContent);
      if (typeof parsed.overall_score === "number") {
        viralScore = parsed.overall_score;
      } else if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0].score === "number") {
        // For hooks, compute average score or use max score
        const scores = parsed.map((p: any) => p.score).filter((s) => typeof s === "number");
        if (scores.length > 0) {
          viralScore = Math.max(...scores) * 10; // scale 1-10 to 1-100
        }
      }
    } catch {
      // Non-critical parsing failure
    }

    // 5. Update user credit usage and save generation in transaction
    let generationId = crypto.randomUUID();
    if (!dbOffline) {
      try {
        const generation = await db.$transaction(async (tx: any) => {
          // Increment credits used
          await tx.user.update({
            where: { id: user.id },
            data: {
              creditsUsed: {
                increment: 1,
              },
            },
          });

          // Create generation record
          return await tx.generation.create({
            data: {
              userId: user.id,
              type,
              input: inputData,
              output: content,
              viralScore,
              tokens,
              platform,
              language,
            },
          });
        });
        generationId = generation.id;
      } catch (dbTxErr) {
        console.warn("Failed to write generation log to database:", dbTxErr);
      }
    }

    return NextResponse.json({
      id: generationId,
      output: content,
      viralScore,
      tokens,
    });
  } catch (error: any) {
    return handleRouteError(error, "AI Generation route error");
  }
}
