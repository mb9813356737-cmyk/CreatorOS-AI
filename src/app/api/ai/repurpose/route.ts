import { NextResponse } from "next/server";
import { handleAIGeneration } from "@/lib/ai/route-helper";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts";
import { handleRouteError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sourceContent, youtubeUrl, targetPlatform, tone } = body;
    if ((!sourceContent && !youtubeUrl) || !targetPlatform || !tone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let userPrompt = "";
    let systemPrompt: string = SYSTEM_PROMPTS.REPURPOSE;

    if (youtubeUrl) {
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
            "tips": string[] (3 design/editing guidelines)
          }
        ]
      }`;
      userPrompt = `Repurpose this YouTube video: ${youtubeUrl}\nTarget Platform: ${targetPlatform}\nTone/Style: ${tone}`;
    } else {
      userPrompt = `Source Content:\n${sourceContent}\nTarget Platform: ${targetPlatform}\nTone/Style: ${tone}`;
    }

    return await handleAIGeneration({
      type: "REPURPOSE",
      systemPrompt,
      userPrompt,
      platform: targetPlatform,
      inputData: body,
      options: {
        maxTokens: 3000,
      },
    });
  } catch (error: any) {
    return handleRouteError(error, "Repurpose content error");
  }
}
