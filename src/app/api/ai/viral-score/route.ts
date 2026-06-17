import { NextResponse } from "next/server";
import { handleAIGeneration } from "@/lib/ai/route-helper";
import { SYSTEM_PROMPTS } from "@/lib/ai/prompts";
import { handleRouteError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, hook, script, thumbnailText, platform, sourceContent } = body;
    
    if (!platform || (!sourceContent && !title && !hook && !script && !thumbnailText)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let userPrompt = "";
    if (title || hook || script || thumbnailText) {
      userPrompt = `Title: ${title || "N/A"}\nHook: ${hook || "N/A"}\nScript Draft: ${script || "N/A"}\nThumbnail Text: ${thumbnailText || "N/A"}\nPlatform: ${platform}`;
    } else {
      userPrompt = `Content to Analyze:\n${sourceContent}\nPlatform: ${platform}`;
    }

    return await handleAIGeneration({
      type: "VIRAL_SCORE",
      systemPrompt: SYSTEM_PROMPTS.VIRAL_SCORE,
      userPrompt,
      platform,
      inputData: body,
    });
  } catch (error: any) {
    return handleRouteError(error, "Viral score generation error");
  }
}
