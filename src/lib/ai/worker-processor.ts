import { db } from "@/lib/prisma";
import { generateAI, generateMock } from "./provider";
import { SYSTEM_PROMPTS } from "./prompts";
import type { GenerationType } from "@/types/ai";

export interface ProcessJobOptions {
  userId: string;
  type: string;
  payload: any;
  platform?: string;
  language?: string;
  dbJobId: string;
}

export async function processJobDirectly({
  userId,
  type,
  payload,
  platform,
  language,
  dbJobId,
}: ProcessJobOptions) {
  console.log(`[AI Worker Processor] Processing job ${dbJobId} of type ${type} for user ${userId}`);

  // 1. Resolve prompts based on generation type and payload
  let systemPrompt = "";
  let userPrompt = "";
  const resolvedPlatform = platform || payload.platform || payload.targetPlatform || "";
  const resolvedLanguage = language || payload.language || "en";

  switch (type) {
    case "VIRAL_HOOK":
      systemPrompt = SYSTEM_PROMPTS.VIRAL_HOOK;
      userPrompt = `Topic: ${payload.topic || ""}\nPlatform: ${resolvedPlatform}\nTone: ${payload.tone || ""}`;
      break;

    case "CAPTION":
      systemPrompt = SYSTEM_PROMPTS.CAPTION
        .replace("{{topic}}", payload.topic || "")
        .replace("{{platform}}", resolvedPlatform)
        .replace("{{tone}}", payload.tone || "")
        .replace("{{language}}", resolvedLanguage);
      userPrompt = `Topic: ${payload.topic || ""}\nPlatform: ${resolvedPlatform}\nTone: ${payload.tone || ""}\nLanguage: ${resolvedLanguage}`;
      break;

    case "SCRIPT":
      systemPrompt = SYSTEM_PROMPTS.SCRIPT;
      const duration = payload.duration || "30s";
      userPrompt = `Topic: ${payload.topic || ""}\nDuration: ${duration}\nPlatform: ${resolvedPlatform}\nLanguage: ${resolvedLanguage}${
        payload.additionalContext ? `\nAdditional Context: ${payload.additionalContext}` : ""
      }\n\nGenerate a ${duration} ${resolvedPlatform} script in ${resolvedLanguage} language mode.`;
      break;

    case "THUMBNAIL":
      systemPrompt = SYSTEM_PROMPTS.THUMBNAIL;
      const selectedMode = payload.mode || payload.tone || "cinematic";
      userPrompt = `Topic/Concept: ${payload.topic || ""}\nCreative Mode: ${selectedMode}${
        payload.additionalContext ? `\nAdditional Context: ${payload.additionalContext}` : ""
      }`;
      break;

    case "TREND":
      if (payload.competitorHandle) {
        systemPrompt = `You are a social media research specialist and competitive intelligence analyst. Analyze the competitor's social media handle, profile metrics, and their top performing content. Extract their top 3 viral videos, dissect the psychology of their hooks, and generate 2 higher-converting iteration suggestions for each.
        
        OUTPUT FORMAT:
        You MUST return a JSON object with the following structure:
        {
          "competitor": {
            "handle": "string (the competitor handle)",
            "niche": "string (their content category)",
            "subscribers": "string (estimated audience size)",
            "avg_views": "string (estimated average views/reach)"
          },
          "top_videos": [
            {
              "title": "string (viral video title)",
              "views": "string (e.g. '1.5M views')",
              "upload_date": "string (recency)",
              "ctr_estimate": "string (estimated CTR range, e.g. '10.5%')",
              "hook_analysis": "string (why the hook/angle succeeded)",
              "iteration_suggestions": string[] (2 high-ctr title/concept iterations based on their hook structure)
            }
          ]
        }`;
        userPrompt = `Analyze competitor: ${payload.competitorHandle}\nPlatform: ${resolvedPlatform}`;
      } else {
        systemPrompt = SYSTEM_PROMPTS.TREND;
        userPrompt = `Niche: ${payload.niche || ""}\nPlatform: ${resolvedPlatform}`;
      }
      break;

    case "VIRAL_SCORE":
      systemPrompt = SYSTEM_PROMPTS.VIRAL_SCORE;
      if (payload.title || payload.hook || payload.script || payload.thumbnailText) {
        userPrompt = `Title: ${payload.title || "N/A"}\nHook: ${payload.hook || "N/A"}\nScript Draft: ${payload.script || "N/A"}\nThumbnail Text: ${payload.thumbnailText || "N/A"}\nPlatform: ${resolvedPlatform}`;
      } else {
        userPrompt = `Content to Analyze:\n${payload.sourceContent || ""}\nPlatform: ${resolvedPlatform}`;
      }
      break;

    case "REPURPOSE":
      if (payload.youtubeUrl) {
        systemPrompt = `You are an elite video content architect and viral editor. Your role is to analyze a YouTube video concept/URL and extract 3 highly optimized, ready-to-film short-form scripts (repurposed from the video) with timestamps directly parsed from the video content.
        
        OUTPUT FORMAT:
        You MUST return a JSON object with the following structure:
        {
          "original_video": {
            "title": "string (estimated title based on topic/url)",
            "url": "string (the input youtubeUrl)"
          },
          "shorts": [
            {
              "id": number (1, 2, or 3),
              "title": "string (catchy short title)",
              "timestamp_range": "string (estimated timestamp range, e.g. '01:15 - 02:05')",
              "hook_strength": number (0-100),
              "estimated_ctr": "string (e.g. '9.2%')",
              "scenes": [
                {
                  "timestamp": "string (e.g. '0:00 - 0:05')",
                  "dialogue": "string (spoken dialogue/voiceover)",
                  "visual_cue": "string (B-roll, visual framing, or camera direction)",
                  "audio_cue": "string (music, sound effects, ambient cues)",
                  "text_overlay": "string (captions on screen)"
                }
              ],
              "tips": string[] (design/editing guidelines)
            }
          ]
        }`;
        userPrompt = `Repurpose this YouTube video: ${payload.youtubeUrl}\nTarget Platform: ${resolvedPlatform}\nTone/Style: ${payload.tone || ""}`;
      } else {
        systemPrompt = SYSTEM_PROMPTS.REPURPOSE;
        userPrompt = `Source Content:\n${payload.sourceContent || ""}\nTarget Platform: ${resolvedPlatform}\nTone/Style: ${payload.tone || ""}`;
      }
      break;

    default:
      throw new Error(`Unsupported generation type: ${type}`);
  }

  // 2. Generate content (check API key availability just like route-helper)
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
    throw new Error("AI Service Configuration Error: Missing Google Gemini API Key on server.");
  }

  console.log("[AI Worker Processor] Calling generateAI with sequential failovers.");
  const aiResult = await generateAI(systemPrompt, userPrompt, { userId });
  content = aiResult.content;
  tokens = aiResult.tokens;
  modelName = aiResult.model;

  // 3. Parse viral score if present
  let viralScore: number | undefined;
  try {
    const cleanContent = content.trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(cleanContent);
    if (typeof parsed.overall_score === "number") {
      viralScore = parsed.overall_score;
    } else if (typeof parsed.virality_score === "number") {
      viralScore = parsed.virality_score;
    } else if (typeof parsed.ctr_score === "number") {
      viralScore = parsed.ctr_score;
    } else if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0].score === "number") {
      const scores = parsed.map((p: any) => p.score).filter((s: any) => typeof s === "number");
      if (scores.length > 0) {
        viralScore = Math.max(...scores) * 10;
      }
    } else if (parsed.hooks && Array.isArray(parsed.hooks)) {
      const scores = parsed.hooks.map((p: any) => p.score).filter((s: any) => typeof s === "number");
      if (scores.length > 0) {
        viralScore = Math.max(...scores) * 10;
      }
    }
  } catch {
    // Non-critical parsing failure
  }

  // 4. Update user credits and save generation record inside transaction
  await db.$transaction(async (tx: any) => {
    // Increment credits used
    await tx.user.update({
      where: { id: userId },
      data: {
        creditsUsed: {
          increment: 1,
        },
      },
    });

    // Create generation record
    await tx.generation.create({
      data: {
        userId,
        type: type as any,
        input: payload,
        output: content,
        viralScore,
        tokens,
        platform: resolvedPlatform,
        language: resolvedLanguage,
      },
    });
  });

  return content;
}
