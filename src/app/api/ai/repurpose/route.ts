import { NextResponse } from "next/server";
import { handleAIGeneration } from "@/lib/ai/route-helper";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts";
import { handleRouteError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sourceContent, youtubeUrl, targetPlatform, tone, prompt } = body;
    if (!prompt && ((!sourceContent && !youtubeUrl) || !targetPlatform || !tone)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let userPrompt = "";
    let systemPrompt: string = SYSTEM_PROMPTS.REPURPOSE;

    if (prompt) {
      systemPrompt = "You are an expert content repurposing strategist and copywriter. Return only the JSON object.";
      userPrompt = prompt;
    } else if (youtubeUrl) {
      systemPrompt = `You are an expert content repurposing strategist specializing in extracting viral short-form content from long-form YouTube videos.

The user will provide:
- YOUTUBE_URL: the YouTube video URL
- TARGET_PLATFORM: one of (YouTube Shorts / Instagram Reels / TikTok Video)
- VOICE_TONE: one of (Storytelling / Informative / Motivational / Shocking / Humorous / Controversial / Inspirational / Casual)

Based on the YouTube URL provided, analyze the video topic from the URL itself and generate complete repurposed short-form content.

Return ONLY a valid JSON object. No preamble, no explanation, no markdown, no backticks.

Return this exact structure:

{
  "youtube_url": "url as provided by user",
  "detected_topic": "Topic detected from the YouTube URL or video ID",
  "target_platform": "must match user selected platform exactly",
  "voice_tone": "must match user selected tone exactly",
  "short_clips": [
    {
      "clip_number": 1,
      "title": "Viral short title for this clip",
      "hook": "Opening line for this short, max 15 words, scroll stopping",
      "script": "Complete short script, written naturally for speaking out loud",
      "duration": "15 to 30 seconds or 30 to 60 seconds",
      "best_moment": "Describe which part of the original video to clip",
      "cta": "Call to action at the end of this short"
    },
    {
      "clip_number": 2,
      "title": "Viral short title for this clip",
      "hook": "Opening line for this short, max 15 words, scroll stopping",
      "script": "Complete short script, written naturally for speaking out loud",
      "duration": "15 to 30 seconds or 30 to 60 seconds",
      "best_moment": "Describe which part of the original video to clip",
      "cta": "Call to action at the end of this short"
    },
    {
      "clip_number": 3,
      "title": "Viral short title for this clip",
      "hook": "Opening line for this short, max 15 words, scroll stopping",
      "script": "Complete short script, written naturally for speaking out loud",
      "duration": "15 to 30 seconds or 30 to 60 seconds",
      "best_moment": "Describe which part of the original video to clip",
      "cta": "Call to action at the end of this short"
    }
  ],
  "caption": "Ready to post caption for the short on target platform",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
  "best_time_to_post": "e.g. Tuesday to Thursday 7 PM to 9 PM IST",
  "platform_tip": "One specific tip for this platform to maximize views on the short",
  "repurpose_strategy": "One sentence explaining the overall repurposing strategy used"
}

PLATFORM RULES:
- YouTube Shorts = fast paced, strong hook first 2 seconds, subscribe CTA, max 60 seconds
- Instagram Reels = aesthetic energy, save and share CTA, trending audio suggestion in platform_tip
- TikTok Video = FYP optimized, duet or stitch potential, sound trend mention in platform_tip, first 2 seconds critical

VOICE TONE RULES:
- Storytelling = narrative arc, beginning middle end, personal feel
- Informative = facts first, clear structure, educational value
- Motivational = power words, action driving, uplifting energy
- Shocking = bold unexpected statements, pattern interrupt, jaw drop moment
- Humorous = witty, playful, light sarcasm, relatable jokes
- Controversial = strong opinion, challenge common belief, debate sparking
- Inspirational = emotional journey, uplifting transformation, hope driven
- Casual = friendly everyday language, like talking to a friend, conversational

HASHTAG RULES:
- YouTube Shorts = 3 to 5 hashtags
- Instagram Reels = 5 to 10 hashtags
- TikTok Video = 3 to 5 hashtags

SHORT CLIPS RULES:
- Generate exactly 3 clip ideas
- Each clip must have a completely different angle and hook
- Scripts must feel natural when spoken out loud
- Duration must match platform: Shorts and Reels prefer 30 to 60 seconds, TikTok 15 to 60 seconds

STRICT RULES:
- Return ONLY the JSON object, nothing else
- Every field must be filled, never empty or null
- short_clips must have exactly 3 items
- hashtags must follow platform rules above
- Do not add any text before or after the JSON object`;
      userPrompt = `YOUTUBE_URL: ${youtubeUrl}\nTARGET_PLATFORM: ${targetPlatform}\nVOICE_TONE: ${tone}`;
    } else {
      userPrompt = `Source Content:\n${sourceContent}\nTarget Platform: ${targetPlatform}\nTone/Style: ${tone}`;
    }

    return await handleAIGeneration({
      type: "REPURPOSE",
      systemPrompt,
      userPrompt,
      platform: targetPlatform || "Twitter/X",
      inputData: body,
      options: {
        maxTokens: 3000,
      },
    });
  } catch (error: any) {
    return handleRouteError(error, "Repurpose content error");
  }
}
